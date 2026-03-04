import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-1 whitespace-nowrap text-sm font-normal ring-offset-background transition-none focus-visible:outline-dotted focus-visible:outline-1 focus-visible:outline-offset-[-3px] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 win98-raised active:win98-pressed bg-[hsl(var(--win98-face))] text-foreground",
  {
    variants: {
      variant: {
        default: "",
        destructive: "",
        outline: "bg-[hsl(var(--win98-face))]",
        secondary: "",
        ghost: "border-none shadow-none bg-transparent hover:bg-accent/20 [all:unset] inline-flex items-center justify-center gap-1 whitespace-nowrap text-sm cursor-pointer px-2 py-1 hover:bg-[hsl(0_0%_83%)]",
        link: "border-none shadow-none bg-transparent text-primary underline-offset-4 hover:underline [all:unset] inline-flex items-center justify-center text-sm text-[hsl(var(--primary))] underline cursor-pointer",
        hero: "font-bold",
        success: "",
      },
      size: {
        default: "h-8 px-4 py-1",
        sm: "h-7 px-3 text-xs",
        lg: "h-9 px-6",
        xl: "h-10 px-8",
        icon: "h-8 w-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
