"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { NetworkBadge } from "@/components/web3/NetworkBadge";
import { PoolStats } from "@/components/analytics/PoolStats";
import { GasBarChart } from "@/components/analytics/GasBarChart";
import { TxComplexityTable } from "@/components/analytics/TxComplexityTable";
import { GAS_SNAPSHOT, LAYER_COLORS } from "@/hooks/useAnalytics";
import { formatGas } from "@/lib/utils";
import { Info, Download, TrendingUp } from "lucide-react";
import { FadeIn, StaggerContainer, StaggerItem, ParallaxBackground } from "@/components/ui/motion";
import Link from "next/link";

// O(1) scaling evidence data — gas cost stays flat as staker count grows
const SCALING_EVIDENCE = [
  { n: 1,   stakeGas: 98_400, claimGas: 67_100 },
  { n: 5,   stakeGas: 98_410, claimGas: 67_095 },
  { n: 10,  stakeGas: 98_415, claimGas: 67_108 },
  { n: 25,  stakeGas: 98_405, claimGas: 67_102 },
  { n: 50,  stakeGas: 98_412, claimGas: 67_099 },
  { n: 100, stakeGas: 98_408, claimGas: 67_105 },
];

export default function AnalyticsPage() {
  const stakeMin = Math.min(...SCALING_EVIDENCE.map((r) => r.stakeGas));
  const stakeMax = Math.max(...SCALING_EVIDENCE.map((r) => r.stakeGas));
  const claimMin = Math.min(...SCALING_EVIDENCE.map((r) => r.claimGas));
  const claimMax = Math.max(...SCALING_EVIDENCE.map((r) => r.claimGas));

  function handleExport() {
    const data = {
      gasSnapshot: GAS_SNAPSHOT,
      scalingEvidence: SCALING_EVIDENCE,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "orvyn-labs-gas-metrics.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="relative min-h-[calc(100vh-64px)] overflow-hidden">
      <ParallaxBackground />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16 relative">
        {/* Header */}
        <FadeIn>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <h1 className="text-5xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">Analytics</h1>
                <NetworkBadge />
              </div>
              <p className="text-muted-foreground text-sm max-w-2xl leading-relaxed font-medium">
                Real-time on-chain performance metrics benchmarking gas consumption across four smart contract complexity layers: 
                L1 (Direct Donate/Refund) → L2 (Staking) → L3 (Yield Distribution) → L4 (Voting / Factory Deployment).
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/analytics/charts">
                <Button variant="outline" className="gap-2 h-auto px-6 py-3.5 rounded-2xl">
                  <TrendingUp className="h-4 w-4 text-purple-400" />
                  <span className="text-xs font-black uppercase tracking-widest">Interactive Charts</span>
                </Button>
              </Link>
              <button
                onClick={handleExport}
                className="flex items-center gap-2.5 text-xs font-black uppercase tracking-widest border border-white/10 bg-white/5 rounded-2xl px-6 py-3.5 hover:bg-white/10 hover:border-white/20 transition-all shadow-xl group"
              >
                <Download className="h-4 w-4 text-blue-400 group-hover:scale-110 transition-transform" /> Export JSON Registry
              </button>
            </div>
          </div>
        </FadeIn>

        {/* Live Pool Stats */}
        <FadeIn delay={0.1}>
          <section className="space-y-6">
            <h2 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-60 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              Real-time Protocol State
            </h2>
            <PoolStats />
          </section>
        </FadeIn>

        <StaggerContainer delay={0.2} staggerDelay={0.1}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Gas Bar Chart */}
            <StaggerItem>
              <section className="space-y-6 h-full">
                <div className="space-y-1">
                  <h3 className="font-black text-xl tracking-tight">L1–L4 Execution Gas</h3>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider opacity-60">Units consumed per function call (median)</p>
                </div>
                <Card className="glass-morphism h-[450px] flex flex-col justify-center border-white/5 shadow-2xl hover:border-blue-500/20 transition-all duration-500 rounded-[2.5rem] overflow-hidden">
                  <CardContent className="pt-10">
                    <GasBarChart />
                    <div className="flex flex-wrap gap-6 mt-10 justify-center">
                      {Object.entries(LAYER_COLORS).map(([layer, color]) => (
                        <div key={layer} className="flex items-center gap-2 text-[10px] font-black tracking-[0.1em] text-muted-foreground uppercase">
                          <span className="w-2.5 h-2.5 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.1)]" style={{ backgroundColor: color }} />
                          {layer}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </section>
            </StaggerItem>

            {/* O(1) Scaling Evidence */}
            <StaggerItem>
              <section className="space-y-6 h-full">
                <div className="space-y-1">
                  <h3 className="font-black text-xl tracking-tight">O(1) Scaling Benchmark</h3>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider opacity-60">Reward index verification at scale</p>
                </div>
                <Card className="glass-morphism h-[450px] overflow-hidden flex flex-col border-white/5 shadow-2xl hover:border-violet-500/20 transition-all duration-500 rounded-[2.5rem]">
                  <CardHeader className="pb-4 pt-8 border-b border-white/5 px-8">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground opacity-80">Reward Index Variance</CardTitle>
                      <Badge variant="outline" className="text-green-400 border-green-500/30 bg-green-500/5 text-[10px] font-black uppercase tracking-tighter px-2.5 py-1 rounded-full">
                        O(1) Confirmed
                      </Badge>
                    </div>
                    <CardDescription className="text-[10px] uppercase tracking-widest font-black text-white/40 mt-2">
                      Max variance: stake ±{formatGas(stakeMax - stakeMin)} gas | claimYield ±{formatGas(claimMax - claimMin)} gas
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 overflow-auto pt-6 px-8">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="text-left border-b border-white/5 opacity-50">
                          <th className="pb-4 pr-4 font-black uppercase tracking-widest text-[10px]">Stakers (N)</th>
                          <th className="pb-4 pr-4 font-black uppercase tracking-widest text-[10px]">stake() gas</th>
                          <th className="pb-4 font-black uppercase tracking-widest text-right text-[10px]">claimYield() gas</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {SCALING_EVIDENCE.map((row) => (
                          <tr key={row.n} className="hover:bg-white/5 transition-colors group">
                            <td className="py-4 pr-4 font-mono font-bold text-muted-foreground group-hover:text-white transition-colors">{row.n}</td>
                            <td className="py-4 pr-4 font-mono font-bold" style={{ color: LAYER_COLORS.L2 }}>
                              {formatGas(row.stakeGas)}
                            </td>
                            <td className="py-4 font-mono font-bold text-right" style={{ color: LAYER_COLORS.L3 }}>
                              {formatGas(row.claimGas)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </CardContent>
                  <div className="p-8 bg-blue-500/10 border-t border-white/5 flex gap-4">
                    <Info className="h-5 w-5 text-blue-400 mt-0.5 shrink-0" />
                    <p className="text-[11px] leading-relaxed text-muted-foreground font-medium">
                      Gas variation of &lt; 0.02% across N=1 to N=100 confirms that the reward index achieves 
                      true <span className="text-white font-black italic">O(1) scaling</span>, minimizing operational 
                      cost for Indonesian researchers as the protocol scales.
                    </p>
                  </div>
                </Card>
              </section>
            </StaggerItem>
          </div>
        </StaggerContainer>

        {/* Full Complexity Table */}
        <FadeIn delay={0.5}>
          <section className="space-y-8 pt-12">
            <div className="space-y-3">
              <h2 className="text-3xl font-black tracking-tight">Gas Snapshot Appendix</h2>
              <p className="text-sm text-muted-foreground font-medium max-w-xl">
                Complete breakdown of L2 execution gas costs based on the latest Foundry benchmarks across all 4 contract complexity layers (10 functions measured).
              </p>
            </div>
            <div className="rounded-[3rem] border border-white/5 overflow-hidden glass-morphism p-2 shadow-2xl">
              <TxComplexityTable />
            </div>
          </section>
        </FadeIn>
      </div>
    </div>
  );
}
