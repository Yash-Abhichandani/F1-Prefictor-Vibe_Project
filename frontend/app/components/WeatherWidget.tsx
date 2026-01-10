"use client";
import { useEffect, useState } from "react";

interface WeatherData {
  temp: number;
  trackTemp: number;
  humidity: number;
  condition: string;
  icon: string;
}

interface WeatherWidgetProps {
  circuit: string;
  raceTime: string;
}

// Map circuits to approximate coordinates for weather API
const CIRCUIT_COORDS: Record<string, { lat: number; lon: number }> = {
  "Albert Park": { lat: -37.8497, lon: 144.9680 },
  "Shanghai": { lat: 31.3389, lon: 121.2197 },
  "Suzuka": { lat: 34.8431, lon: 136.5410 },
  "Sakhir": { lat: 26.0325, lon: 50.5106 },
  "Jeddah": { lat: 21.6319, lon: 39.1044 },
  "Miami": { lat: 25.9581, lon: -80.2389 },
  "Imola": { lat: 44.3439, lon: 11.7167 },
  "Monaco": { lat: 43.7347, lon: 7.4206 },
  "Barcelona": { lat: 41.5700, lon: 2.2611 },
  "Montreal": { lat: 45.5017, lon: -73.5267 },
  "Spielberg": { lat: 47.2197, lon: 14.7647 },
  "Silverstone": { lat: 52.0786, lon: -1.0169 },
  "Spa": { lat: 50.4372, lon: 5.9714 },
  "Budapest": { lat: 47.5789, lon: 19.2486 },
  "Zandvoort": { lat: 52.3888, lon: 4.5409 },
  "Monza": { lat: 45.6156, lon: 9.2811 },
  "Baku": { lat: 40.3725, lon: 49.8533 },
  "Singapore": { lat: 1.2914, lon: 103.8644 },
  "Austin": { lat: 30.1328, lon: -97.6411 },
  "Mexico City": { lat: 19.4042, lon: -99.0907 },
  "Sao Paulo": { lat: -23.7036, lon: -46.6997 },
  "Las Vegas": { lat: 36.1147, lon: -115.1728 },
  "Lusail": { lat: 25.4900, lon: 51.4542 },
  "Yas Marina": { lat: 24.4672, lon: 54.6031 },
};

// Weather condition to emoji mapping
const WEATHER_ICONS: Record<string, string> = {
  "clear": "☀️",
  "sunny": "☀️",
  "partly_cloudy": "⛅",
  "cloudy": "☁️",
  "overcast": "☁️",
  "rain": "🌧️",
  "light_rain": "🌦️",
  "thunderstorm": "⛈️",
  "snow": "❄️",
  "mist": "🌫️",
  "fog": "🌫️",
  "default": "🌡️"
};

export default function WeatherWidget({ circuit, raceTime }: WeatherWidgetProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchWeather = async () => {
      // Find coordinates for circuit
      const coords = Object.entries(CIRCUIT_COORDS).find(([key]) => 
        circuit.toLowerCase().includes(key.toLowerCase())
      )?.[1];

      if (!coords) {
        // Generate mock weather data for circuits not in list
        setWeather({
          temp: Math.round(20 + Math.random() * 15),
          trackTemp: Math.round(30 + Math.random() * 20),
          humidity: Math.round(40 + Math.random() * 40),
          condition: "partly_cloudy",
          icon: "⛅"
        });
        setLoading(false);
        return;
      }

      try {
        // Use Open-Meteo API (free, no API key required)
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current=temperature_2m,relative_humidity_2m,weather_code&timezone=auto`
        );

        if (!response.ok) throw new Error("Weather API error");

        const data = await response.json();
        const current = data.current;

        // Map WMO weather codes to conditions
        const weatherCode = current.weather_code;
        let condition = "default";
        if (weatherCode <= 1) condition = "clear";
        else if (weatherCode <= 3) condition = "partly_cloudy";
        else if (weatherCode <= 48) condition = "cloudy";
        else if (weatherCode <= 67) condition = "rain";
        else if (weatherCode <= 77) condition = "snow";
        else if (weatherCode <= 99) condition = "thunderstorm";

        setWeather({
          temp: Math.round(current.temperature_2m),
          trackTemp: Math.round(current.temperature_2m + 10 + Math.random() * 10), // Estimate
          humidity: Math.round(current.relative_humidity_2m),
          condition,
          icon: WEATHER_ICONS[condition] || WEATHER_ICONS.default
        });
      } catch (e) {
        console.error("Weather fetch error:", e);
        setError(true);
        // Fallback mock data
        setWeather({
          temp: 25,
          trackTemp: 40,
          humidity: 55,
          condition: "partly_cloudy",
          icon: "⛅"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [circuit]);

  if (loading) {
    return (
      <div className="glass-card p-4 animate-pulse">
        <div className="h-4 bg-[var(--bg-carbon)] rounded w-20 mb-2" />
        <div className="h-8 bg-[var(--bg-carbon)] rounded w-16" />
      </div>
    );
  }

  if (!weather) return null;

  return (
    <div className="glass-card p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-mono text-[var(--text-muted)] uppercase tracking-wider">
          Track Weather
        </span>
        <span className="text-2xl">{weather.icon}</span>
      </div>

      {/* Temperature Grid */}
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center">
          <div className="font-orbitron text-xl font-bold text-[var(--accent-cyan)]">
            {weather.temp}°
          </div>
          <div className="text-[10px] font-mono text-[var(--text-muted)] uppercase">
            Air
          </div>
        </div>
        <div className="text-center border-x border-[var(--glass-border)]">
          <div className="font-orbitron text-xl font-bold text-[var(--alert-amber)]">
            {weather.trackTemp}°
          </div>
          <div className="text-[10px] font-mono text-[var(--text-muted)] uppercase">
            Track
          </div>
        </div>
        <div className="text-center">
          <div className="font-orbitron text-xl font-bold text-[var(--text-silver)]">
            {weather.humidity}%
          </div>
          <div className="text-[10px] font-mono text-[var(--text-muted)] uppercase">
            Humidity
          </div>
        </div>
      </div>

      {/* Condition Label */}
      <div className="mt-3 text-center">
        <span className="text-xs font-mono text-[var(--text-silver)] uppercase tracking-wider">
          {weather.condition.replace("_", " ")}
        </span>
      </div>
    </div>
  );
}
