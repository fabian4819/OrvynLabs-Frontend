import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FundingProgress } from "./FundingProgress";
import { shortenAddress, formatDeadline, statusLabel, statusColor, isExpired } from "@/lib/utils";
import type { ProjectData } from "@/hooks/useProjects";
import { Clock, User, Layers, Tag } from "lucide-react";
import { motion } from "framer-motion";
import { getProjectImageOrPlaceholder } from "@/lib/projectImages";
import { getProjectMetadata, CATEGORY_ICONS, CATEGORY_COLORS } from "@/lib/projectMetadata";
import { FavoriteButton } from "./FavoriteButton";

interface ProjectCardProps {
  project: ProjectData;
  index: number;
}

export function ProjectCard({ project, index }: ProjectCardProps) {
  const router = useRouter();
  const expired = isExpired(project.currentDeadline);
  const hasActiveMilestone = project.currentDeadline > 0n;
  const milestoneLabel = `Milestone ${Number(project.currentMilestoneIndex) + 1} / ${Number(project.milestoneCount)}`;
  const imageUrl = getProjectImageOrPlaceholder(project.address);
  const metadata = getProjectMetadata(project.address);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ y: -5 }}
    >
      <Card
        className="h-full flex flex-col glass-morphism hover:border-blue-500/50 transition-all duration-300 cursor-pointer group shadow-sm hover:shadow-xl hover:shadow-blue-500/10 overflow-hidden"
        onClick={() => router.push(`/projects/${project.address}`)}
      >
          {/* Project Image */}
          <div className="relative w-full h-48 bg-gradient-to-br from-blue-500/10 to-purple-500/10 overflow-hidden">
            <Image
              src={imageUrl}
              alt={project.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

            {/* Category Badge */}
            {metadata?.category && (
              <div className="absolute top-3 left-3">
                <Badge
                  variant="outline"
                  className={`${CATEGORY_COLORS[metadata.category]} backdrop-blur-md text-xs font-semibold`}
                >
                  <span className="mr-1">{CATEGORY_ICONS[metadata.category]}</span>
                  {metadata.category}
                </Badge>
              </div>
            )}

            <div className="absolute top-3 right-3" onClick={(e) => { e.stopPropagation(); e.nativeEvent.stopImmediatePropagation(); }}>
              <FavoriteButton projectAddress={project.address} size="sm" />
            </div>
          </div>

          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-bold text-base leading-tight group-hover:text-blue-400 transition-colors line-clamp-2">
                {project.title}
              </h3>
              <Badge
                variant="outline"
                className={`${statusColor(project.status)} whitespace-nowrap`}
              >
                {statusLabel(project.status)}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="flex-1 space-y-5">
            {/* Current milestone funding progress */}
            <div className="space-y-2">
              <FundingProgress raised={project.currentRaised} goal={project.currentGoal} />
            </div>

            <div className="space-y-2 text-xs text-muted-foreground">
              {/* Milestone counter */}
              <div className="flex items-center gap-2 p-2 rounded-lg bg-white/5 border border-white/5">
                <Layers className="h-3.5 w-3.5 text-purple-400" />
                <span className="font-mono">{milestoneLabel}</span>
              </div>

              <Link
                href={`/profile/${project.researcher}`}
                onClick={(e) => {
                  e.stopPropagation();
                  e.nativeEvent.stopImmediatePropagation();
                }}
                className="flex items-center gap-2 p-2 rounded-lg bg-white/5 border border-white/5 hover:border-blue-500/30 transition-colors group/researcher"
              >
                <User className="h-3.5 w-3.5 text-blue-400 group-hover/researcher:text-blue-300" />
                <span className="font-mono text-xs group-hover/researcher:text-blue-300 transition-colors">
                  {shortenAddress(project.researcher)}
                </span>
              </Link>

              {hasActiveMilestone && (
                <div className="flex items-center gap-2 p-2 rounded-lg bg-white/5 border border-white/5">
                  <Clock className="h-3.5 w-3.5 text-amber-400" />
                  <span className={expired ? "text-red-400 font-semibold" : ""}>
                    {expired ? "Expired " : "Deadline: "}
                    {formatDeadline(project.currentDeadline)}
                  </span>
                </div>
              )}
            </div>

            {/* Tags */}
            {metadata?.tags && metadata.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {metadata.tags.slice(0, 3).map((tag, idx) => (
                  <Badge
                    key={idx}
                    variant="outline"
                    className="bg-white/5 text-[10px] border-white/10 text-muted-foreground px-2 py-0.5"
                  >
                    #{tag}
                  </Badge>
                ))}
                {metadata.tags.length > 3 && (
                  <Badge
                    variant="outline"
                    className="bg-white/5 text-[10px] border-white/10 text-muted-foreground px-2 py-0.5"
                  >
                    +{metadata.tags.length - 3}
                  </Badge>
                )}
              </div>
            )}
          </CardContent>

          <CardFooter className="pt-2 pb-4">
            <div className="w-full flex items-center justify-between text-[10px] font-mono opacity-50 group-hover:opacity-100 transition-opacity">
              <span className="truncate max-w-[150px]">{project.address}</span>
              <span className="text-blue-400 font-bold">Details →</span>
            </div>
          </CardFooter>
      </Card>
    </motion.div>
  );
}
