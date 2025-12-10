import { cn } from "@/lib/utils";

interface SkipLinkProps {
  targetId: string;
  children: React.ReactNode;
  className?: string;
}

export function SkipLink({ targetId, children, className }: SkipLinkProps) {
  return (
    <a
      href={`#${targetId}`}
      className={cn(
        "sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:top-4 focus:left-4",
        "focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:rounded-md",
        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        "transition-all",
        className
      )}
    >
      {children}
    </a>
  );
}
