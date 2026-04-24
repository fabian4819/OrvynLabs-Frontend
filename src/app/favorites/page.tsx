"use client";

import { useState, useMemo, useEffect } from "react";
import { useProjects } from "@/hooks/useProjects";
import { ProjectGrid } from "@/components/projects/ProjectGrid";
import { useAccount } from "wagmi";
import { getFavorites, getFavoriteCount } from "@/lib/favorites";
import { Heart, ArrowLeft } from "lucide-react";
import { FadeIn, ParallaxBackground } from "@/components/ui/motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function FavoritesPage() {
  const { projects, isLoading } = useProjects();
  const { address, isConnected } = useAccount();
  const [favoriteAddresses, setFavoriteAddresses] = useState<string[]>([]);

  useEffect(() => {
    if (address) {
      setFavoriteAddresses(getFavorites(address));
    } else {
      setFavoriteAddresses([]);
    }
  }, [address]);

  const favoriteProjects = useMemo(() => {
    if (!favoriteAddresses.length) return [];
    return projects.filter(p =>
      favoriteAddresses.includes(p.address.toLowerCase())
    );
  }, [projects, favoriteAddresses]);

  const favoriteCount = address ? getFavoriteCount(address) : 0;

  if (!isConnected) {
    return (
      <div className="relative min-h-[calc(100vh-64px)] overflow-hidden">
        <ParallaxBackground />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <FadeIn>
            <div className="text-center py-32 glass-morphism rounded-[2.5rem] border-dashed border-white/10 mx-auto max-w-2xl flex flex-col items-center gap-6">
              <div className="p-6 bg-white/5 rounded-full">
                <Heart className="h-12 w-12 text-red-400/50" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">Connect Your Wallet</h2>
                <p className="text-muted-foreground max-w-md">
                  Connect your wallet to view and manage your favorite projects
                </p>
              </div>
              <Link href="/projects">
                <Button variant="outline" className="mt-4">
                  Browse Projects
                </Button>
              </Link>
            </div>
          </FadeIn>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-[calc(100vh-64px)] overflow-hidden">
      <ParallaxBackground />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        {/* Header */}
        <FadeIn>
          <div className="space-y-6">
            <Link href="/projects">
              <Button variant="ghost" size="sm" className="gap-2 -ml-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Projects
              </Button>
            </Link>

            <div className="flex items-end justify-between gap-8">
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <h1 className="text-5xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                    My Favorites
                  </h1>
                  <div className="px-3 py-1 rounded-full glass-morphism border border-red-500/30">
                    <div className="flex items-center gap-2 text-sm font-bold">
                      <Heart className="h-4 w-4 text-red-400 fill-red-500" />
                      <span className="text-red-400">{favoriteCount}</span>
                    </div>
                  </div>
                </div>
                <p className="text-muted-foreground text-sm max-w-lg font-medium leading-relaxed">
                  Your curated collection of research projects. All favorites are stored locally in your browser.
                </p>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Grid */}
        <div className="space-y-6">
          <FadeIn delay={0.1}>
            <div className="flex items-center gap-2 px-3">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-black">
                {isLoading ? "Loading favorites..." : `${favoriteProjects.length} Favorited Projects`}
              </p>
            </div>
          </FadeIn>

          {!isLoading && favoriteProjects.length === 0 && (
            <FadeIn>
              <div className="text-center py-32 glass-morphism rounded-[2.5rem] border-dashed border-white/10 mx-auto max-w-2xl flex flex-col items-center gap-4">
                <div className="p-4 bg-white/5 rounded-full">
                  <Heart className="h-8 w-8 text-red-400/30" />
                </div>
                <div className="space-y-2">
                  <p className="text-muted-foreground font-medium">No favorites yet</p>
                  <p className="text-xs text-muted-foreground/50 max-w-xs">
                    Click the heart icon on any project card to add it to your favorites
                  </p>
                </div>
                <Link href="/projects">
                  <Button variant="outline" className="mt-4">
                    Explore Projects
                  </Button>
                </Link>
              </div>
            </FadeIn>
          )}

          {favoriteProjects.length > 0 && (
            <ProjectGrid projects={favoriteProjects} isLoading={isLoading} />
          )}
        </div>
      </div>
    </div>
  );
}
