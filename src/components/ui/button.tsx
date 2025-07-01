import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { useSound } from "@/hooks/use-sound";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 touch-manipulation select-none",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90 rounded-2xl",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-2xl",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-2xl",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-2xl",
        ghost: "hover:bg-accent hover:text-accent-foreground rounded-2xl",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-12 px-6 py-3 min-h-[48px]",
        sm: "h-9 px-3 text-xs min-h-[36px]",
        lg: "h-14 px-8 text-base min-h-[56px]",
        icon: "h-10 w-10 min-h-[40px] min-w-[40px] rounded-full",
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
  (
    {
      className,
      variant,
      size,
      asChild = false,
      onClick,
      onMouseEnter,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";
    const { playClickSound, playHoverSound } = useSound();

    const handleClick = React.useCallback(
      (e: React.MouseEvent<HTMLButtonElement>) => {
        playClickSound();
        onClick?.(e);
      },
      [onClick, playClickSound],
    );

    const handleMouseEnter = React.useCallback(
      (e: React.MouseEvent<HTMLButtonElement>) => {
        playHoverSound();
        onMouseEnter?.(e);
      },
      [onMouseEnter, playHoverSound],
    );

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
