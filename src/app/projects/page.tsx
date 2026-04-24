"use client";

import { useState, useMemo } from "react";
import { useProjects } from "@/hooks/useProjects";
import { ProjectGrid } from "@/components/projects/ProjectGrid";
import { NetworkBadge } from "@/components/web3/NetworkBadge";
import { CreateProjectDialog } from "@/components/projects/CreateProjectDialog";
import { useAccount } from "wagmi";
import { SearchInput } from "@/components/ui/search-input";
import { FlaskConical, Filter } from "lucide-react";
import { FadeIn, StaggerContainer, StaggerItem, ParallaxBackground } from "@/components/ui/motion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProjectStatus } from "@/lib/utils";
import { getProjectMetadata, type ProjectCategory, CATEGORIES } from "@/lib/projectMetadata";

export default function ProjectsPage() {
  const { projects, isLoading, projectCount, refetch } = useProjects();
  const { isConnected } = useAccount();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<ProjectCategory | "all">("all");

  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      const matchesSearch =
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.address.toLowerCase().includes(search.toLowerCase()) ||
        p.researcher.toLowerCase().includes(search.toLowerCase());

      const matchesStatus = statusFilter === "all" || p.status === parseInt(statusFilter);

      const metadata = getProjectMetadata(p.address);
      const matchesCategory = categoryFilter === "all" || metadata?.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [projects, search, statusFilter, categoryFilter]);

  return (
    <div className="relative min-h-[calc(100vh-64px)] overflow-hidden">
      <ParallaxBackground />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        {/* Header */}
        <FadeIn>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <h1 className="text-5xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">Projects</h1>
                <NetworkBadge />
              </div>
              <p className="text-muted-foreground text-sm max-w-lg font-medium leading-relaxed">
                Browse and fund decentralized research on Base. Each project is a self-contained smart contract verifying Indonesia&apos;s research potential.
              </p>
            </div>

            <div className="flex flex-col lg:flex-row items-center gap-4 w-full md:w-auto">
              <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                <div className="w-full sm:w-64">
                  <SearchInput
                    placeholder="Search registry..."
                    value={search}
                    onChange={setSearch}
                  />
                </div>
                
                <div className="w-full sm:w-44">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="h-12 rounded-2xl glass-morphism border-white/10 focus:ring-blue-500/50 text-sm">
                      <div className="flex items-center gap-2">
                        <Filter className="h-3.5 w-3.5 text-blue-400" />
                        <SelectValue placeholder="Status" />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="glass-morphism border-white/10">
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value={ProjectStatus.Active.toString()}>Active</SelectItem>
                      <SelectItem value={ProjectStatus.Completed.toString()}>Completed</SelectItem>
                      <SelectItem value={ProjectStatus.Cancelled.toString()}>Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="w-full sm:w-48">
                  <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v as ProjectCategory | "all")}>
                    <SelectTrigger className="h-12 rounded-2xl glass-morphism border-white/10 focus:ring-blue-500/50 text-sm">
                      <div className="flex items-center gap-2">
                        <FlaskConical className="h-3.5 w-3.5 text-purple-400" />
                        <SelectValue placeholder="Category" />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="glass-morphism border-white/10">
                      <SelectItem value="all">All Categories</SelectItem>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {isConnected && (
                <div className="shrink-0 w-full lg:w-auto">
                  <CreateProjectDialog onCreated={refetch} />
                </div>
              )}
            </div>
          </div>
        </FadeIn>

        <div className="space-y-6">
          <FadeIn delay={0.1}>
            <div className="flex items-center justify-between px-3">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-black">
                  {isLoading ? "Fetching ledger data..." : `Protocol Live: ${filteredProjects.length} Projects`}
                </p>
              </div>
              {!isLoading && (search || statusFilter !== "all" || categoryFilter !== "all") && (
                <button
                  onClick={() => {
                    setSearch("");
                    setStatusFilter("all");
                    setCategoryFilter("all");
                  }}
                  className="text-[10px] uppercase tracking-widest text-blue-400 hover:text-blue-300 font-black transition-colors"
                >
                  Reset Registry
                </button>
              )}
            </div>
          </FadeIn>

          {/* Grid */}
          <StaggerContainer delay={0.2} staggerDelay={0.08}>
            <ProjectGrid projects={filteredProjects} isLoading={isLoading} />
          </StaggerContainer>
        </div>

        {!isLoading && filteredProjects.length === 0 && (search || statusFilter !== "all") && (
          <FadeIn>
            <div className="text-center py-32 glass-morphism rounded-[2.5rem] border-dashed border-white/10 mx-auto max-w-2xl flex flex-col items-center gap-4">
              <div className="p-4 bg-white/5 rounded-full">
                <FlaskConical className="h-8 w-8 text-muted-foreground opacity-20" />
              </div>
              <p className="text-muted-foreground font-medium">No results found in the project registry</p>
              <p className="text-xs text-muted-foreground/50 max-w-xs">
                Try adjusting your search terms or filters to find what you&apos;re looking for.
              </p>
            </div>
          </FadeIn>
        )}
      </div>
    </div>
  );
}
