"use client";

import { useTransactionHistory } from "@/hooks/useTransactionHistory";
import { Badge } from "@/components/ui/badge";
import { formatDkt } from "@/lib/utils";
import { ExternalLink } from "lucide-react";
import { useMemo } from "react";

export function EventsLog() {
  const { transactions, isLoading } = useTransactionHistory();

  // Take latest 50 transactions
  const recentEvents = useMemo(() => {
    return transactions.slice(0, 50);
  }, [transactions]);

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "stake":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "unstake":
        return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      case "claim":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "donate":
      case "donation":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      case "vote":
        return "bg-pink-500/20 text-pink-400 border-pink-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "success":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "pending":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "failed":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  if (isLoading) {
    return (
      <div className="glass-morphism rounded-3xl border border-white/5 p-12 text-center">
        <p className="text-muted-foreground">Loading events...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold">Recent Events</h3>
        <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/30">
          {transactions.length} total
        </Badge>
      </div>

      {/* Events Table */}
      <div className="glass-morphism rounded-3xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-widest">
                  Time
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-widest">
                  Type
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-widest">
                  From
                </th>
                <th className="px-6 py-4 text-right text-xs font-bold text-muted-foreground uppercase tracking-widest">
                  Amount
                </th>
                <th className="px-6 py-4 text-center text-xs font-bold text-muted-foreground uppercase tracking-widest">
                  Status
                </th>
                <th className="px-6 py-4 text-center text-xs font-bold text-muted-foreground uppercase tracking-widest">
                  TX
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {recentEvents.map((event) => (
                <tr key={event.hash} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-sm">
                      {new Date(event.timestamp * 1000).toLocaleString()}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant="outline" className={getTypeColor(event.type)}>
                      {event.type}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-mono">
                      {event.from?.slice(0, 6)}...{event.from?.slice(-4)}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <p className="text-sm font-semibold">
                      {event.value ? formatDkt(BigInt(event.value)) : "-"}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Badge variant="outline" className={getStatusColor(event.status)}>
                      {event.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <a
                      href={`https://dchain.id/explorer/tx/${event.hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {recentEvents.length === 0 && (
        <div className="glass-morphism rounded-3xl border border-white/5 p-12 text-center">
          <p className="text-muted-foreground">No events found</p>
        </div>
      )}
    </div>
  );
}
