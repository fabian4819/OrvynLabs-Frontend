"use client";

import { useReadContracts } from "wagmi";
import { useChainId } from "wagmi";
import { getContracts } from "@/lib/contracts";
import { FundingPoolAbi, StakingVaultAbi, YieldDistributorAbi, ProjectFactoryAbi } from "@/lib/abis";

// Static gas snapshot data from `forge test --gas-report` (median gas per function).
// Values are in gas units (L2 execution gas on DChain).
// Last updated: from GasBenchmark.t.sol run (all 115 tests pass).
export const GAS_SNAPSHOT = [
  // Layer 1 — ResearchProject direct operations
  { fn: "ResearchProject.donate()", layer: "L1", gasUsed: 90_000, category: "donation" },
  { fn: "ResearchProject.claimRefund()", layer: "L1", gasUsed: 35_066, category: "donation" },
  // Layer 2 — Staking operations
  { fn: "StakingVault.stake()", layer: "L2", gasUsed: 153_364, category: "staking" },
  { fn: "StakingVault.unstake()", layer: "L2", gasUsed: 82_457, category: "staking" },
  // Layer 3 — Yield distribution
  { fn: "YieldDistributor.claimYield()", layer: "L3", gasUsed: 77_178, category: "yield" },
  { fn: "YieldDistributor.advanceEpoch()", layer: "L3", gasUsed: 159_911, category: "admin" },
  // Layer 4 — Factory / complex operations
  { fn: "ResearchProject.submitProof()", layer: "L4", gasUsed: 60_546, category: "factory" },
  { fn: "ResearchProject.vote()", layer: "L4", gasUsed: 142_176, category: "factory" },
  { fn: "ResearchProject.approveMilestone()", layer: "L4", gasUsed: 75_101, category: "factory" },
  { fn: "ProjectFactory.createProject()", layer: "L4", gasUsed: 524_768, category: "factory" },
];

export const LAYER_COLORS: Record<string, string> = {
  L1: "#3b82f6",   // blue
  L2: "#8b5cf6",   // violet
  L3: "#f59e0b",   // amber
  L4: "#ef4444",   // red
};

export function useAnalytics() {
  const chainId = useChainId();
  const contracts = getContracts(chainId);

  const { data, isLoading } = useReadContracts({
    contracts: [
      { address: contracts.fundingPool, abi: FundingPoolAbi, functionName: "totalDonations" },
      { address: contracts.fundingPool, abi: FundingPoolAbi, functionName: "totalYieldDistributed" },
      { address: contracts.fundingPool, abi: FundingPoolAbi, functionName: "totalPool" },
      { address: contracts.stakingVault, abi: StakingVaultAbi, functionName: "totalStaked" },
      { address: contracts.yieldDistributor, abi: YieldDistributorAbi, functionName: "currentEpoch" },
      { address: contracts.yieldDistributor, abi: YieldDistributorAbi, functionName: "rewardIndex" },
      { address: contracts.projectFactory, abi: ProjectFactoryAbi, functionName: "totalProjects" },
    ],
  });

  return {
    totalDonations: data?.[0]?.result as bigint | undefined,
    totalYieldDistributed: data?.[1]?.result as bigint | undefined,
    totalPool: data?.[2]?.result as bigint | undefined,
    totalStaked: data?.[3]?.result as bigint | undefined,
    currentEpoch: data?.[4]?.result as bigint | undefined,
    rewardIndex: data?.[5]?.result as bigint | undefined,
    projectCount: data?.[6]?.result as bigint | undefined,
    isLoading,
    gasSnapshot: GAS_SNAPSHOT,
  };
}
