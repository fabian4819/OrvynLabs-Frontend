"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

interface DistributionData {
  name: string;
  value: number;
  color: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    payload: DistributionData;
  }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const data = payload[0];

  return (
    <div className="rounded-xl border border-white/10 bg-card/95 backdrop-blur-sm px-4 py-3 shadow-xl">
      <p className="font-bold text-sm mb-1" style={{ color: data.payload.color }}>
        {data.name}
      </p>
      <p className="text-2xl font-black">{data.value}</p>
      <p className="text-xs text-muted-foreground">
        {payload[0].payload.value > 0 ? "projects" : "project"}
      </p>
    </div>
  );
}

interface ProjectDistributionChartProps {
  data: DistributionData[];
}

export function ProjectDistributionChart({ data }: ProjectDistributionChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground text-sm">
        No project data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={5}
          dataKey="value"
          label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
          labelLine={false}
          animationDuration={1000}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
      </PieChart>
    </ResponsiveContainer>
  );
}
