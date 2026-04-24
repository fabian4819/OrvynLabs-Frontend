"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { TimeSeriesDataPoint } from "@/hooks/useChartData";

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    payload: TimeSeriesDataPoint;
  }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const data = payload[0];

  return (
    <div className="rounded-xl border border-white/10 bg-card/95 backdrop-blur-sm px-4 py-3 shadow-xl">
      <p className="text-xs text-muted-foreground mb-1">{data.payload.date}</p>
      <p className="font-bold text-2xl">{data.value}</p>
      <p className="text-xs text-purple-400">Total Projects</p>
    </div>
  );
}

interface ProjectGrowthChartProps {
  data: TimeSeriesDataPoint[];
}

export function ProjectGrowthChart({ data }: ProjectGrowthChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: "#6b7280" }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "#6b7280" }}
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <Line
          type="monotone"
          dataKey="value"
          stroke="url(#lineGradient)"
          strokeWidth={3}
          dot={{ fill: "#a855f7", r: 4 }}
          activeDot={{ r: 6, fill: "#ec4899" }}
          animationDuration={1000}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
