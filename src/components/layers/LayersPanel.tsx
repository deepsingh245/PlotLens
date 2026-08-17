"use client";

import { Check, Layers, PanelLeft, PanelLeftClose } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useMediaQuery } from "@/lib/useMediaQuery";

/**
 * Streets is the only real base map today — see docs/plans/plan-5.md. Satellite is
 * shown, not hidden, so the gap is visible rather than silently absent; it stays
 * disabled until a satellite provider is actually verified in docs/DATA_SOURCES.md.
 */
function BaseMapGroup() {
  return (
    <div className="flex flex-col gap-1 p-2">
      <span className="text-text-secondary px-1 text-xs font-medium tracking-wide uppercase">Base Map</span>
      <button
        type="button"
        aria-pressed={true}
        className="bg-surface-elevated text-text-primary flex items-center justify-between rounded-md px-2 py-1.5 text-sm"
      >
        Streets
        <Check className="text-brand-accent size-4" />
      </button>
      <Tooltip>
        <TooltipTrigger
          render={
            <button
              type="button"
              disabled
              className="text-text-secondary flex cursor-not-allowed items-center justify-between rounded-md px-2 py-1.5 text-sm opacity-50"
            />
          }
        >
          Satellite
        </TooltipTrigger>
        <TooltipContent side="right">
          Needs a verified satellite imagery provider — see docs/DATA_SOURCES.md
        </TooltipContent>
      </Tooltip>
    </div>
  );
}

/**
 * Left layers panel — 176px expanded / 34px collapsed, see
 * docs/design/DESIGN_SYSTEM.md §Validated layout dimensions. Mobile (<768px):
 * no permanently-docked stub (nothing to dock against a phone's edge usefully) —
 * a floating toggle opens a bottom Sheet instead. See docs/plans/plan-5.md.
 */
export function LayersPanel({
  collapsed,
  onCollapsedChange,
}: {
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
}) {
  const isMobile = useMediaQuery("(max-width: 767px)");

  if (isMobile) {
    return (
      <>
        <Button
          variant="secondary"
          size="icon-sm"
          aria-label={collapsed ? "Open layers panel" : "Close layers panel"}
          className="fixed z-10 shadow-lg"
          style={{ top: 44, left: 10 }}
          onClick={() => onCollapsedChange(!collapsed)}
        >
          <Layers className="size-4" />
        </Button>
        <Sheet open={!collapsed} onOpenChange={(open) => onCollapsedChange(!open)}>
          <SheetContent side="bottom">
            <SheetHeader>
              <SheetTitle>Layers</SheetTitle>
            </SheetHeader>
            <BaseMapGroup />
          </SheetContent>
        </Sheet>
      </>
    );
  }

  if (collapsed) {
    return (
      <div className="border-border bg-surface flex flex-col items-center border-r py-2" style={{ width: 34 }}>
        <Button variant="ghost" size="icon-sm" aria-label="Expand layers panel" onClick={() => onCollapsedChange(false)}>
          <PanelLeft className="size-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="border-border bg-surface flex flex-col border-r" style={{ width: 176 }}>
      <div className="border-border flex h-8 items-center justify-between border-b px-2">
        <span className="text-text-primary text-sm font-medium">Layers</span>
        <Button variant="ghost" size="icon-sm" aria-label="Collapse layers panel" onClick={() => onCollapsedChange(true)}>
          <PanelLeftClose className="size-4" />
        </Button>
      </div>
      <BaseMapGroup />
    </div>
  );
}
