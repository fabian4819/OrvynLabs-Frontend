"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ParallaxBackground, FadeIn } from "@/components/ui/motion";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import { shortenAddress, formatDkt } from "@/lib/utils";
import { Trophy, TrendingUp, Users, Award, Crown, Medal, Star } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

type LeaderboardTab = "projects" | "researchers" | "completed";

const TABS = [
  { id: "projects", label: "Top Projects", icon: Trophy },
  { id: "researchers", label: "Top Researchers", icon: Users },
  { id: "completed", label: "Completed Projects", icon: Award },
] as const;

function getRankIcon(rank: number) {
  switch (rank) {
    case 1:
      return <Crown className="h-5 w-5 text-yellow-400" />;
    case 2:
      return <Medal className="h-5 w-5 text-gray-300" />;
    case 3:
      return <Medal className="h-5 w-5 text-amber-600" />;
    default:
      return <span className="text-sm font-bold text-muted-foreground">#{rank}</span>;
  }
}

function getRankBadge(rank: number) {
  switch (rank) {
    case 1:
      return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    case 2:
      return "bg-gray-400/20 text-gray-300 border-gray-400/30";
    case 3:
      return "bg-amber-600/20 text-amber-500 border-amber-600/30";
    default:
      return "bg-white/5 text-muted-foreground border-white/10";
  }
}

export default function LeaderboardPage() {
  const [activeTab, setActiveTab] = useState<LeaderboardTab>("projects");
  const { topProjects, topResearchers, topCompletedProjects, isLoading } = useLeaderboard();

  const getCurrentData = () => {
    switch (activeTab) {
      case "projects":
        return topProjects;
      case "researchers":
        return topResearchers;
      case "completed":
        return topCompletedProjects;
    }
  };

  const currentData = getCurrentData();

  return (
    <div className="relative min-h-[calc(100vh-64px)] overflow-hidden">
      <ParallaxBackground />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        {/* Header */}
        <FadeIn>
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center p-4 rounded-full glass-morphism border border-yellow-500/30 mb-4">
              <Trophy className="h-10 w-10 text-yellow-400" />
            </div>
            <h1 className="text-5xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
              Leaderboard
            </h1>
            <p className="text-muted-foreground text-sm max-w-2xl mx-auto leading-relaxed">
              Top performers on the Orvyn-Labs platform. Rankings updated in real-time based on blockchain activity.
            </p>
          </div>
        </FadeIn>

        {/* Tabs */}
        <FadeIn delay={0.1}>
          <div className="flex items-center justify-center gap-2 p-2 rounded-2xl glass-morphism border border-white/10 max-w-2xl mx-auto">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as LeaderboardTab)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold transition-all flex-1 ${
                    activeTab === tab.id
                      ? "bg-blue-500 text-white shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                      : "text-muted-foreground hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.label.split(" ")[1] || tab.label}</span>
                </button>
              );
            })}
          </div>
        </FadeIn>

        {/* Leaderboard */}
        <FadeIn delay={0.2}>
          <Card className="glass-morphism border-white/10 overflow-hidden">
            <CardHeader className="bg-white/5 border-b border-white/5">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-400" />
                {TABS.find((t) => t.id === activeTab)?.label}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {currentData.length === 0 ? (
                <div className="text-center py-20 text-muted-foreground">
                  <Trophy className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p className="text-sm">No data available yet</p>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {currentData.map((entry, index) => (
                    <motion.div
                      key={entry.address}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`flex items-center gap-4 p-6 hover:bg-white/5 transition-colors ${
                        entry.rank <= 3 ? "bg-white/[0.02]" : ""
                      }`}
                    >
                      {/* Rank */}
                      <div className="flex items-center justify-center w-12 h-12 shrink-0">
                        {getRankIcon(entry.rank)}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0 space-y-1">
                        {activeTab === "projects" || activeTab === "completed" ? (
                          <>
                            <Link
                              href={`/projects/${entry.address}`}
                              className="font-semibold text-sm hover:text-blue-400 transition-colors line-clamp-1"
                            >
                              {(entry as any).title || shortenAddress(entry.address)}
                            </Link>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span className="font-mono">{shortenAddress((entry as any).researcher)}</span>
                            </div>
                          </>
                        ) : (
                          <Link
                            href={`/profile/${entry.address}`}
                            className="font-mono text-sm font-semibold hover:text-blue-400 transition-colors"
                          >
                            {shortenAddress(entry.address)}
                          </Link>
                        )}
                      </div>

                      {/* Stats */}
                      <div className="text-right space-y-1">
                        <div className="flex items-center gap-2 justify-end">
                          {activeTab === "researchers" ? (
                            <>
                              <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/30">
                                {Number(entry.value)} {Number(entry.value) === 1 ? "Project" : "Projects"}
                              </Badge>
                            </>
                          ) : (
                            <p className="text-lg font-bold text-blue-400">
                              {formatDkt(entry.value)}
                            </p>
                          )}
                        </div>
                        {activeTab === "researchers" && (entry as any).totalRaised > 0n && (
                          <p className="text-xs text-muted-foreground">
                            {formatDkt((entry as any).totalRaised)} raised
                          </p>
                        )}
                        {(entry as any).percentage !== undefined && (
                          <p className="text-xs text-muted-foreground">
                            {(entry as any).percentage.toFixed(1)}% of total
                          </p>
                        )}
                      </div>

                      {/* Rank Badge */}
                      <Badge
                        variant="outline"
                        className={`${getRankBadge(entry.rank)} font-bold shrink-0`}
                      >
                        #{entry.rank}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </FadeIn>

        {/* Achievement Info */}
        <FadeIn delay={0.3}>
          <Card className="glass-morphism border-white/10 bg-gradient-to-br from-yellow-500/5 to-purple-500/5">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-yellow-500/10 shrink-0">
                  <Star className="h-6 w-6 text-yellow-400" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-bold text-sm">Earn Achievements</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Climb the leaderboard by creating projects, donating to research, and staking DKT tokens.
                    Top performers earn exclusive achievement badges displayed on their profiles.
                  </p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <Badge variant="outline" className="bg-yellow-500/10 text-yellow-400 border-yellow-500/30 text-xs">
                      🚀 Pioneer
                    </Badge>
                    <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/30 text-xs">
                      💎 Generous Patron
                    </Badge>
                    <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/30 text-xs">
                      🐋 Whale Staker
                    </Badge>
                    <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30 text-xs">
                      🔬 Prolific Researcher
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </FadeIn>
      </div>
    </div>
  );
}
