"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from "recharts";
import { liveApi, TelemetryData } from "@/app/services/live_api";
import { Gauge, Activity } from "lucide-react";

interface TelemetryGraphProps {
  driverNumber: number;
}

export default function TelemetryGraph({ driverNumber }: TelemetryGraphProps) {
  const [data, setData] = useState<TelemetryData[]>([]);
  const [currentSpeed, setCurrentSpeed] = useState(0);

  useEffect(() => {
    // Reset data when driver changes
    setData([]);

    const fetchTelemetry = async () => {
      // Pass sessionKey=latest implicitly
      const point = await liveApi.getTelemetry(driverNumber);
      
      if (point) {
        setCurrentSpeed(point.speed);
        
        setData(prev => {
          // Keep last 30 points (approx 7-8 seconds of data at 4Hz)
          const newData = [...prev, point];
          if (newData.length > 30) return newData.slice(-30);
          return newData;
        });
      }
    };

    // Poll at high frequency (250ms = 4Hz) to match OpenF1 rate
    const interval = setInterval(fetchTelemetry, 250);
    return () => clearInterval(interval);
  }, [driverNumber]);

  return (
    <div className="w-full bg-[var(--bg-onyx)] border border-[var(--glass-border)] rounded-xl p-4 h-[300px] flex flex-col relative overflow-hidden">
      
      {/* Header / Current Stats */}
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className="flex items-center gap-2">
            <Activity className="text-[var(--accent-cyan)]" size={16} />
            <span className="text-xs font-mono text-[var(--text-muted)] uppercase tracking-widest">LIVE TELEMETRY</span>
        </div>
        <div className="text-right">
            <div className="text-3xl font-black font-orbitron text-white leading-none flex items-baseline gap-1">
                {currentSpeed} <span className="text-xs font-sans text-[var(--text-muted)]">KM/H</span>
            </div>
        </div>
      </div>

      {/* Graph */}
      <div className="flex-1 w-full relative z-10 -ml-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis dataKey="timestamp" hide />
            <YAxis yAxisId="speed" domain={[0, 360]} hide />
            <YAxis yAxisId="input" domain={[0, 100]} hide />
            
            <Tooltip 
                contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '8px' }}
                itemStyle={{ fontSize: '10px', fontFamily: 'monospace' }}
            />

            {/* Speed Trace (Cyan) */}
            <Line
              yAxisId="speed"
              type="monotone"
              dataKey="speed"
              stroke="var(--accent-cyan)"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false} // Disable animation for smoother live updates
            />

            {/* Throttle Trace (Green) */}
            <Line
              yAxisId="input"
              type="step"
              dataKey="throttle"
              stroke="#00D2BE"
              strokeWidth={1}
              dot={false}
              strokeOpacity={0.5}
              isAnimationActive={false}
            />

             {/* Brake Trace (Red) */}
             <Line
              yAxisId="input"
              type="step"
              dataKey="brake"
              stroke="var(--f1-red)"
              strokeWidth={1}
              dot={false}
              strokeOpacity={0.8}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Background Decor */}
      <div className="absolute bottom-0 right-0 opacity-[0.03] pointer-events-none">
          <Gauge size={200} />
      </div>

    </div>
  );
}
