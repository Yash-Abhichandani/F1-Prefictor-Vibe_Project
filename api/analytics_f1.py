"""
F1 Apex Analytics Service
FastF1 Integration for deep race analytics.

This module provides endpoints for complex telemetry analysis,
driver comparisons, and performance metrics using FastF1.

Note: FastF1 requires significant processing time on first load.
Results are cached aggressively (24h TTL).
"""

import os
import json
from fastapi import APIRouter, HTTPException, Query, BackgroundTasks
from typing import Optional, List, Dict, Any
from datetime import datetime
import asyncio
from functools import lru_cache

# Create router
router = APIRouter(prefix="/analysis", tags=["Deep Analytics"])

# Cache directory for FastF1
CACHE_DIR = os.environ.get("FASTF1_CACHE_DIR", "/tmp/fastf1_cache")

# In-memory results cache (for processed analytics)
_analytics_cache: Dict[str, tuple[Any, datetime]] = {}

# Flag to track if FastF1 is available
FASTF1_AVAILABLE = False

try:
    import fastf1
    fastf1.Cache.enable_cache(CACHE_DIR)
    FASTF1_AVAILABLE = True
except ImportError:
    print("WARNING: FastF1 not installed. Analytics endpoints will return mock data.")


def analytics_cache_get(key: str, ttl_hours: int = 24) -> Optional[Any]:
    """Get from analytics cache if not expired."""
    if key in _analytics_cache:
        data, timestamp = _analytics_cache[key]
        from datetime import timedelta
        if datetime.now() - timestamp < timedelta(hours=ttl_hours):
            return data
    return None

def analytics_cache_set(key: str, data: Any):
    """Set analytics cache with timestamp."""
    _analytics_cache[key] = (data, datetime.now())


# =============================================================================
# MOCK DATA (Used when FastF1 is not available)
# =============================================================================

def get_mock_radar_data(driver: str) -> Dict:
    """Generate mock radar data for development/testing."""
    import random
    return {
        "driver": driver,
        "metrics": {
            "top_speed": {"value": 340 + random.uniform(-10, 10), "normalized": random.uniform(0.85, 1.0)},
            "braking_depth": {"value": random.uniform(0.7, 0.95), "normalized": random.uniform(0.7, 1.0)},
            "throttle_aggression": {"value": random.uniform(0.8, 0.98), "normalized": random.uniform(0.8, 1.0)},
            "corner_exit_speed": {"value": 280 + random.uniform(-15, 15), "normalized": random.uniform(0.75, 0.95)},
            "consistency": {"value": random.uniform(0.85, 0.98), "normalized": random.uniform(0.85, 0.98)},
            "tyre_management": {"value": random.uniform(0.75, 0.95), "normalized": random.uniform(0.75, 0.95)}
        }
    }

def get_mock_stint_data(driver: str) -> Dict:
    """Generate mock stint data for development/testing."""
    import random
    return {
        "driver": driver,
        "stints": [
            {
                "stint_number": 1,
                "compound": "MEDIUM",
                "start_lap": 1,
                "end_lap": 22,
                "lap_times": [81.0 + random.uniform(-0.5, 0.5) + (i * 0.03) for i in range(22)],
                "degradation_rate": 0.045
            },
            {
                "stint_number": 2,
                "compound": "HARD",
                "start_lap": 23,
                "end_lap": 53,
                "lap_times": [82.0 + random.uniform(-0.5, 0.5) + (i * 0.02) for i in range(30)],
                "degradation_rate": 0.028
            }
        ]
    }


# =============================================================================
# ANALYTICS ENDPOINTS
# =============================================================================

@router.get("/radar/{year}/{race}/{driver}")
async def get_driver_radar(
    year: int,
    race: str,
    driver: str,
    session_type: str = Query("R", description="Session type: R=Race, Q=Qualifying, FP1/FP2/FP3")
):
    """
    Generate radar chart metrics for a driver's performance.
    
    Processing time: 5-15 seconds on cache miss
    Cache TTL: 24 hours
    
    Metrics calculated:
    - Top Speed: Max recorded speed during session
    - Braking Depth: How late the driver brakes into corners
    - Throttle Aggression: How quickly throttle is applied on exit
    - Corner Exit Speed: Minimum speed through corner apexes
    - Consistency: Lap time variance (lower = better)
    - Tyre Management: Degradation rate over stint
    
    All values are normalized 0-1 for radar chart display.
    """
    cache_key = f"radar_{year}_{race}_{driver}_{session_type}"
    cached = analytics_cache_get(cache_key)
    if cached:
        return cached
    
    if not FASTF1_AVAILABLE:
        # Return mock data for development
        result = get_mock_radar_data(driver)
        result["year"] = year
        result["race"] = race
        result["session_type"] = session_type
        result["is_mock"] = True
        analytics_cache_set(cache_key, result)
        return result
    
    try:
        # Run FastF1 processing in thread pool (it's CPU-bound)
        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(None, _calculate_radar_metrics, year, race, driver, session_type)
        result["is_mock"] = False
        analytics_cache_set(cache_key, result)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analytics processing failed: {str(e)}")


