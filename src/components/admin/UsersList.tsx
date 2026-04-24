"use client";

import { useProjects } from "@/hooks/useProjects";
import { Badge } from "@/components/ui/badge";
import { useMemo } from "react";
import { User, Crown } from "lucide-react";

export function UsersList() {
  const { projects } = useProjects();

  // Extract unique researchers
  const researchers = useMemo(() => {
    const uniqueResearchers = new Map<string, {
      address: string;
      projectCount: number;
      totalRaised: bigint;
    }>();

    projects.forEach((project) => {
      if (!project.researcher) return;

      const existing = uniqueResearchers.get(project.researcher);
      if (existing) {
        existing.projectCount++;
        existing.totalRaised += BigInt(project.totalRaised || 0);
      } else {
        uniqueResearchers.set(project.researcher, {
          address: project.researcher,
          projectCount: 1,
          totalRaised: BigInt(project.totalRaised || 0),
        });
      }
    });

    return Array.from(uniqueResearchers.values()).sort(
      (a, b) => Number(b.totalRaised - a.totalRaised)
    );
  }, [projects]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold">Active Researchers</h3>
        <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/30">
          {researchers.length} users
        </Badge>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {researchers.map((researcher, index) => (
          <div
            key={researcher.address}
            className="glass-morphism rounded-2xl border border-white/5 p-6 space-y-4 hover:border-white/10 transition-all group"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                {/* Avatar */}
                <div className="rounded-full bg-gradient-to-br from-blue-500 to-purple-600 p-3">
                  {index === 0 ? (
                    <Crown className="h-5 w-5 text-yellow-300" />
                  ) : (
                    <User className="h-5 w-5 text-white" />
                  )}
                </div>

                {/* Address */}
                <div>
                  <p className="font-bold font-mono text-sm">
                    {researcher.address.slice(0, 6)}...{researcher.address.slice(-4)}
                  </p>
                  {index === 0 && (
                    <Badge variant="outline" className="bg-yellow-500/10 text-yellow-400 border-yellow-500/30 text-xs mt-1">
                      Top Researcher
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">
                  Projects
                </p>
                <p className="text-xl font-black">{researcher.projectCount}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">
                  Total Raised
                </p>
                <p className="text-xl font-black">
                  {(Number(researcher.totalRaised) / 1e18).toFixed(0)} DKT
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {researchers.length === 0 && (
        <div className="glass-morphism rounded-3xl border border-white/5 p-12 text-center">
          <User className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
          <p className="text-muted-foreground">No researchers found</p>
        </div>
      )}
    </div>
  );
}
