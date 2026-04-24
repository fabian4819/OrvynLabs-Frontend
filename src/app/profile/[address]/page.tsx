"use client";

import { use } from "react";
import { useUserProfile } from "@/hooks/useUserProfile";
import { ParallaxBackground, FadeIn } from "@/components/ui/motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { getAvatarUrl, getGradientColors, getAddressInitials } from "@/lib/avatar";
import { shortenAddress, formatDkt } from "@/lib/utils";
import {
  Wallet,
  Coins,
  Target,
  TrendingUp,
  Award,
  ArrowLeft,
  Copy,
  Check,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { isAddress, type Address } from "viem";
import { useAccount } from "wagmi";

interface ProfilePageProps {
  params: Promise<{ address: string }>;
}

export default function ProfilePage({ params }: ProfilePageProps) {
  const { address: urlAddress } = use(params);
  const { address: connectedAddress } = useAccount();
  const [copied, setCopied] = useState(false);

  // Validate address
  const validAddress = isAddress(urlAddress) ? (urlAddress as Address) : undefined;
  const { stats, createdProjects, badges, dktBalance, isLoading } = useUserProfile(validAddress);

  const isOwnProfile = connectedAddress?.toLowerCase() === validAddress?.toLowerCase();
  const avatarUrl = validAddress ? getAvatarUrl(validAddress) : "";
  const gradient = validAddress ? getGradientColors(validAddress) : { from: "from-blue-500", to: "to-purple-500" };
  const initials = validAddress ? getAddressInitials(validAddress) : "??";

  const handleCopyAddress = () => {
    if (validAddress) {
      navigator.clipboard.writeText(validAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getExplorerUrl = (address: string) => {
    return `https://dchain.id/explorer/address/${address}`;
  };

  const getRarityColor = (rarity?: string) => {
    switch (rarity) {
      case "legendary":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "epic":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      case "rare":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "common":
      default:
        return "bg-white/5 text-white/70 border-white/10";
    }
  };

  if (!validAddress) {
    return (
      <div className="relative min-h-[calc(100vh-64px)] overflow-hidden">
        <ParallaxBackground />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <FadeIn>
            <div className="text-center py-32 glass-morphism rounded-[2.5rem] border-dashed border-white/10 mx-auto max-w-2xl flex flex-col items-center gap-4">
              <div className="p-4 bg-white/5 rounded-full">
                <Wallet className="h-8 w-8 text-red-400/30" />
              </div>
              <p className="text-muted-foreground font-medium">Invalid wallet address</p>
              <Link href="/projects">
                <Button variant="outline">Browse Projects</Button>
              </Link>
            </div>
          </FadeIn>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      icon: Coins,
      label: "DKT Balance",
      value: formatDkt(dktBalance),
      color: "text-blue-400",
    },
    {
      icon: TrendingUp,
      label: "Total Staked",
      value: formatDkt(stats.totalStaked),
      color: "text-purple-400",
    },
    {
      icon: Target,
      label: "Projects Created",
      value: stats.projectsCreated.toString(),
      color: "text-green-400",
    },
    {
      icon: Award,
      label: "Staking Rewards",
      value: formatDkt(BigInt(stats.stakingRewards || 0)),
      color: "text-amber-400",
    },
  ];

  return (
    <div className="relative min-h-[calc(100vh-64px)] overflow-hidden">
      <ParallaxBackground />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        {/* Back Button */}
        <FadeIn>
          <Link href="/projects">
            <Button variant="ghost" size="sm" className="gap-2 -ml-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </Link>
        </FadeIn>

        {/* Profile Header */}
        <FadeIn delay={0.1}>
          <Card className="glass-morphism border-white/10 overflow-hidden">
            {/* Banner */}
            <div className={`h-32 bg-gradient-to-r ${gradient.from} ${gradient.to}`} />

            <CardContent className="pt-0 pb-6 px-6">
              <div className="flex flex-col md:flex-row items-start md:items-end gap-6 -mt-16">
                {/* Avatar */}
                <div className="relative">
                  <div className="w-32 h-32 rounded-2xl border-4 border-background overflow-hidden bg-white/5">
                    <Image
                      src={avatarUrl}
                      alt={`Avatar for ${shortenAddress(validAddress)}`}
                      width={128}
                      height={128}
                      className="w-full h-full object-cover"
                      unoptimized
                    />
                  </div>
                  {isOwnProfile && (
                    <Badge className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-blue-500">
                      You
                    </Badge>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 space-y-3">
                  <div className="space-y-2">
                    <h1 className="text-3xl font-black tracking-tight">
                      {shortenAddress(validAddress)}
                    </h1>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={handleCopyAddress}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-xs font-mono"
                      >
                        <span className="text-muted-foreground">{validAddress}</span>
                        {copied ? (
                          <Check className="h-3 w-3 text-green-400" />
                        ) : (
                          <Copy className="h-3 w-3 text-muted-foreground" />
                        )}
                      </button>
                      <Link
                        href={getExplorerUrl(validAddress)}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button variant="ghost" size="sm" className="gap-2 h-8 text-xs">
                          View on Explorer
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </Link>
                    </div>
                  </div>

                  {/* Badges */}
                  {badges.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {badges.map((badge) => (
                        <Badge
                          key={badge.id}
                          variant="outline"
                          className={`${getRarityColor(badge.rarity)} gap-1.5 font-semibold`}
                          title={`${badge.description} (${badge.rarity || "common"})`}
                        >
                          <span>{badge.icon}</span>
                          <span className="text-xs">{badge.name}</span>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </FadeIn>

        {/* Stats Grid */}
        <FadeIn delay={0.2}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((stat, index) => (
              <Card
                key={index}
                className="glass-morphism border-white/10 hover:border-white/20 transition-colors"
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                        {stat.label}
                      </p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                    </div>
                    <div className={`p-3 rounded-xl bg-white/5 ${stat.color}`}>
                      <stat.icon className="h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </FadeIn>

        {/* Created Projects */}
        {createdProjects.length > 0 && (
          <FadeIn delay={0.3}>
            <Card className="glass-morphism border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-green-400" />
                  Created Projects
                  <Badge variant="outline" className="ml-2">
                    {createdProjects.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {createdProjects.map((project, index) => (
                    <ProjectCard key={project.address} project={project} index={index} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </FadeIn>
        )}

        {/* Empty State */}
        {createdProjects.length === 0 && isOwnProfile && (
          <FadeIn delay={0.3}>
            <div className="text-center py-20 glass-morphism rounded-[2.5rem] border-dashed border-white/10 space-y-4">
              <div className="inline-flex items-center justify-center p-4 rounded-full bg-white/5">
                <Target className="h-8 w-8 text-muted-foreground opacity-30" />
              </div>
              <div className="space-y-2">
                <p className="text-muted-foreground font-medium">No projects created yet</p>
                <p className="text-xs text-muted-foreground/50 max-w-xs mx-auto">
                  Create your first research project and start raising funds on the blockchain
                </p>
              </div>
              <Link href="/projects">
                <Button className="mt-4">Create Your First Project</Button>
              </Link>
            </div>
          </FadeIn>
        )}

        {createdProjects.length === 0 && !isOwnProfile && (
          <FadeIn delay={0.3}>
            <div className="text-center py-20 glass-morphism rounded-[2.5rem] border-dashed border-white/10">
              <p className="text-muted-foreground text-sm">This user hasn't created any projects yet</p>
            </div>
          </FadeIn>
        )}
      </div>
    </div>
  );
}
