import { AppShell } from "@/components/app-shell";
import { HydrationGate } from "@/components/hydration-gate";

export default function AppGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppShell>
      <HydrationGate>{children}</HydrationGate>
    </AppShell>
  );
}
