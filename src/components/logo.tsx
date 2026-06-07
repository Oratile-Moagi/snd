import Image from "next/image";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  size = 36,
  showWordmark = true,
  wordmarkClassName,
}: {
  className?: string;
  size?: number;
  showWordmark?: boolean;
  wordmarkClassName?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <Image
        src="/brand/logo.png"
        alt="Siluma N Dube Group"
        width={size}
        height={size}
        priority
        className="object-contain"
      />
      {showWordmark && (
        <div className="leading-tight">
          <div className={cn("font-semibold tracking-tight", wordmarkClassName)}>
            Siluma N Dube
          </div>
          <div className="text-[10px] uppercase tracking-[0.18em] opacity-70">
            Group
          </div>
        </div>
      )}
    </div>
  );
}
