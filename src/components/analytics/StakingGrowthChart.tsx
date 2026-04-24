"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatDkt } from "@/lib/utils";
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
      <p className="font-bold text-lg">{formatDkt(BigInt(Math.floor(data.value * 1e18)))}</p>
      <p className="text-xs text-blue-400">Total Staked</p>
    </div>
  );
}

interface StakingGrowthChartProps {
  data: TimeSeriesDataPoint[];
}

export function StakingGrowthChart({ data }: StakingGrowthChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id="stakingGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
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
          tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="value"
          stroke="#3b82f6"
          strokeWidth={2}
          fill="url(#stakingGradient)"
          animationDuration={1000}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
