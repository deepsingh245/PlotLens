"use client";

import { Circle, MapPin, Pentagon, Spline, StickyNote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { DrawTool } from "@/gis/annotationGeometry";

export type ActiveTool = DrawTool | "text" | null;

const TOOLS: { tool: DrawTool | "text"; label: string; shortcut: string; icon: typeof MapPin }[] = [
  { tool: "point", label: "Pin", shortcut: "P", icon: MapPin },
  { tool: "line", label: "Line", shortcut: "L", icon: Spline },
  { tool: "polygon", label: "Polygon", shortcut: "G", icon: Pentagon },
  { tool: "circle", label: "Circle", shortcut: "C", icon: Circle },
  { tool: "text", label: "Note", shortcut: "N", icon: StickyNote },
];

/**
 * Right-side tool rail, exactly 34px wide — see docs/design/DESIGN_SYSTEM.md
 * §Validated layout dimensions. Dumb/presentational — driven by activeTool/
 * onSelectTool props, doesn't own DrawingManager itself (see ProjectWorkspace.tsx).
 */
export function ToolRail({
  activeTool,
  onSelectTool,
}: {
  activeTool: ActiveTool;
  onSelectTool: (tool: DrawTool | "text") => void;
}) {
  return (
    <div
      className="flex flex-col items-center gap-1 border-l border-border bg-surface py-2"
      style={{ width: 34 }}
    >
      {TOOLS.map(({ tool, label, shortcut, icon: Icon }) => (
        <Tooltip key={tool}>
          <TooltipTrigger
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={label}
                aria-pressed={activeTool === tool}
                data-active={activeTool === tool}
                className="data-[active=true]:text-brand-accent data-[active=true]:bg-surface-elevated"
                onClick={() => onSelectTool(tool)}
              />
            }
          >
            <Icon className="size-4" />
          </TooltipTrigger>
          <TooltipContent side="left">
            {label} ({shortcut})
          </TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
}
