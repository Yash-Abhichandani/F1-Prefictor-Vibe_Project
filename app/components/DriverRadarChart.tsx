"use client";

import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip } from 'recharts';

interface RadarData {
  subject: string;
  A: number;
  fullMark: number;
}

interface DriverRadarChartProps {
  data: RadarData[];
  color?: string; // Add color prop
}

export default function DriverRadarChart({ data, color = "var(--accent-cyan)" }: DriverRadarChartProps) {
  // Custom Tick for the Axis (Labels)
  const CustomTick = ({ payload, x, y, textAnchor, stroke, radius }: any) => {
    return (
      <g className="recharts-layer recharts-polar-angle-axis-tick">
        <text 
          radius={radius} 
          stroke={stroke} 
          x={x} 
          y={y} 
          className="text-[10px] font-bold fill-[var(--text-secondary)] uppercase tracking-wider" 
          textAnchor={textAnchor}
        >
          <tspan x={x} dy="0em">{payload.value}</tspan>
        </text>
      </g>
    );
  };

  return (
    <div className="w-full h-[250px] relative">
      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px]" />
      
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid stroke="rgba(255,255,255,0.1)" strokeWidth={1} />
          <PolarAngleAxis dataKey="subject" tick={CustomTick} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
          <Radar
            name="Driver Stats"
            dataKey="A"
            stroke={color}
            strokeWidth={2}
            fill={color}
            fillOpacity={0.2}
            isAnimationActive={true}
          />
          <Tooltip 
             contentStyle={{ backgroundColor: 'var(--bg-onyx)', borderColor: 'var(--glass-border)', color: 'white' }}
             itemStyle={{ color: color }}
             labelStyle={{ display: 'none' }}
             cursor={{ stroke: 'white', strokeOpacity: 0.2 }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
