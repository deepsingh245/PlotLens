import Link from "next/link";
import { MapPin, Clock } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { formatCoordinate, formatRelativeDate } from "@/lib/format";
import type { Project } from "@/projects/types";

export function ProjectCard({ project }: { project: Project }) {
  const updated = formatRelativeDate(project.updatedAt);

  return (
    <Link href={`/projects/${project.id}`} className="group/link block outline-none">
      <Card className="h-full transition-colors group-hover/link:border-brand-accent/50 group-hover/link:ring-brand-accent/30 group-focus-visible/link:ring-2 group-focus-visible/link:ring-brand-accent/60">
        <CardHeader>
          <CardTitle className="flex items-start gap-2">
            <MapPin className="text-brand-accent mt-0.5 size-4 shrink-0" />
            <span className="truncate">{project.name}</span>
          </CardTitle>
          {project.description && (
            <CardDescription className="line-clamp-2">{project.description}</CardDescription>
          )}
        </CardHeader>
        <CardContent className="text-text-secondary flex items-center justify-between gap-2 text-xs">
          <span className="font-mono">{formatCoordinate(project.map.center)}</span>
          {updated && (
            <span className="flex shrink-0 items-center gap-1">
              <Clock className="size-3" />
              {updated}
            </span>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
