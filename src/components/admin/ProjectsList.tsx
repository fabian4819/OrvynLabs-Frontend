"use client";

import { useProjects } from "@/hooks/useProjects";
import { Badge } from "@/components/ui/badge";
import { formatDkt } from "@/lib/utils";
import Link from "next/link";
import { ExternalLink, TrendingUp, Calendar, DollarSign } from "lucide-react";

export function ProjectsList() {
  const { projects, isLoading } = useProjects();

  if (isLoading) {
    return (
      <div className="glass-morphism rounded-3xl border border-white/5 p-12 text-center">
        <p className="text-muted-foreground">Loading projects...</p>
      </div>
    );
  }

  const getStatusName = (status: number) => {
    switch (status) {
      case 0: return "Active";
      case 1: return "Completed";
      case 2: return "Cancelled";
      default: return "Unknown";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "funded":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "completed":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      case "cancelled":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold">All Projects</h3>
        <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/30">
          {projects.length} total
        </Badge>
      </div>

      {/* Projects Table */}
      <div className="glass-morphism rounded-3xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-widest">
                  Project
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-widest">
                  Researcher
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-widest">
                  Status
                </th>
                <th className="px-6 py-4 text-right text-xs font-bold text-muted-foreground uppercase tracking-widest">
                  Raised / Goal
                </th>
                <th className="px-6 py-4 text-right text-xs font-bold text-muted-foreground uppercase tracking-widest">
                  Progress
                </th>
                <th className="px-6 py-4 text-center text-xs font-bold text-muted-foreground uppercase tracking-widest">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {projects.map((project) => {
                const raised = project.totalRaised || 0n;
                const goal = project.currentGoal || 1n;
                const progress = Number((raised * 100n) / goal);

                return (
                  <tr key={project.address} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <p className="font-semibold">{project.title}</p>
                        <p className="text-xs text-muted-foreground font-mono">
                          {project.address?.slice(0, 10)}...
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-mono">
                        {project.researcher?.slice(0, 6)}...{project.researcher?.slice(-4)}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="outline" className={getStatusColor(getStatusName(project.status))}>
                        {getStatusName(project.status)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="space-y-1">
                        <p className="font-bold">{formatDkt(raised)}</p>
                        <p className="text-xs text-muted-foreground">
                          of {formatDkt(goal)}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="space-y-2">
                        <p className="text-sm font-bold">{progress}%</p>
                        <div className="w-24 ml-auto h-2 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all"
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Link
                        href={`/projects/${project.address}`}
                        className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {projects.length === 0 && (
        <div className="glass-morphism rounded-3xl border border-white/5 p-12 text-center">
          <p className="text-muted-foreground">No projects found</p>
        </div>
      )}
    </div>
  );
}