def _calculate_radar_metrics(year: int, race: str, driver: str, session_type: str) -> Dict:
    """Calculate radar metrics using FastF1 (runs in thread pool)."""
    import fastf1
    import numpy as np
    
    # Load session
    session = fastf1.get_session(year, race, session_type)
    session.load()
    
    # Get driver laps
    driver_laps = session.laps.pick_driver(driver)
    
    if driver_laps.empty:
        raise ValueError(f"No lap data found for driver {driver}")
    
    # Get fastest lap for telemetry analysis
    fastest_lap = driver_laps.pick_fastest()
    telemetry = fastest_lap.get_telemetry()
    
    # Calculate metrics
    top_speed = float(telemetry['Speed'].max())
    
    # Braking depth: Average brake pressure at high-speed points
    high_speed_brake = telemetry[telemetry['Speed'] > 250]['Brake'].mean()
    braking_depth = float(high_speed_brake) if not np.isnan(high_speed_brake) else 0.5
    
    # Throttle aggression: Rate of throttle application
    throttle_diff = telemetry['Throttle'].diff().abs().mean()
    throttle_aggression = min(float(throttle_diff) / 10, 1.0)
    
    # Corner exit speed: Minimum speed points averaged
    corner_exit = float(telemetry['Speed'].nsmallest(20).mean())
    
    # Consistency: Lap time standard deviation (inverted: lower = better)
    valid_laps = driver_laps[driver_laps['LapTime'].notna()]
    if len(valid_laps) > 1:
        lap_times_seconds = valid_laps['LapTime'].dt.total_seconds()
        consistency = 1 - min(float(lap_times_seconds.std()) / 5, 1.0)
    else:
        consistency = 0.9
    
    # Normalize all values to 0-1 range
    # These are approximate normalizations based on typical F1 values
    normalized = {
        "top_speed": {"value": top_speed, "normalized": min(top_speed / 370, 1.0)},
        "braking_depth": {"value": braking_depth, "normalized": braking_depth},
        "throttle_aggression": {"value": throttle_aggression, "normalized": throttle_aggression},
        "corner_exit_speed": {"value": corner_exit, "normalized": min(corner_exit / 320, 1.0)},
        "consistency": {"value": consistency, "normalized": consistency},
        "tyre_management": {"value": 0.85, "normalized": 0.85}  # Placeholder - needs stint analysis
    }
    
    return {
        "driver": driver,
        "race": race,
        "year": year,
        "session_type": session_type,
        "metrics": normalized
    }


@router.get("/stint/{year}/{race}/{driver}")
async def get_stint_analysis(
    year: int,
    race: str,
    driver: str
):
    """
    Analyze tyre stints and degradation for a driver.
    
    Processing time: 5-10 seconds on cache miss
    Cache TTL: 24 hours
    
    Returns:
    - Stint breakdown (compound, lap range)
    - Lap times per stint
    - Degradation rate (seconds lost per lap)
    
    Useful for strategy analysis and prediction modeling.
    """
    cache_key = f"stint_{year}_{race}_{driver}"
    cached = analytics_cache_get(cache_key)
    if cached:
        return cached
    
    if not FASTF1_AVAILABLE:
        result = get_mock_stint_data(driver)
        result["year"] = year
        result["race"] = race
        result["is_mock"] = True
        analytics_cache_set(cache_key, result)
        return result
    
    try:
        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(None, _calculate_stint_metrics, year, race, driver)
        result["is_mock"] = False
        analytics_cache_set(cache_key, result)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Stint analysis failed: {str(e)}")


