"use client";

import { Button } from "@/components/ui/button";
import type { TimeRange } from "@/hooks/useChartData";

interface TimeRangeSelectorProps {
  value: TimeRange;
  onChange: (range: TimeRange) => void;
}

const TIME_RANGES: Array<{ value: TimeRange; label: string }> = [
  { value: "24h", label: "24H" },
  { value: "7d", label: "7D" },
  { value: "30d", label: "30D" },
  { value: "all", label: "ALL" },
];

export function TimeRangeSelector({ value, onChange }: TimeRangeSelectorProps) {
  return (
    <div className="flex items-center gap-1 p-1 rounded-xl bg-white/5 border border-white/5">
      {TIME_RANGES.map((range) => (
        <Button
          key={range.value}
          variant={value === range.value ? "default" : "ghost"}
          size="sm"
          onClick={() => onChange(range.value)}
          className={`text-xs font-bold uppercase tracking-wider px-3 py-1.5 h-auto ${
            value === range.value
              ? "bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]"
              : "text-muted-foreground hover:text-white hover:bg-white/5"
          }`}
        >
          {range.label}
        </Button>
      ))}
    </div>
  );
}
