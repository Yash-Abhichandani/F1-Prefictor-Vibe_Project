"use client";

import { useEffect, useState } from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip
} from "recharts";
import { liveApi, RadarMetrics } from "@/app/services/live_api";
import { Loader2 } from "lucide-react";

interface DriverRadarProps {
  driver: string;
  year: number;
  race: string;
}

export default function DriverRadar({ driver, year, race }: DriverRadarProps) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const result = await liveApi.getRadar(year, race, driver);
      
      if (result && result.metrics) {
        // Transform API response to Recharts format
        const chartData = [
          { subject: 'Top Speed', A: result.metrics.top_speed.normalized, fullMark: 1 },
          { subject: 'Braking', A: result.metrics.braking_depth.normalized, fullMark: 1 },
          { subject: 'Throttle', A: result.metrics.throttle_aggression.normalized, fullMark: 1 },
          { subject: 'Cornering', A: result.metrics.corner_exit_speed.normalized, fullMark: 1 },
          { subject: 'Stability', A: result.metrics.consistency.normalized, fullMark: 1 },
          { subject: 'Tyres', A: result.metrics.tyre_management.normalized, fullMark: 1 },
        ];
        setData(chartData);
      }
      setLoading(false);
    };

    if (driver && race) {
        fetchData();
    }
  }, [driver, race, year]);

  if (loading) {
     return <div className="h-[300px] flex items-center justify-center"><Loader2 className="animate-spin text-white/20" /></div>;
  }

  return (
    <div className="w-full h-[350px] relative">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid stroke="#333" />
          <PolarAngleAxis 
            dataKey="subject" 
            tick={{ fill: '#888', fontSize: 10, fontFamily: 'monospace' }} 
          />
          <PolarRadiusAxis angle={30} domain={[0, 1]} tick={false} axisLine={false} />
          <Radar
            name={driver}
            dataKey="A"
            stroke="var(--f1-red)"
            strokeWidth={2}
            fill="var(--f1-red)"
            fillOpacity={0.3}
          />
          <Tooltip 
             contentStyle={{ backgroundColor: '#000', border: '1px solid #333' }}
             itemStyle={{ color: '#fff' }}
             formatter={(value: number) => Math.round(value * 100) + '%'}
          />
        </RadarChart>
      </ResponsiveContainer>
      
      {/* Title */}
      <div className="absolute top-0 right-0">
          <span className="text-[10px] font-mono text-[var(--accent-gold)] border border-[var(--accent-gold)] px-2 py-1 rounded">
              PERFORMANCE_RADAR
          </span>
      </div>
    </div>
  );
}
