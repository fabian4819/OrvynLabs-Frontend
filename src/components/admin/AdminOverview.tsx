"use client";

import { useProjects } from "@/hooks/useProjects";
import { useReadContract, useBlockNumber } from "wagmi";
import { getContracts } from "@/lib/contracts";
import { useChainId } from "wagmi";
import { DiktiTokenAbi, StakingVaultAbi } from "@/lib/abis";
import { formatDkt } from "@/lib/utils";
import { TrendingUp, Users, Coins, Activity } from "lucide-react";

export function AdminOverview() {
  const chainId = useChainId();
  const contracts = getContracts(chainId);
  const { projects } = useProjects();
  const { data: blockNumber } = useBlockNumber({ watch: true });

  // Get total supply
  const { data: totalSupply } = useReadContract({
    address: contracts.diktiToken,
    abi: DiktiTokenAbi,
    functionName: "totalSupply",
  });

  // Get total staked
  const { data: totalStaked } = useReadContract({
    address: contracts.stakingVault,
    abi: StakingVaultAbi,
    functionName: "totalStaked",
  });

  // Calculate total raised
  const totalRaised = projects.reduce((sum, p) => sum + (p.totalRaised || 0n), 0n);

  // Count active projects (status 0 = Active)
  const activeProjects = projects.filter((p) => p.status === 0).length;

  const stats = [
    {
      label: "Total Projects",
      value: projects.length.toString(),
      change: `${activeProjects} active`,
      icon: TrendingUp,
      color: "from-blue-500 to-cyan-500",
    },
    {
      label: "Total DKT Supply",
      value: totalSupply ? formatDkt(totalSupply) : "0.00",
      change: "Total circulation",
      icon: Coins,
      color: "from-purple-500 to-pink-500",
    },
    {
      label: "Total Staked",
      value: totalStaked ? formatDkt(totalStaked) : "0.00",
      change: "Locked in staking",
      icon: Users,
      color: "from-green-500 to-emerald-500",
    },
    {
      label: "Block Height",
      value: blockNumber ? blockNumber.toString() : "0",
      change: "Current block",
      icon: Activity,
      color: "from-orange-500 to-red-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className="glass-morphism rounded-3xl border border-white/5 p-6 space-y-4 relative overflow-hidden group"
          >
            {/* Gradient background */}
            <div
              className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 transition-opacity`}
            />

            <div className="flex items-center justify-between relative z-10">
              <div
                className={`rounded-xl bg-gradient-to-br ${stat.color} p-2.5`}
              >
                <Icon className="h-5 w-5 text-white" />
              </div>
              <span className="text-xs text-muted-foreground">
                {stat.change}
              </span>
            </div>

            <div className="space-y-1 relative z-10">
              <p className="text-sm text-muted-foreground font-medium">
                {stat.label}
              </p>
              <p className="text-2xl font-black">{stat.value}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
