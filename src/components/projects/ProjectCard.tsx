import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatCoordinate } from "@/lib/format";
import type { Project } from "@/projects/types";

export function ProjectCard({ project }: { project: Project }) {
  return (
    <Link href={`/projects/${project.id}`}>
      <Card className="hover:border-brand-accent/40 transition-colors">
        <CardHeader>
          <CardTitle>{project.name}</CardTitle>
          <CardDescription className="font-mono text-xs">
            {formatCoordinate(project.map.center)}
          </CardDescription>
        </CardHeader>
      </Card>
    </Link>
  );
}
