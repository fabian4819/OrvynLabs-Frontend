"use client";

import { useState, useEffect } from "react";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther, zeroAddress } from "viem";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ConnectPrompt } from "@/components/web3/ConnectPrompt";
import { NetworkBadge } from "@/components/web3/NetworkBadge";
import { DiktiTokenAbi } from "@/lib/abis";
import { getContracts } from "@/lib/contracts";
import { cn, formatDkt, shortenAddress } from "@/lib/utils";
import { FadeIn, ParallaxBackground } from "@/components/ui/motion";
import { useChainId } from "wagmi";
import { Droplets, ShieldCheck, ShieldX, Copy, Check, AlertTriangle } from "lucide-react";

const MINTER_ROLE_HASH = "0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6";

export default function FaucetPage() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const contracts = getContracts(chainId);
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [copied, setCopied] = useState(false);

  const { data: isMinter } = useReadContract({
    address: contracts.diktiToken,
    abi: DiktiTokenAbi,
    functionName: "hasRole",
    args: [MINTER_ROLE_HASH, address!],
    query: { enabled: isConnected && !!address },
  });

  const { data: totalSupply } = useReadContract({
    address: contracts.diktiToken,
    abi: DiktiTokenAbi,
    functionName: "totalSupply",
    query: { enabled: true },
  });

  const { data: remainingSupply } = useReadContract({
    address: contracts.diktiToken,
    abi: DiktiTokenAbi,
    functionName: "remainingSupply",
    query: { enabled: true },
  });

  const { data: balance } = useReadContract({
    address: contracts.diktiToken,
    abi: DiktiTokenAbi,
    functionName: "balanceOf",
    args: [recipient! as `0x${string}`],
    query: { enabled: recipient.startsWith("0x") && recipient.length === 42 },
  });

  const { data: mintHash, writeContract: mint, isPending: isMintPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: mintHash });

  const minting = isMintPending || isConfirming;

  function handleMint() {
    if (!recipient || !amount) return;
    const parsedAmount = parseEther(amount);
    mint({
      address: contracts.diktiToken,
      abi: DiktiTokenAbi,
      functionName: "mint",
      args: [recipient as `0x${string}`, parsedAmount],
    });
  }

  function handleFillOwnAddress() {
    if (address) setRecipient(address);
  }

  useEffect(() => {
    if (isSuccess) {
      setAmount("");
    }
  }, [isSuccess]);

  if (!isConnected) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative">
        <ParallaxBackground />
        <FadeIn>
          <ConnectPrompt
            title="Connect to use the Faucet"
            description="Connect a wallet with MINTER_ROLE to mint Dikti Tokens."
          />
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
                Mint Dikti Tokens (admin only)
              </p>
            </div>
            <NetworkBadge className="self-start sm:self-auto" />
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className={cn(
            "flex items-center gap-3 rounded-2xl border p-4 text-sm font-medium",
            isMinter
              ? "border-green-500/20 bg-green-500/5 text-green-400"
              : "border-red-500/20 bg-red-500/5 text-red-400"
          )}>
            {isMinter ? (
              <>
                <ShieldCheck className="h-5 w-5 shrink-0" />
                <span>Your wallet has <span className="font-black">MINTER_ROLE</span>. You can mint DKT tokens.</span>
              </>
            ) : (
              <>
                <ShieldX className="h-5 w-5 shrink-0" />
                <span>Your wallet does <span className="font-black">NOT</span> have MINTER_ROLE. You cannot mint tokens.</span>
              </>
            )}
          </div>
        </FadeIn>

        <FadeIn delay={0.15}>
          <div className="grid grid-cols-2 gap-4">
            <Card className="glass-morphism border-white/5">
              <CardContent className="pt-6 space-y-1">
                <span className="text-[10px] uppercase tracking-widest font-black text-muted-foreground">Total Supply</span>
                <p className="font-black text-xl">{totalSupply !== undefined ? formatDkt(totalSupply) : "—"}</p>
              </CardContent>
            </Card>
            <Card className="glass-morphism border-white/5">
              <CardContent className="pt-6 space-y-1">
                <span className="text-[10px] uppercase tracking-widest font-black text-muted-foreground">Remaining Supply</span>
                <p className="font-black text-xl text-blue-400">{remainingSupply !== undefined ? formatDkt(remainingSupply) : "—"}</p>
              </CardContent>
            </Card>
          </div>
        </FadeIn>

        <FadeIn delay={0.2}>
          <Card className="glass-morphism border-white/5">
            <CardHeader>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Droplets className="h-4 w-4 text-blue-400" />
                Mint DKT Tokens
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Recipient Address
                </Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="0x..."
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    className="font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleFillOwnAddress}
                    className="shrink-0 text-xs"
                  >
                    Own
                  </Button>
                </div>
                {balance !== undefined && recipient.startsWith("0x") && recipient.length === 42 && (
                  <p className="text-xs text-muted-foreground">
                    Balance: <span className="font-bold text-foreground">{formatDkt(balance)} DKT</span>
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Amount (DKT)
                </Label>
                <Input
                  type="number"
                  placeholder="1000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="0"
                />
                <div className="flex gap-2">
                  {[100, 1000, 10000].map((preset) => (
                    <button
                      key={preset}
                      onClick={() => setAmount(String(preset))}
                      className="text-[11px] font-semibold px-3 py-1 rounded-lg bg-white/5 border border-white/10 hover:bg-blue-500/10 hover:border-blue-500/20 text-muted-foreground hover:text-blue-400 transition-all"
                    >
                      {preset.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              {isSuccess && (
                <div className="flex items-center gap-2 rounded-xl border border-green-500/20 bg-green-500/5 p-3 text-sm text-green-400">
                  <Check className="h-4 w-4 shrink-0" />
                  <span>DKT minted successfully! TX: {shortenAddress(mintHash!, 8)}</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(mintHash!);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="ml-auto shrink-0 hover:text-white transition-colors"
                  >
                    {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
              )}

              <Button
                onClick={handleMint}
                disabled={!isMinter || !recipient.startsWith("0x") || recipient.length !== 42 || !amount || parseFloat(amount) <= 0 || minting}
                className="w-full h-11 glow-blue rounded-xl font-bold tracking-tight"
              >
                {minting ? "Minting..." : "Mint DKT"}
              </Button>

              {!isMinter && (
                <div className="flex items-start gap-2 text-xs text-yellow-400/80">
                  <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                  <span>
                    Only accounts with <code className="bg-white/5 px-1 py-0.5 rounded text-yellow-300 font-mono">MINTER_ROLE</code> can mint. 
                    Use the Hardhat script: <code className="bg-white/5 px-1 py-0.5 rounded font-mono">npx hardhat run scripts/mint-dkt.js --network dchain &lt;addr&gt; &lt;amount&gt;</code>
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </FadeIn>

        <FadeIn delay={0.3}>
          <div className="rounded-3xl border border-white/5 bg-white/[0.02] p-6 text-sm text-muted-foreground space-y-3 relative overflow-hidden group backdrop-blur-sm">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-[60px] translate-x-1/2 -translate-y-1/2 group-hover:bg-purple-500/20 transition-all" />
            <p className="font-bold text-foreground flex items-center gap-2">
              <Droplets className="h-4 w-4 text-blue-400" />
              About DKT
            </p>
            <ul className="space-y-1.5 text-xs leading-relaxed list-none">
              <li><span className="text-muted-foreground">Token:</span> <span className="font-semibold text-foreground">DiktiToken (DKT)</span> — ERC-20 with 18 decimals</li>
              <li><span className="text-muted-foreground">Max Supply:</span> <span className="font-semibold text-foreground">1,000,000,000 DKT (1 billion)</span></li>
              <li><span className="text-muted-foreground">Minting:</span> <span className="font-semibold text-foreground">Restricted to MINTER_ROLE holders</span></li>
              <li><span className="text-muted-foreground">Use:</span> <span className="font-semibold text-foreground">Staking, project donations, yield rewards</span></li>
              <li><span className="text-muted-foreground">Contract:</span> <code className="bg-white/5 px-1.5 py-0.5 rounded font-mono text-blue-400">{contracts.diktiToken}</code></li>
            </ul>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
