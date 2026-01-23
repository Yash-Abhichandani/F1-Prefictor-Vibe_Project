"""
F1 Apex Live Telemetry Service
OpenF1 API Integration for real-time race data.

This module provides endpoints that proxy OpenF1's live data feeds,
adding caching and normalization for the Next.js frontend.
"""

import os
import httpx
from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
from functools import lru_cache
import asyncio

# OpenF1 Base URL
OPENF1_BASE = "https://api.openf1.org/v1"

# Create router
router = APIRouter(prefix="/live", tags=["Live Telemetry"])

# Simple in-memory cache with TTL
_cache: Dict[str, tuple[Any, datetime]] = {}

def cache_get(key: str, ttl_seconds: int = 5) -> Optional[Any]:
    """Get from cache if not expired."""
    if key in _cache:
        data, timestamp = _cache[key]
        if datetime.now() - timestamp < timedelta(seconds=ttl_seconds):
            return data
    return None

def cache_set(key: str, data: Any):
    """Set cache with timestamp."""
    _cache[key] = (data, datetime.now())


# =============================================================================
# OPENF1 API HELPERS
# =============================================================================

async def fetch_openf1(endpoint: str, params: Optional[Dict] = None) -> Any:
    """Fetch data from OpenF1 API with error handling."""
    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            url = f"{OPENF1_BASE}/{endpoint}"
            response = await client.get(url, params=params)
            response.raise_for_status()
            return response.json()
        except httpx.HTTPStatusError as e:
            raise HTTPException(status_code=e.response.status_code, detail=f"OpenF1 API error: {e}")
        except httpx.RequestError as e:
            raise HTTPException(status_code=503, detail=f"OpenF1 unreachable: {e}")


# =============================================================================
# LIVE SESSION ENDPOINTS
# =============================================================================

@router.get("/session")
async def get_current_session():
    """
    Get the current or most recent F1 session.
    
    Returns session metadata including circuit, session type, and status.
    Frontend polling interval: 10 seconds
    """
    cache_key = "current_session"
    cached = cache_get(cache_key, ttl_seconds=10)
    if cached:
        return cached
    
    # Get latest session from OpenF1
    sessions = await fetch_openf1("sessions", {"session_key": "latest"})
    
    if not sessions:
        return {"status": "no_session", "message": "No active session found"}
    
    session = sessions[0] if isinstance(sessions, list) else sessions
    
    result = {
        "session_key": session.get("session_key"),
        "session_name": session.get("session_name"),
        "session_type": session.get("session_type"),
        "circuit_short_name": session.get("circuit_short_name"),
        "country_name": session.get("country_name"),
        "date_start": session.get("date_start"),
        "date_end": session.get("date_end"),
        "gmt_offset": session.get("gmt_offset"),
        "status": "active" if session.get("date_end") is None else "finished"
    }
    
    cache_set(cache_key, result)
    return result


@router.get("/timing")
async def get_live_timing(
    session_key: Optional[int] = Query(None, description="Session key (uses latest if not provided)")
):
    """
    Get real-time lap times and intervals for all drivers.
    
    This powers the Live Timing Tower component.
    Frontend polling interval: 4 seconds
    
    Response includes:
    - Driver positions
    - Gap to leader
    - Interval to car ahead
    - Sector times with purple/green/yellow status
    - Pit status
    """
    cache_key = f"timing_{session_key or 'latest'}"
    cached = cache_get(cache_key, ttl_seconds=4)
    if cached:
        return cached
    
    params = {}
    if session_key:
        params["session_key"] = session_key
    
    # Fetch intervals (gap data)
    intervals = await fetch_openf1("intervals", params)
    
    # Fetch drivers for mapping
    drivers = await fetch_openf1("drivers", params)
    
    # Create driver lookup
    driver_map = {d.get("driver_number"): d for d in (drivers or [])}
    
    # Process intervals into timing data
    timing_data = []
    seen_drivers = set()
    
    for interval in reversed(intervals or []):
        driver_num = interval.get("driver_number")
        if driver_num in seen_drivers:
            continue
        seen_drivers.add(driver_num)
        
        driver_info = driver_map.get(driver_num, {})
        
        timing_data.append({
            "position": interval.get("driver_number"),  # Will be reordered
            "driver_number": driver_num,
            "driver_code": driver_info.get("name_acronym", "---"),
            "team_name": driver_info.get("team_name"),
            "team_colour": driver_info.get("team_colour"),
            "gap_to_leader": interval.get("gap_to_leader"),
            "interval": interval.get("interval"),
            "date": interval.get("date")
        })
    
    # Sort by gap to leader
    timing_data.sort(key=lambda x: float(x["gap_to_leader"] or 0) if x["gap_to_leader"] else 0)
    
    # Assign positions
    for i, driver in enumerate(timing_data):
        driver["position"] = i + 1
    
    result = {
        "timestamp": datetime.now().isoformat(),
        "session_key": session_key,
        "drivers": timing_data[:20]  # Top 20
    }
    
    cache_set(cache_key, result)
    return result


