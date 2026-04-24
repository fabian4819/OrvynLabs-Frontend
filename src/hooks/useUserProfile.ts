import { useReadContract, useChainId } from "wagmi";
import { getContracts } from "@/lib/contracts";
import { DiktiTokenAbi, StakingVaultAbi } from "@/lib/abis";
import { useProjects } from "./useProjects";
import { useLeaderboard } from "./useLeaderboard";
import { useMemo } from "react";
import type { Address } from "viem";

export interface UserStats {
  totalDonated: bigint;
  totalStaked: bigint;
  projectsCreated: number;
  projectsDonatedTo: number;
  stakingRewards: bigint;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
  rarity?: "common" | "rare" | "epic" | "legendary";
}

export function useUserProfile(address: Address | undefined) {
  const chainId = useChainId();
  const contracts = getContracts(chainId);
  const { projects } = useProjects();
  const { getAchievements } = useLeaderboard();

  // Get DKT balance
  const { data: dktBalance } = useReadContract({
    address: contracts.diktiToken,
    abi: DiktiTokenAbi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  // Get staking info
  const { data: stakeData } = useReadContract({
    address: contracts.stakingVault,
    abi: StakingVaultAbi,
    functionName: "stakedBalance",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  // Get pending rewards
  // Note: calculateRewards function not available in contract ABI
  // In production, would calculate from YieldDistributor
  const pendingRewards = 0n;

  // Calculate user stats from projects
  const userStats = useMemo(() => {
    if (!address || !projects.length) {
      return {
        totalDonated: 0n,
        totalStaked: stakeData || 0n,
        projectsCreated: 0,
        projectsDonatedTo: 0,
        stakingRewards: pendingRewards || 0n,
      };
    }

    const projectsCreated = projects.filter(
      (p) => p.researcher.toLowerCase() === address.toLowerCase()
    );

    // Note: To get donation amounts, we'd need to query project contracts individually
    // For MVP, we'll show count of projects donated to based on donor mappings
    // This would require event logs or project contract calls

    return {
      totalDonated: 0n, // Would need to aggregate from project contracts
      totalStaked: stakeData || 0n,
      projectsCreated: projectsCreated.length,
      projectsDonatedTo: 0, // Would need event logs
      stakingRewards: pendingRewards || 0n,
    };
  }, [address, projects, stakeData, pendingRewards]);

  // Get projects created by user
  const createdProjects = useMemo(() => {
    if (!address) return [];
    return projects.filter(
      (p) => p.researcher.toLowerCase() === address.toLowerCase()
    );
  }, [address, projects]);

  // Calculate badges based on activity using the leaderboard achievements
  const badges = useMemo((): Badge[] => {
    if (!address) return [];

    const achievements = getAchievements(address, {
      projectsCreated: userStats.projectsCreated,
      totalDonated: userStats.totalDonated,
      totalStaked: userStats.totalStaked,
    });

    return achievements.map((a) => ({
      id: a.id,
      name: a.name,
      description: a.description,
      icon: a.icon,
      earned: true,
      rarity: a.rarity,
    }));
  }, [address, userStats, getAchievements]);

  return {
    stats: userStats,
    createdProjects,
    badges,
    dktBalance: dktBalance || 0n,
    isLoading: false,
  };
}
