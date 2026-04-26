"use client";

import { useState, useEffect } from "react";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { formatEther, zeroAddress } from "viem";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ConnectPrompt } from "@/components/web3/ConnectPrompt";
import { NetworkBadge } from "@/components/web3/NetworkBadge";
import { TxButton } from "@/components/web3/TxButton";
import { getContracts } from "@/lib/contracts";
import { DiktiTokenAbi } from "@/lib/abis";
import { cn, formatDkt } from "@/lib/utils";
import { FadeIn, ParallaxBackground } from "@/components/ui/motion";
import { Droplets, Clock, Check, Copy, AlertCircle } from "lucide-react";

const FAUCET_ABI = [
  { type: "function", name: "claimAmount", inputs: [], outputs: [{ name: "", type: "uint256" }], stateMutability: "view" },
  { type: "function", name: "cooldown", inputs: [], outputs: [{ name: "", type: "uint256" }], stateMutability: "view" },
  { type: "function", name: "canClaim", inputs: [{ name: "user", type: "address" }], outputs: [{ name: "", type: "bool" }], stateMutability: "view" },
  { type: "function", name: "nextClaimTime", inputs: [{ name: "user", type: "address" }], outputs: [{ name: "", type: "uint256" }], stateMutability: "view" },
  { type: "function", name: "lastClaim", inputs: [{ name: "", type: "address" }], outputs: [{ name: "", type: "uint256" }], stateMutability: "view" },
  { type: "function", name: "claim", inputs: [], outputs: [], stateMutability: "nonpayable" },
  { type: "event", name: "Claimed", inputs: [{ name: "user", type: "address", indexed: true }, { name: "amount", type: "uint256", indexed: false }] },
] as const;

