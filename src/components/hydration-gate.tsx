"use client";

import { Loader2 } from "lucide-react";
import { useStore } from "@/lib/store";

/**
 * Renders children only after the persisted store has hydrated from
 * localStorage, avoiding SSR/client markup mismatches.
 */
export function HydrationGate({ children }: { children: React.ReactNode }) {
  const hasHydrated = useStore((s) => s.hasHydrated);

  if (!hasHydrated) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-muted-foreground">
        <Loader2 className="size-6 animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
