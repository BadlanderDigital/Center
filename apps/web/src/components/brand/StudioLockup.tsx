import { cn } from "@openreel/ui";
import { wordmarkDark, wordmarkLight } from "./wordmarks";

/** ShoRebel wordmark plus the Studio tool name. Matches the signed-in page chrome. */
export function StudioLockup({
  className,
  markClassName,
  size = "md",
}: {
  className?: string;
  markClassName?: string;
  size?: "md" | "lg";
}) {
  const height = size === "lg" ? "h-9" : "h-[18px]";
  return (
    <span className={cn("studio-lockup", className)}>
      <img
        src={wordmarkLight}
        alt="ShoRebel"
        className={cn("studio-wordmark studio-wordmark-on-light", height, markClassName)}
      />
      <img
        src={wordmarkDark}
        alt=""
        aria-hidden
        className={cn("studio-wordmark studio-wordmark-on-dark", height, markClassName)}
      />
      <span className="studio-lockup-label">Studio</span>
    </span>
  );
}
