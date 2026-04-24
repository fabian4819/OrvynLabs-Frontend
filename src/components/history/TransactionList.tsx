"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, CheckCircle2, XCircle, Clock } from "lucide-react";
import type { Transaction } from "@/hooks/useTransactionHistory";
import { formatEther } from "viem";

interface TransactionListProps {
  transactions: Transaction[];
}

export function TransactionList({ transactions }: TransactionListProps) {
  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      stake: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      unstake: "bg-purple-500/20 text-purple-400 border-purple-500/30",
      claim: "bg-green-500/20 text-green-400 border-green-500/30",
      donate: "bg-amber-500/20 text-amber-400 border-amber-500/30",
      vote: "bg-pink-500/20 text-pink-400 border-pink-500/30",
      other: "bg-gray-500/20 text-gray-400 border-gray-500/30",
    };
    return colors[type] || colors.other;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle2 className="h-4 w-4 text-green-400" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-400" />;
      default:
        return <Clock className="h-4 w-4 text-amber-400 animate-pulse" />;
    }
  };

  const getExplorerUrl = (hash: string) => {
    return `https://dchain.id/explorer/tx/${hash}`;
  };

  return (
    <div className="rounded-3xl overflow-hidden glass-morphism border border-white/5">
      <Table>
        <TableHeader>
          <TableRow className="border-white/5 hover:bg-white/5">
            <TableHead className="font-black uppercase text-xs tracking-widest">Time</TableHead>
            <TableHead className="font-black uppercase text-xs tracking-widest">Type</TableHead>
            <TableHead className="font-black uppercase text-xs tracking-widest">Method</TableHead>
            <TableHead className="font-black uppercase text-xs tracking-widest">Status</TableHead>
            <TableHead className="font-black uppercase text-xs tracking-widest text-right">
              Gas Used
            </TableHead>
            <TableHead className="font-black uppercase text-xs tracking-widest">Hash</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((tx) => (
            <TableRow
              key={tx.hash}
              className="border-white/5 hover:bg-white/5 transition-colors group"
            >
              <TableCell className="font-mono text-xs text-muted-foreground">
                {new Date(tx.timestamp * 1000).toLocaleString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </TableCell>

              <TableCell>
                <Badge variant="outline" className={`${getTypeColor(tx.type)} text-xs`}>
                  {tx.type}
                </Badge>
              </TableCell>

              <TableCell className="font-mono text-xs">{tx.method || "-"}</TableCell>

              <TableCell>
                <div className="flex items-center gap-1.5">{getStatusIcon(tx.status)}</div>
              </TableCell>

              <TableCell className="font-mono text-xs text-right text-muted-foreground">
                {tx.gasUsed ? Number(tx.gasUsed).toLocaleString() : "-"}
              </TableCell>

              <TableCell>
                <a
                  href={getExplorerUrl(tx.hash)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1.5 group/link"
                >
                  <span className="truncate max-w-[120px]">{tx.hash}</span>
                  <ExternalLink className="h-3 w-3 opacity-0 group-hover/link:opacity-100 transition-opacity" />
                </a>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
