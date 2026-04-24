import { useMemo } from "react";
import { useProjects } from "./useProjects";
import { useReadContract, useChainId } from "wagmi";
import { getContracts } from "@/lib/contracts";
import { StakingVaultAbi } from "@/lib/abis";

export interface LeaderboardEntry {
  address: string;
  value: bigint;
  rank: number;
  percentage?: number;
}

export interface AchievementBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: "common" | "rare" | "epic" | "legendary";
}

/**
 * Calculate leaderboards from on-chain data
 */
export function useLeaderboard() {
  const { projects } = useProjects();
  const chainId = useChainId();
  const contracts = getContracts(chainId);

  const { data: totalStaked } = useReadContract({
    address: contracts.stakingVault,
    abi: StakingVaultAbi,
    functionName: "totalStaked",
  });

  // Top Projects by Total Raised
  const topProjects = useMemo(() => {
    const projectsWithRaised = projects
      .map((p) => ({
        address: p.address,
        value: p.totalRaised,
        title: p.title,
        researcher: p.researcher,
      }))
      .filter((p) => p.value > 0n)
      .sort((a, b) => (a.value > b.value ? -1 : 1));

    const totalRaised = projectsWithRaised.reduce((sum, p) => sum + p.value, 0n);

    return projectsWithRaised.slice(0, 10).map((p, i) => ({
      address: p.address,
      value: p.value,
      rank: i + 1,
      title: p.title,
      researcher: p.researcher,
      percentage: totalRaised > 0n ? Number((p.value * 10000n) / totalRaised) / 100 : 0,
    }));
  }, [projects]);

  // Top Researchers by Projects Created
  const topResearchers = useMemo(() => {
    const researcherMap = new Map<string, { count: number; totalRaised: bigint }>();

    projects.forEach((p) => {
      const current = researcherMap.get(p.researcher.toLowerCase()) || {
        count: 0,
        totalRaised: 0n,
      };
      researcherMap.set(p.researcher.toLowerCase(), {
        count: current.count + 1,
        totalRaised: current.totalRaised + p.totalRaised,
      });
    });

    const sorted = Array.from(researcherMap.entries())
      .map(([address, data]) => ({
        address,
        value: BigInt(data.count),
        totalRaised: data.totalRaised,
      }))
      .sort((a, b) => {
        // Sort by count first, then by total raised
        if (a.value !== b.value) return a.value > b.value ? -1 : 1;
        return a.totalRaised > b.totalRaised ? -1 : 1;
      });

    return sorted.slice(0, 10).map((r, i) => ({
      address: r.address,
      value: r.value,
      rank: i + 1,
      totalRaised: r.totalRaised,
    }));
  }, [projects]);

  // Top Projects by Completion (status = Completed)
  const topCompletedProjects = useMemo(() => {
    const completed = projects
      .filter((p) => p.status === 1) // Completed
      .map((p) => ({
        address: p.address,
        value: p.totalRaised,
        title: p.title,
        researcher: p.researcher,
      }))
      .sort((a, b) => (a.value > b.value ? -1 : 1));

    return completed.slice(0, 10).map((p, i) => ({
      address: p.address,
      value: p.value,
      rank: i + 1,
      title: p.title,
      researcher: p.researcher,
    }));
  }, [projects]);

  // Calculate achievement badges for a user
  const getAchievements = (
    userAddress: string,
    userStats?: {
      projectsCreated: number;
      totalDonated: bigint;
      totalStaked: bigint;
    }
  ): AchievementBadge[] => {
    const badges: AchievementBadge[] = [];

    if (!userStats) return badges;

    // Pioneer - Created first project
    if (userStats.projectsCreated > 0) {
      badges.push({
        id: "pioneer",
        name: "Pioneer",
        description: "Created a research project",
        icon: "🚀",
        rarity: "common",
      });
    }

    // Prolific Researcher - 5+ projects
    if (userStats.projectsCreated >= 5) {
      badges.push({
        id: "prolific",
        name: "Prolific Researcher",
        description: "Created 5+ research projects",
        icon: "🔬",
        rarity: "rare",
      });
    }

    // Generous Patron - Donated >1000 DKT
    if (userStats.totalDonated >= 1000n * 10n ** 18n) {
      badges.push({
        id: "generous",
        name: "Generous Patron",
        description: "Donated over 1,000 DKT",
        icon: "💎",
        rarity: "epic",
      });
    }

    // Mega Donor - Donated >10000 DKT
    if (userStats.totalDonated >= 10000n * 10n ** 18n) {
      badges.push({
        id: "mega-donor",
        name: "Mega Donor",
        description: "Donated over 10,000 DKT",
        icon: "👑",
        rarity: "legendary",
      });
    }

    // Whale Staker - Staked >10000 DKT
    if (userStats.totalStaked >= 10000n * 10n ** 18n) {
      badges.push({
        id: "whale",
        name: "Whale Staker",
        description: "Staked over 10,000 DKT",
        icon: "🐋",
        rarity: "legendary",
      });
    }

    // Big Staker - Staked >1000 DKT
    if (userStats.totalStaked >= 1000n * 10n ** 18n) {
      badges.push({
        id: "big-staker",
        name: "Big Staker",
        description: "Staked over 1,000 DKT",
        icon: "💪",
        rarity: "epic",
      });
    }

    // Active Staker - Any amount staked
    if (userStats.totalStaked > 0n) {
      badges.push({
        id: "staker",
        name: "Staker",
        description: "Supporting the platform by staking",
        icon: "⭐",
        rarity: "common",
      });
    }

    return badges;
  };

  return {
    topProjects,
    topResearchers,
    topCompletedProjects,
    getAchievements,
    isLoading: false,
  };
}
