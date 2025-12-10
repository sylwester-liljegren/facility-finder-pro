import { cn } from "@/lib/utils";
import React from "react";

interface VisuallyHiddenProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

export function VisuallyHidden({ 
  children, 
  className,
  as: Component = "span",
  ...props
}: VisuallyHiddenProps) {
  return React.createElement(
    Component,
    { className: cn("sr-only", className), ...props },
    children
  );
}
