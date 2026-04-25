"use client";

import { useChainId } from "wagmi";
import { cn } from "@/lib/utils";

const DCHAIN_ID = 17845;

export function NetworkBadge({ className }: { className?: string }) {
  const chainId = useChainId();

  const label =
    chainId === DCHAIN_ID
      ? "DChain"
      : "Unknown Network";

  const color =
    chainId === DCHAIN_ID
      ? "bg-purple-500/20 text-purple-400 border-purple-500/30"
      : "bg-red-500/20 text-red-400 border-red-500/30";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-xs font-medium border rounded-full px-2.5 py-0.5",
        color,
        className
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}