@router.get("/telemetry/{driver_number}")
async def get_driver_telemetry(
    driver_number: int,
    session_key: Optional[int] = Query(None, description="Session key")
):
    """
    Get high-frequency telemetry for a specific driver.
    
    Data sampled at ~3.7Hz (4 updates per second).
    Frontend polling interval: 250ms for smooth animation
    
    Returns:
    - Speed (km/h)
    - RPM
    - Throttle (0-100%)
    - Brake (0 or 100)
    - Gear (1-8)
    - DRS (0=closed, 1=open)
    """
    cache_key = f"telemetry_{driver_number}_{session_key or 'latest'}"
    cached = cache_get(cache_key, ttl_seconds=0.5)  # 500ms cache
    if cached:
        return cached
    
    params = {"driver_number": driver_number}
    if session_key:
        params["session_key"] = session_key
    
    # Get latest car data
    car_data = await fetch_openf1("car_data", params)
    
    if not car_data:
        raise HTTPException(status_code=404, detail=f"No telemetry for driver {driver_number}")
    
    # Get most recent entry
    latest = car_data[-1] if isinstance(car_data, list) else car_data
    
    result = {
        "driver_number": driver_number,
        "timestamp": latest.get("date"),
        "telemetry": {
            "speed": latest.get("speed"),
            "rpm": latest.get("rpm"),
            "throttle": latest.get("throttle"),
            "brake": latest.get("brake"),
            "gear": latest.get("n_gear"),
            "drs": latest.get("drs")
        }
    }
    
    cache_set(cache_key, result)
    return result


@router.get("/telemetry/{driver_number}/history")
async def get_driver_telemetry_history(
    driver_number: int,
    seconds: int = Query(30, ge=5, le=120, description="Seconds of history to fetch"),
    session_key: Optional[int] = Query(None)
):
    """
    Get telemetry history for a driver (for charting).
    
    Returns the last N seconds of telemetry data.
    Useful for speed trace charts and throttle/brake overlays.
    """
    params = {"driver_number": driver_number}
    if session_key:
        params["session_key"] = session_key
    
    car_data = await fetch_openf1("car_data", params)
    
    if not car_data:
        return {"driver_number": driver_number, "history": []}
    
    # Get last N entries (roughly 4 per second)
    entries = car_data[-(seconds * 4):] if len(car_data) > seconds * 4 else car_data
    
    return {
        "driver_number": driver_number,
        "history": [
            {
                "timestamp": entry.get("date"),
                "speed": entry.get("speed"),
                "throttle": entry.get("throttle"),
                "brake": entry.get("brake"),
                "gear": entry.get("n_gear"),
                "drs": entry.get("drs")
            }
            for entry in entries
        ]
    }


@router.get("/weather")
async def get_track_weather(session_key: Optional[int] = Query(None)):
    """
    Get current track weather conditions.
    
    Frontend polling interval: 60 seconds
    
    Returns:
    - Air temperature
    - Track temperature
    - Humidity
    - Pressure
    - Wind speed & direction
    - Rainfall status
    """
    cache_key = f"weather_{session_key or 'latest'}"
    cached = cache_get(cache_key, ttl_seconds=60)
    if cached:
        return cached
    
    params = {}
    if session_key:
        params["session_key"] = session_key
    
    weather_data = await fetch_openf1("weather", params)
    
    if not weather_data:
        return {"status": "unavailable"}
    
    latest = weather_data[-1] if isinstance(weather_data, list) else weather_data
    
    result = {
        "timestamp": latest.get("date"),
        "air_temperature": latest.get("air_temperature"),
        "track_temperature": latest.get("track_temperature"),
        "humidity": latest.get("humidity"),
        "pressure": latest.get("pressure"),
        "wind_speed": latest.get("wind_speed"),
        "wind_direction": latest.get("wind_direction"),
        "rainfall": latest.get("rainfall", False)
    }
    
    cache_set(cache_key, result)
    return result


@router.get("/positions")
async def get_driver_positions(session_key: Optional[int] = Query(None)):
    """
    Get GPS positions for all drivers on track.
    
    Useful for track map visualization.
    Frontend polling interval: 1 second
    
    Returns X, Y coordinates for each driver.
    """
    cache_key = f"positions_{session_key or 'latest'}"
    cached = cache_get(cache_key, ttl_seconds=1)
    if cached:
        return cached
    
    params = {}
    if session_key:
        params["session_key"] = session_key
    
    location_data = await fetch_openf1("location", params)
    
    if not location_data:
        return {"drivers": []}
    
    # Group by driver, get latest position each
    driver_positions = {}
    for loc in location_data:
        driver_num = loc.get("driver_number")
        driver_positions[driver_num] = {
            "driver_number": driver_num,
            "x": loc.get("x"),
            "y": loc.get("y"),
            "z": loc.get("z"),
            "timestamp": loc.get("date")
        }
    
    result = {
        "timestamp": datetime.now().isoformat(),
        "drivers": list(driver_positions.values())
    }
    
    cache_set(cache_key, result)
    return result


@router.get("/race-control")
async def get_race_control_messages(
    session_key: Optional[int] = Query(None),
    limit: int = Query(20, ge=1, le=100)
):
    """
    Get race control messages (flags, incidents, penalties).
    
    Frontend polling interval: 5 seconds
    
    Returns:
    - Message text
    - Category (Flag, SafetyCar, Drs, etc.)
    - Timestamp
    """
    cache_key = f"race_control_{session_key or 'latest'}"
    cached = cache_get(cache_key, ttl_seconds=5)
    if cached:
        return cached
    
    params = {}
    if session_key:
        params["session_key"] = session_key
    
    messages = await fetch_openf1("race_control", params)
    
    if not messages:
        return {"messages": []}
    
    result = {
        "messages": [
            {
                "category": msg.get("category"),
                "message": msg.get("message"),
                "flag": msg.get("flag"),
                "scope": msg.get("scope"),
                "driver_number": msg.get("driver_number"),
                "timestamp": msg.get("date")
            }
            for msg in messages[-limit:]
        ]
    }
    
    cache_set(cache_key, result)
    return result