export default function FaucetPage() {
  const { address, isConnected } = useAccount();
  const contracts = getContracts(17845);
  const faucetAddress = process.env.NEXT_PUBLIC_DKT_FAUCET as `0x${string}`;
  const [copied, setCopied] = useState(false);

  const { data: claimAmount, refetch: refetchAmount } = useReadContract({
    address: faucetAddress,
    abi: FAUCET_ABI,
    functionName: "claimAmount",
  });

  const { data: cooldown, refetch: refetchCooldown } = useReadContract({
    address: faucetAddress,
    abi: FAUCET_ABI,
    functionName: "cooldown",
  });

  const { data: canClaimData, refetch: refetchCanClaim } = useReadContract({
    address: faucetAddress,
    abi: FAUCET_ABI,
    functionName: "canClaim",
    args: [address!],
    query: { enabled: !!address },
  });

  const { data: nextClaimTime } = useReadContract({
    address: faucetAddress,
    abi: FAUCET_ABI,
    functionName: "nextClaimTime",
    args: [address!],
    query: { enabled: !!address },
  });

  const { data: dktBalance, refetch: refetchBalance } = useReadContract({
    address: contracts.diktiToken,
    abi: DiktiTokenAbi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const { data: claimHash, writeContract: doClaim, isPending: isClaimPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: claimHash });

  const claiming = isClaimPending || isConfirming;

  function handleClaim() {
    doClaim({
      address: faucetAddress,
      abi: FAUCET_ABI,
      functionName: "claim",
    });
  }

  function formatCooldown(seconds: bigint) {
    const s = Number(seconds);
    if (s < 60) return `${s}s`;
    if (s < 3600) return `${Math.floor(s / 60)}m`;
    if (s < 86400) return `${Math.floor(s / 3600)}h`;
    return `${Math.floor(s / 86400)}d`;
  }

  function formatNextClaim(timestamp: bigint) {
    if (timestamp === 0n) return "Now";
    const diff = Number(timestamp) - Math.floor(Date.now() / 1000);
    if (diff <= 0) return "Now";
    if (diff < 60) return `${diff}s`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ${diff % 60}s`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ${Math.floor((diff % 3600) / 60)}m`;
    return `${Math.floor(diff / 86400)}d`;
  }

  useEffect(() => {
    if (isSuccess) {
      refetchCanClaim();
      refetchAmount();
      refetchBalance();
    }
  }, [isSuccess, refetchCanClaim, refetchAmount, refetchBalance]);

  if (!isConnected) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative">
        <ParallaxBackground />
        <FadeIn>
          <ConnectPrompt title="Connect to claim DKT" description="Connect your wallet to claim free Dikti Tokens from the faucet." />
        </FadeIn>
      </div>
    );
  }

  return (
    <div className="relative min-h-[calc(100vh-64px)] overflow-hidden">
      <ParallaxBackground />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <FadeIn>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
            <div className="space-y-1">
              <h1 className="text-4xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                DKT Faucet
              </h1>
              <p className="text-muted-foreground text-sm font-medium">
                Claim free Dikti Tokens for testing
              </p>
            </div>
            <NetworkBadge className="self-start sm:self-auto" />
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="grid grid-cols-2 gap-4">
            <Card className="glass-morphism border-white/5">
              <CardContent className="pt-6 space-y-1">
                <span className="text-[10px] uppercase tracking-widest font-black text-muted-foreground">Your Balance</span>
                <p className="font-black text-xl text-blue-400">{dktBalance !== undefined ? formatDkt(dktBalance) : "—"}</p>
              </CardContent>
            </Card>
            <Card className="glass-morphism border-white/5">
              <CardContent className="pt-6 space-y-1">
                <span className="text-[10px] uppercase tracking-widest font-black text-muted-foreground">Claim Amount</span>
                <p className="font-black text-xl">{claimAmount !== undefined ? formatDkt(claimAmount) : "—"}</p>
              </CardContent>
            </Card>
          </div>
        </FadeIn>

        <FadeIn delay={0.15}>
          <Card className="glass-morphism border-white/5 rounded-[2.5rem] overflow-hidden">
            <CardHeader className="bg-blue-500/10 border-b border-blue-500/10 py-6 px-8">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Droplets className="h-4 w-4 text-blue-400" />
                Claim DKT
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <p className="text-sm text-muted-foreground">
                Claim <span className="text-blue-400 font-black">{claimAmount !== undefined ? formatDkt(claimAmount) : "..."}</span> DKT
                {cooldown && <span className="text-muted-foreground"> every <span className="font-semibold">{formatCooldown(cooldown)}</span></span>}.
                No MINTER_ROLE needed — anyone can claim.
              </p>

              {isSuccess && (
                <div className="flex items-center gap-2 rounded-xl border border-green-500/20 bg-green-500/5 p-3 text-sm text-green-400">
                  <Check className="h-4 w-4 shrink-0" />
                  <span>DKT claimed! TX: {claimHash!.slice(0, 10)}...{claimHash!.slice(-8)}</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(claimHash!);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="ml-auto shrink-0 hover:text-white transition-colors"
                  >
                    {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
              )}

              <TxButton
                txState={claiming ? "pending" : isSuccess ? "success" : "idle"}
                idleLabel="Claim DKT"
                disabled={!canClaimData && canClaimData !== undefined}
                onClick={handleClaim}
                className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-lg glow-blue"
              />

              {canClaimData === false && nextClaimTime && nextClaimTime > 0n && (
                <div className="flex items-center gap-2 text-xs text-amber-400/80">
                  <Clock className="h-3.5 w-3.5" />
                  <span>Next claim available in <span className="font-bold">{formatNextClaim(nextClaimTime)}</span></span>
                </div>
              )}
            </CardContent>
          </Card>
        </FadeIn>

        <FadeIn delay={0.2}>
          <div className="rounded-3xl border border-white/5 bg-white/[0.02] p-6 text-sm text-muted-foreground space-y-3 relative overflow-hidden group backdrop-blur-sm">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-[60px] translate-x-1/2 -translate-y-1/2 group-hover:bg-purple-500/20 transition-all" />
            <p className="font-bold text-foreground flex items-center gap-2">
              <Droplets className="h-4 w-4 text-blue-400" />
              About the Faucet
            </p>
            <ul className="space-y-1.5 text-xs leading-relaxed list-none">
              <li><span className="text-muted-foreground">Token:</span> <span className="font-semibold text-foreground">DiktiToken (DKT)</span> — ERC-20 with 18 decimals</li>
              <li><span className="text-muted-foreground">Claim:</span> <span className="font-semibold text-foreground">{claimAmount ? formatDkt(claimAmount) : "10,000"} DKT per claim</span></li>
              <li><span className="text-muted-foreground">Cooldown:</span> <span className="font-semibold text-foreground">{cooldown ? formatCooldown(cooldown) : "1 hour"}</span></li>
              <li><span className="text-muted-foreground">Access:</span> <span className="font-semibold text-foreground">Public — any connected wallet</span></li>
              <li><span className="text-muted-foreground">Faucet Contract:</span> <code className="bg-white/5 px-1.5 py-0.5 rounded font-mono text-blue-400">{faucetAddress}</code></li>
            </ul>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
