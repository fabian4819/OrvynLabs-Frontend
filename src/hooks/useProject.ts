"use client";

import { useReadContracts, useReadContract } from "wagmi";
import { useAccount } from "wagmi";
import { ResearchProjectAbi, FundingPoolAbi } from "@/lib/abis";

// Mirrors the Solidity MilestoneStatus enum
export enum MilestoneStatus {
  Pending  = 0,
  Voting   = 1,
  Approved = 2,
  Rejected = 3,
  Skipped  = 4,
}

// Mirrors the Solidity ProjectStatus enum
export enum ProjectStatus {
  Active    = 0,
  Completed = 1,
  Cancelled = 2,
}

export interface Milestone {
  title:            string;
  goal:             bigint;
  deadline:         bigint;
  raised:           bigint;
  votesYes:         bigint;
  votesNo:          bigint;
  voteDeadline:     bigint;
  proofUri:         string;
  status:           MilestoneStatus;
  uniqueDonorCount: bigint;
  refundDeadline:   bigint;
}

export function useProject(projectAddress: `0x${string}`) {
  const { address } = useAccount();
  const zero = "0x0000000000000000000000000000000000000000" as const;

  // Step 1 — read top-level project state
  const { data, isLoading: loadingMeta, refetch: refetchMeta } = useReadContracts({
    contracts: [
      { address: projectAddress, abi: ResearchProjectAbi, functionName: "title" as const },
      { address: projectAddress, abi: ResearchProjectAbi, functionName: "researcher" as const },
      { address: projectAddress, abi: ResearchProjectAbi, functionName: "projectStatus" as const },
      { address: projectAddress, abi: ResearchProjectAbi, functionName: "currentMilestoneIndex" as const },
      { address: projectAddress, abi: ResearchProjectAbi, functionName: "milestoneCount" as const },
      { address: projectAddress, abi: ResearchProjectAbi, functionName: "totalRaised" as const },
      { address: projectAddress, abi: ResearchProjectAbi, functionName: "fundingPool" as const },
    ] as const,
  });

  const title               = data?.[0]?.result as string | undefined;
  const researcher          = data?.[1]?.result as `0x${string}` | undefined;
  const projectStatus       = data?.[2]?.result as number | undefined;
  const currentMilestoneIndex = data?.[3]?.result as bigint | undefined;
  const milestoneCount      = data?.[4]?.result as bigint | undefined;
  const totalRaised         = data?.[5]?.result as bigint | undefined;
  const fundingPool         = data?.[6]?.result as `0x${string}` | undefined;

  // Step 2 — once we know milestoneCount, read all milestones
  const count = Number(milestoneCount ?? 0);
  const milestoneContracts = Array.from({ length: count }, (_, i) => ({
    address: projectAddress,
    abi: ResearchProjectAbi,
    functionName: "getMilestone" as const,
    args: [BigInt(i)] as const,
  }));

  const { data: milestoneData, isLoading: loadingMilestones, refetch: refetchMilestones } = useReadContracts({
    contracts: milestoneContracts,
    query: { enabled: count > 0 },
  });

  // Step 3 — for each milestone, read the connected user's donation and vote state
  const currentIdx = Number(currentMilestoneIndex ?? 0);
  const caller = (address ?? zero) as `0x${string}`;

  // Build per-milestone user reads (donations + voteRound + votedRound for all milestones)
  const userPerMilestoneContracts = Array.from({ length: count }, (_, i) => ([
    {
      address: projectAddress,
      abi: ResearchProjectAbi,
      functionName: "donations" as const,
      args: [BigInt(i), caller] as const,
    },
    {
      address: projectAddress,
      abi: ResearchProjectAbi,
      functionName: "voteRound" as const,
      args: [BigInt(i)] as const,
    },
    {
      address: projectAddress,
      abi: ResearchProjectAbi,
      functionName: "votedRound" as const,
      args: [BigInt(i), caller] as const,
    },
  ])).flat();

  const { data: userMilestoneData, isLoading: loadingUserData, refetch: refetchUserData } = useReadContracts({
    contracts: userPerMilestoneContracts,
    query: { enabled: count > 0 },
  });

  // Parse milestones
  const milestones: Milestone[] = [];
  if (milestoneData) {
    for (let i = 0; i < count; i++) {
      const raw = milestoneData[i]?.result as {
        title: string; goal: bigint; deadline: bigint; raised: bigint;
        votesYes: bigint; votesNo: bigint; proofUri: string; status: number;
        voteDeadline: bigint; uniqueDonorCount: bigint; refundDeadline: bigint;
      } | undefined;
      if (raw) {
        milestones.push({
          title:            raw.title,
          goal:             raw.goal,
          deadline:         raw.deadline,
          raised:           raw.raised,
          votesYes:         raw.votesYes,
          votesNo:          raw.votesNo,
          proofUri:         raw.proofUri,
          status:           raw.status as MilestoneStatus,
          voteDeadline:     raw.voteDeadline,
          uniqueDonorCount: raw.uniqueDonorCount,
          refundDeadline:   raw.refundDeadline,
        });
      }
    }
  }

  // Parse per-milestone user data (3 entries per milestone: donations, voteRound, votedRound)
  const myDonationsPerMilestone: bigint[] = Array.from({ length: count }, (_, i) =>
    (userMilestoneData?.[i * 3]?.result as bigint | undefined) ?? 0n
  );

  // Correct vote tracking: user has voted if votedRound === voteRound + 1
  const hasVotedPerMilestone: boolean[] = Array.from({ length: count }, (_, i) => {
    const voteRound = (userMilestoneData?.[i * 3 + 1]?.result as bigint | undefined) ?? 0n;
    const votedRound = (userMilestoneData?.[i * 3 + 2]?.result as bigint | undefined) ?? 0n;
    return votedRound === voteRound + 1n;
  });

  const myCurrentDonation = address ? myDonationsPerMilestone[currentIdx] : undefined;
  const hasVoted          = address ? hasVotedPerMilestone[currentIdx] : undefined;

  // totalDisbursed = sum of raised for all Approved milestones (funds already sent to researcher)
  const totalDisbursed: bigint = milestones
    .filter(ms => ms.status === MilestoneStatus.Approved)
    .reduce((acc, ms) => acc + ms.raised, 0n);

  // yieldReceived = DKT routed to this project via staker yield donations (held in FundingPool)
  const { data: yieldReceivedData, refetch: refetchYield } = useReadContract({
    address: fundingPool,
    abi: FundingPoolAbi,
    functionName: "projectAllocations",
    args: [projectAddress],
    query: { enabled: !!fundingPool },
  });
  const yieldReceived = yieldReceivedData as bigint | undefined;

  async function refetch() {
    await refetchMeta();
    await refetchMilestones();
    await refetchUserData();
    await refetchYield();
  }

  return {
    title,
    researcher,
    projectStatus,
    currentMilestoneIndex: currentIdx,
    milestoneCount: count,
    totalRaised,
    fundingPool,
    totalDisbursed,
    yieldReceived,
    milestones,
    myCurrentDonation,
    myDonationsPerMilestone,
    hasVoted,
    hasVotedPerMilestone,
    isLoading: loadingMeta || loadingMilestones || loadingUserData,
    refetch,
  };
}
