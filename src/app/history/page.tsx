"use client";

import { useState, useMemo } from "react";
import { useAccount } from "wagmi";
import { ConnectPrompt } from "@/components/web3/ConnectPrompt";
import { TransactionList } from "@/components/history/TransactionList";
import { TransactionFilters } from "@/components/history/TransactionFilters";
import { useTransactionHistory } from "@/hooks/useTransactionHistory";
import { NetworkBadge } from "@/components/web3/NetworkBadge";
import { FadeIn, ParallaxBackground } from "@/components/ui/motion";
import { History as HistoryIcon } from "lucide-react";
import { ExportDialog } from "@/components/export/ExportDialog";
import type { ExportTransaction } from "@/lib/export";

export type TransactionType = "stake" | "unstake" | "claim" | "donate" | "vote" | "other";

export default function HistoryPage() {
  const { isConnected } = useAccount();
  const { transactions, isLoading } = useTransactionHistory();

  const [typeFilter, setTypeFilter] = useState<TransactionType | "all">("all");
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // Type filter
      if (typeFilter !== "all" && tx.type !== typeFilter) return false;

      // Search filter (tx hash, method name)
      if (search && !tx.hash.toLowerCase().includes(search.toLowerCase()) &&
          !tx.method?.toLowerCase().includes(search.toLowerCase())) {
        return false;
      }

      // Date range filter
      if (dateRange.from && tx.timestamp < dateRange.from.getTime() / 1000) return false;
      if (dateRange.to && tx.timestamp > dateRange.to.getTime() / 1000) return false;

      return true;
    });
  }, [transactions, typeFilter, search, dateRange]);

  // Convert transactions to export format
  const exportTransactions: ExportTransaction[] = useMemo(() => {
    return filteredTransactions.map((tx) => ({
      timestamp: tx.timestamp * 1000,
      date: new Date(tx.timestamp * 1000).toLocaleString(),
      type: tx.type,
      amount: BigInt(tx.value || "0"),
      hash: tx.hash,
      status: tx.status,
      gasUsed: tx.gasUsed ? BigInt(tx.gasUsed) : undefined,
      from: tx.from,
      to: tx.to,
    }));
  }, [filteredTransactions]);

  if (!isConnected) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative">
        <ParallaxBackground />
        <FadeIn>
          <ConnectPrompt
            title="Connect to view transaction history"
            description="Connect your wallet to see your complete on-chain transaction history."
          />
        </FadeIn>
      </div>
    );
  }

  return (
    <div className="relative min-h-[calc(100vh-64px)] overflow-hidden">
      <ParallaxBackground />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        {/* Header */}
        <FadeIn>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <h1 className="text-5xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                  Transaction History
                </h1>
                <NetworkBadge />
              </div>
              <p className="text-muted-foreground text-sm max-w-2xl leading-relaxed font-medium">
                Complete record of your on-chain interactions: stakes, donations, votes, and yield claims.
              </p>
            </div>

            {transactions.length > 0 && (
              <ExportDialog transactions={exportTransactions} />
            )}
          </div>
        </FadeIn>

        {/* Filters */}
        <FadeIn delay={0.1}>
          <TransactionFilters
            typeFilter={typeFilter}
            onTypeFilterChange={setTypeFilter}
            search={search}
            onSearchChange={setSearch}
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
          />
        </FadeIn>

        {/* Stats */}
        <FadeIn delay={0.2}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl glass-morphism border border-white/5">
              <p className="text-xs text-muted-foreground uppercase tracking-widest font-black">
                Total Transactions
              </p>
              <p className="text-2xl font-black mt-1">{transactions.length}</p>
            </div>
            <div className="p-4 rounded-2xl glass-morphism border border-white/5">
              <p className="text-xs text-muted-foreground uppercase tracking-widest font-black">
                Filtered
              </p>
              <p className="text-2xl font-black mt-1">{filteredTransactions.length}</p>
            </div>
            <div className="p-4 rounded-2xl glass-morphism border border-white/5">
              <p className="text-xs text-muted-foreground uppercase tracking-widest font-black">
                Success Rate
              </p>
              <p className="text-2xl font-black mt-1 text-green-400">
                {transactions.length > 0
                  ? Math.round(
                      (transactions.filter((tx) => tx.status === "success").length /
                        transactions.length) *
                        100
                    )
                  : 0}
                %
              </p>
            </div>
          </div>
        </FadeIn>

        {/* Transaction List */}
        <FadeIn delay={0.3}>
          {isLoading ? (
            <div className="text-center py-20">
              <HistoryIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-pulse" />
              <p className="text-muted-foreground">Loading transaction history...</p>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center py-20 glass-morphism rounded-3xl border border-white/5">
              <HistoryIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
              <p className="text-muted-foreground font-medium">
                {transactions.length === 0
                  ? "No transactions yet"
                  : "No transactions match your filters"}
              </p>
            </div>
          ) : (
            <TransactionList transactions={filteredTransactions} />
          )}
        </FadeIn>
      </div>
    </div>
  );
}
