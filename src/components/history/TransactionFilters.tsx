"use client";

import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter } from "lucide-react";
import type { TransactionType } from "@/app/history/page";

interface TransactionFiltersProps {
  typeFilter: TransactionType | "all";
  onTypeFilterChange: (type: TransactionType | "all") => void;
  search: string;
  onSearchChange: (search: string) => void;
  dateRange: { from?: Date; to?: Date };
  onDateRangeChange: (range: { from?: Date; to?: Date }) => void;
}

export function TransactionFilters({
  typeFilter,
  onTypeFilterChange,
  search,
  onSearchChange,
}: TransactionFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      {/* Search */}
      <div className="relative flex-1 group">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-blue-400 transition-colors" />
        <Input
          placeholder="Search by tx hash or method..."
          className="pl-11 h-12 rounded-2xl glass-morphism border-white/10 focus:border-blue-500/50"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      {/* Type Filter */}
      <div className="w-full sm:w-44">
        <Select value={typeFilter} onValueChange={(v) => onTypeFilterChange(v as TransactionType | "all")}>
          <SelectTrigger className="h-12 rounded-2xl glass-morphism border-white/10 focus:ring-blue-500/50">
            <div className="flex items-center gap-2">
              <Filter className="h-3.5 w-3.5 text-blue-400" />
              <SelectValue placeholder="Type" />
            </div>
          </SelectTrigger>
          <SelectContent className="glass-morphism border-white/10">
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="stake">Stake</SelectItem>
            <SelectItem value="unstake">Unstake</SelectItem>
            <SelectItem value="claim">Claim Yield</SelectItem>
            <SelectItem value="donate">Donate</SelectItem>
            <SelectItem value="vote">Vote</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
