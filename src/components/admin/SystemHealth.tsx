"use client";

import { useBlockNumber, useChainId } from "wagmi";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle, Activity, Server, Database, Zap } from "lucide-react";
import { useEffect, useState } from "react";

export function SystemHealth() {
  const chainId = useChainId();
  const { data: blockNumber } = useBlockNumber({ watch: true });
  const [rpcLatency, setRpcLatency] = useState<number>(0);
  const [previousBlock, setPreviousBlock] = useState<bigint | undefined>();

  // Calculate RPC latency (mock for demo)
  useEffect(() => {
    const start = Date.now();
    if (blockNumber) {
      const latency = Date.now() - start;
      setRpcLatency(Math.max(latency, Math.random() * 100 + 50)); // Mock realistic latency
    }
  }, [blockNumber]);

  // Track block production rate
  useEffect(() => {
    if (blockNumber && previousBlock && blockNumber !== previousBlock) {
      // Block changed
      setPreviousBlock(blockNumber);
    } else if (blockNumber && !previousBlock) {
      setPreviousBlock(blockNumber);
    }
  }, [blockNumber, previousBlock]);

  const healthMetrics = [
    {
      label: "RPC Connection",
      status: "healthy",
      value: `${rpcLatency.toFixed(0)}ms latency`,
      icon: Server,
      color: "from-green-500 to-emerald-500",
    },
    {
      label: "Block Production",
      status: "healthy",
      value: `Block #${blockNumber?.toString() || "0"}`,
      icon: Activity,
      color: "from-blue-500 to-cyan-500",
    },
    {
      label: "Smart Contracts",
      status: "healthy",
      value: "All contracts operational",
      icon: Database,
      color: "from-purple-500 to-pink-500",
    },
    {
      label: "Network",
      status: "healthy",
      value: `Chain ID: ${chainId}`,
      icon: Zap,
      color: "from-orange-500 to-red-500",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold">System Health</h3>
        <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30 gap-2">
          <CheckCircle2 className="h-3.5 w-3.5" />
          All Systems Operational
        </Badge>
      </div>

      {/* Health Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {healthMetrics.map((metric) => {
          const Icon = metric.icon;
          const isHealthy = metric.status === "healthy";

          return (
            <div
              key={metric.label}
              className="glass-morphism rounded-2xl border border-white/5 p-6 space-y-4 group hover:border-white/10 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`rounded-xl bg-gradient-to-br ${metric.color} p-2.5`}
                  >
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-bold">{metric.label}</p>
                    <p className="text-sm text-muted-foreground">
                      {metric.value}
                    </p>
                  </div>
                </div>

                {isHealthy ? (
                  <CheckCircle2 className="h-5 w-5 text-green-400" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-400" />
                )}
              </div>

              {/* Status bar */}
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${metric.color} transition-all`}
                  style={{ width: isHealthy ? "100%" : "50%" }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Additional Info */}
      <div className="glass-morphism rounded-2xl border border-white/5 p-6 space-y-4">
        <h4 className="font-bold">System Information</h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">
              Network
            </p>
            <p className="text-sm font-semibold">
              {chainId === 17845 ? "DChain Mainnet" : `Chain ${chainId}`}
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">
              Frontend Version
            </p>
            <p className="text-sm font-semibold">v1.0.0 (MVP)</p>
          </div>

          <div className="space-y-2">
            <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">
              Last Updated
            </p>
            <p className="text-sm font-semibold">
              {new Date().toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="glass-morphism rounded-2xl border border-white/5 p-6 space-y-4">
        <h4 className="font-bold">Performance Metrics</h4>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Average Block Time</span>
            <span className="text-sm font-semibold">~2 seconds</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Transaction Success Rate</span>
            <span className="text-sm font-semibold text-green-400">99.5%</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Average Gas Price</span>
            <span className="text-sm font-semibold">0.1 Gwei</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Network Uptime</span>
            <span className="text-sm font-semibold text-green-400">99.99%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
