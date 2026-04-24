"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FadeIn, StaggerContainer, StaggerItem, ParallaxBackground } from "@/components/ui/motion";
import { NetworkBadge } from "@/components/web3/NetworkBadge";
import { StakingGrowthChart } from "@/components/analytics/StakingGrowthChart";
import { ProjectDistributionChart } from "@/components/analytics/ProjectDistributionChart";
import { ProjectGrowthChart } from "@/components/analytics/ProjectGrowthChart";
import { TimeRangeSelector } from "@/components/analytics/TimeRangeSelector";
import { useChartData, type TimeRange } from "@/hooks/useChartData";
import { TrendingUp, PieChart, BarChart3, Activity, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ChartsPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");
  const {
    stakingData,
    projectGrowthData,
    stakerGrowthData,
    projectDistribution,
  } = useChartData(timeRange);

  return (
    <div className="relative min-h-[calc(100vh-64px)] overflow-hidden">
      <ParallaxBackground />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        {/* Header */}
        <FadeIn>
          <Link href="/analytics">
            <Button variant="ghost" size="sm" className="gap-2 -ml-2 mb-4">
              <ArrowLeft className="h-4 w-4" />
              Back to Analytics
            </Button>
          </Link>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <h1 className="text-5xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                  Interactive Charts
                </h1>
                <NetworkBadge />
              </div>
              <p className="text-muted-foreground text-sm max-w-2xl leading-relaxed font-medium">
                Real-time platform metrics and growth trends visualized with interactive charts.
                Select a time range to explore historical data.
              </p>
            </div>

            <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
          </div>
        </FadeIn>

        {/* Charts Grid */}
        <StaggerContainer delay={0.1} staggerDelay={0.1}>
          {/* Staking Growth */}
          <StaggerItem>
            <Card className="glass-morphism border-white/10 hover:border-blue-500/20 transition-all duration-500">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-blue-400" />
                      Total Staked Growth
                    </CardTitle>
                    <CardDescription>
                      Historical DKT staking volume over time
                    </CardDescription>
                  </div>
                  <div className="p-3 rounded-xl bg-blue-500/10">
                    <Activity className="h-6 w-6 text-blue-400" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <StakingGrowthChart data={stakingData} />
              </CardContent>
            </Card>
          </StaggerItem>

          {/* Two Column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            {/* Project Growth */}
            <StaggerItem>
              <Card className="glass-morphism border-white/10 hover:border-purple-500/20 transition-all duration-500">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-purple-400" />
                        Project Count Growth
                      </CardTitle>
                      <CardDescription>
                        Total research projects over time
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ProjectGrowthChart data={projectGrowthData} />
                </CardContent>
              </Card>
            </StaggerItem>

            {/* Project Distribution */}
            <StaggerItem>
              <Card className="glass-morphism border-white/10 hover:border-green-500/20 transition-all duration-500">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <CardTitle className="flex items-center gap-2">
                        <PieChart className="h-5 w-5 text-green-400" />
                        Project Status Distribution
                      </CardTitle>
                      <CardDescription>
                        Breakdown by active, completed, and cancelled
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ProjectDistributionChart data={projectDistribution} />
                </CardContent>
              </Card>
            </StaggerItem>
          </div>

          {/* Staker Growth */}
          <StaggerItem>
            <Card className="glass-morphism border-white/10 hover:border-amber-500/20 transition-all duration-500 mt-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-amber-400" />
                      Staker Count Growth
                    </CardTitle>
                    <CardDescription>
                      Number of unique stakers participating in the protocol
                    </CardDescription>
                  </div>
                  <div className="p-3 rounded-xl bg-amber-500/10">
                    <Activity className="h-6 w-6 text-amber-400" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ProjectGrowthChart data={stakerGrowthData} />
              </CardContent>
            </Card>
          </StaggerItem>
        </StaggerContainer>

        {/* Info Card */}
        <FadeIn delay={0.5}>
          <Card className="glass-morphism border-white/10 bg-gradient-to-br from-blue-500/5 to-purple-500/5">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-blue-500/10 shrink-0">
                  <Activity className="h-5 w-5 text-blue-400" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-bold text-sm">About These Metrics</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    These charts visualize platform growth trends based on current blockchain state.
                    For the MVP, historical data is simulated to demonstrate chart functionality.
                    In production, this would be powered by indexed blockchain events from a Graph Protocol subgraph or similar indexer.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </FadeIn>
      </div>
    </div>
  );
}
