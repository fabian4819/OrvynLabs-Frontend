import { useMemo } from "react";
import { useProjects } from "./useProjects";
import { useReadContract, useChainId } from "wagmi";
import { getContracts } from "@/lib/contracts";
import { StakingVaultAbi } from "@/lib/abis";

export type TimeRange = "24h" | "7d" | "30d" | "all";

export interface TimeSeriesDataPoint {
  timestamp: number;
  date: string;
  value: number;
}

/**
 * Generate time-series data for charts
 * Note: For MVP, we'll generate mock historical data based on current state
 * In production, this would come from indexed blockchain events
 */
export function useChartData(timeRange: TimeRange = "30d") {
  const { projects } = useProjects();
  const chainId = useChainId();
  const contracts = getContracts(chainId);

  // Get current staking pool stats
  const { data: totalStaked } = useReadContract({
    address: contracts.stakingVault,
    abi: StakingVaultAbi,
    functionName: "totalStaked",
  });

  // Note: Using mock data for stakerCount as function doesn't exist in contract
  // In production, would query from indexed events
  const stakerCount = 0n;

  // Calculate time range in milliseconds
  const getRangeMs = (range: TimeRange): number => {
    const now = Date.now();
    switch (range) {
      case "24h":
        return 24 * 60 * 60 * 1000;
      case "7d":
        return 7 * 24 * 60 * 60 * 1000;
      case "30d":
        return 30 * 24 * 60 * 60 * 1000;
      case "all":
        return 90 * 24 * 60 * 60 * 1000; // 90 days
    }
  };

  // Generate mock historical data points
  const generateTimeSeries = (
    currentValue: number,
    dataPoints: number,
    growthRate: number = 0.1
  ): TimeSeriesDataPoint[] => {
    const rangeMs = getRangeMs(timeRange);
    const interval = rangeMs / (dataPoints - 1);
    const now = Date.now();

    return Array.from({ length: dataPoints }, (_, i) => {
      const timestamp = now - rangeMs + i * interval;
      // Simulate growth over time (exponential)
      const progress = i / (dataPoints - 1);
      const value = currentValue * (1 - growthRate) * Math.pow(1 + growthRate, progress * 10);

      return {
        timestamp,
        date: new Date(timestamp).toLocaleDateString(),
        value: Math.floor(value),
      };
    });
  };

  // Staking growth over time
  const stakingData = useMemo(() => {
    const current = Number(totalStaked || 0n) / 1e18;
    const points = timeRange === "24h" ? 24 : timeRange === "7d" ? 14 : 30;
    return generateTimeSeries(current, points, 0.3);
  }, [totalStaked, timeRange]);

  // Project count growth over time
  const projectGrowthData = useMemo(() => {
    const current = projects.length;
    const points = timeRange === "24h" ? 24 : timeRange === "7d" ? 14 : 30;
    return generateTimeSeries(current, points, 0.2);
  }, [projects.length, timeRange]);

  // Staker count growth over time
  const stakerGrowthData = useMemo(() => {
    const current = Number(stakerCount || 0n);
    const points = timeRange === "24h" ? 24 : timeRange === "7d" ? 14 : 30;
    return generateTimeSeries(current, points, 0.25);
  }, [stakerCount, timeRange]);

  // Project distribution by status
  const projectDistribution = useMemo(() => {
    const statusCounts = {
      Active: 0,
      Completed: 0,
      Cancelled: 0,
    };

    projects.forEach((project) => {
      switch (project.status) {
        case 0: // Active
          statusCounts.Active++;
          break;
        case 1: // Completed
          statusCounts.Completed++;
          break;
        case 2: // Cancelled
          statusCounts.Cancelled++;
          break;
      }
    });

    return [
      { name: "Active", value: statusCounts.Active, color: "#3b82f6" },
      { name: "Completed", value: statusCounts.Completed, color: "#10b981" },
      { name: "Cancelled", value: statusCounts.Cancelled, color: "#ef4444" },
    ].filter((item) => item.value > 0);
  }, [projects]);

  // Funding progress data
  const fundingProgressData = useMemo(() => {
    return projects
      .filter((p) => p.status === 0) // Only active projects
      .map((p) => {
        const raised = Number(p.currentRaised) / 1e18;
        const goal = Number(p.currentGoal) / 1e18;
        const progress = goal > 0 ? (raised / goal) * 100 : 0;

        return {
          name: p.title.slice(0, 20) + (p.title.length > 20 ? "..." : ""),
          raised,
          goal,
          progress: Math.min(progress, 100),
        };
      })
      .sort((a, b) => b.progress - a.progress)
      .slice(0, 10); // Top 10 projects
  }, [projects]);

  return {
    stakingData,
    projectGrowthData,
    stakerGrowthData,
    projectDistribution,
    fundingProgressData,
  };
}