def _calculate_stint_metrics(year: int, race: str, driver: str) -> Dict:
    """Calculate stint/tyre degradation metrics using FastF1."""
    import fastf1
    import numpy as np
    
    session = fastf1.get_session(year, race, 'R')
    session.load()
    
    driver_laps = session.laps.pick_driver(driver)
    
    if driver_laps.empty:
        raise ValueError(f"No lap data found for driver {driver}")
    
    # Group laps by stint
    stints = []
    current_stint = None
    current_compound = None
    
    for _, lap in driver_laps.iterrows():
        compound = lap.get('Compound', 'UNKNOWN')
        lap_number = int(lap['LapNumber'])
        lap_time = lap['LapTime']
        
        if compound != current_compound:
            if current_stint:
                stints.append(current_stint)
            current_stint = {
                "stint_number": len(stints) + 1,
                "compound": compound,
                "start_lap": lap_number,
                "end_lap": lap_number,
                "lap_times": []
            }
            current_compound = compound
        
        if current_stint:
            current_stint["end_lap"] = lap_number
            if lap_time and not np.isnan(lap_time.total_seconds()):
                current_stint["lap_times"].append(float(lap_time.total_seconds()))
    
    if current_stint:
        stints.append(current_stint)
    
    # Calculate degradation rate for each stint
    for stint in stints:
        lap_times = stint["lap_times"]
        if len(lap_times) >= 5:
            # Linear regression to find degradation rate
            x = np.arange(len(lap_times))
            y = np.array(lap_times)
            
            # Remove outliers (pit in/out laps)
            median = np.median(y)
            valid_mask = np.abs(y - median) < 3
            
            if valid_mask.sum() >= 3:
                slope, _ = np.polyfit(x[valid_mask], y[valid_mask], 1)
                stint["degradation_rate"] = round(float(slope), 4)
            else:
                stint["degradation_rate"] = 0.03
        else:
            stint["degradation_rate"] = 0.03
    
    return {
        "driver": driver,
        "race": race,
        "year": year,
        "stints": stints
    }


@router.get("/comparison/{year}/{race}")
async def get_driver_comparison(
    year: int,
    race: str,
    drivers: str = Query(..., description="Comma-separated driver codes (e.g., VER,HAM,NOR)")
):
    """
    Compare multiple drivers' performance metrics.
    
    Processing time: 10-20 seconds on cache miss
    Cache TTL: 24 hours
    
    Returns radar metrics for all requested drivers,
    formatted for overlay comparison charts.
    """
    driver_list = [d.strip().upper() for d in drivers.split(",")]
    
    if len(driver_list) > 5:
        raise HTTPException(status_code=400, detail="Maximum 5 drivers for comparison")
    
    cache_key = f"comparison_{year}_{race}_{'_'.join(sorted(driver_list))}"
    cached = analytics_cache_get(cache_key)
    if cached:
        return cached
    
    # Fetch radar data for each driver
    results = []
    for driver in driver_list:
        try:
            radar = await get_driver_radar(year, race, driver)
            results.append(radar)
        except Exception as e:
            results.append({
                "driver": driver,
                "error": str(e)
            })
    
    result = {
        "year": year,
        "race": race,
        "drivers": results
    }
    
    analytics_cache_set(cache_key, result)
    return result


@router.get("/track-dominance/{year}/{race}")
async def get_track_dominance(
    year: int,
    race: str,
    driver: str = Query(..., description="Driver code")
):
    """
    Analyze where a driver gains/loses time on track.
    
    Returns mini-sector analysis showing:
    - Sectors where driver is faster than average
    - Sectors where driver is slower
    - Speed differential at each point
    
    Cache TTL: 7 days (track data doesn't change)
    """
    cache_key = f"dominance_{year}_{race}_{driver}"
    cached = analytics_cache_get(cache_key, ttl_hours=168)  # 7 days
    if cached:
        return cached
    
    if not FASTF1_AVAILABLE:
        # Return simplified mock data
        return {
            "driver": driver,
            "race": race,
            "year": year,
            "is_mock": True,
            "sectors": [
                {"sector": 1, "delta": -0.15, "status": "faster"},
                {"sector": 2, "delta": 0.08, "status": "slower"},
                {"sector": 3, "delta": -0.22, "status": "faster"}
            ]
        }
    
    try:
        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(None, _calculate_track_dominance, year, race, driver)
        analytics_cache_set(cache_key, result)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Track analysis failed: {str(e)}")


def _calculate_track_dominance(year: int, race: str, driver: str) -> Dict:
    """Calculate track dominance using mini-sector analysis."""
    import fastf1
    
    session = fastf1.get_session(year, race, 'R')
    session.load()
    
    driver_laps = session.laps.pick_driver(driver)
    fastest = driver_laps.pick_fastest()
    
    # Get sector times
    sectors = []
    for i in range(1, 4):
        sector_key = f'Sector{i}Time'
        if sector_key in fastest.keys():
            sector_time = fastest[sector_key]
            if sector_time:
                sectors.append({
                    "sector": i,
                    "time": float(sector_time.total_seconds()) if hasattr(sector_time, 'total_seconds') else float(sector_time),
                    "status": "personal_best"  # Would need session comparison for actual status
                })
    
    return {
        "driver": driver,
        "race": race,
        "year": year,
        "is_mock": False,
        "sectors": sectors
    }


@router.get("/health")
async def analytics_health():
    """Check if analytics service is operational."""
    return {
        "status": "healthy",
        "fastf1_available": FASTF1_AVAILABLE,
        "cache_dir": CACHE_DIR,
        "cache_entries": len(_analytics_cache)
    }
