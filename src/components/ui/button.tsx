import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { useSound } from "@/hooks/use-sound";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-semibold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 touch-manipulation select-none font-body relative overflow-hidden group",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-amber-700 via-orange-700 to-yellow-700 text-amber-50 border-2 border-amber-800 rounded-lg shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] hover:from-amber-600 hover:via-orange-600 hover:to-yellow-600 wood-button relative overflow-hidden",
        destructive:
          "bg-gradient-to-r from-red-700 to-red-800 text-red-50 border-2 border-red-900 rounded-lg shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] hover:from-red-600 hover:to-red-700",
        outline:
          "border-2 border-amber-700 bg-amber-50/90 backdrop-blur-sm text-amber-900 rounded-lg hover:bg-amber-100 hover:border-amber-800 hover:scale-[1.02] active:scale-[0.98] shadow-sm hover:shadow-md",
        secondary:
          "bg-gradient-to-r from-amber-200 to-orange-200 text-amber-900 border-2 border-amber-400 rounded-lg shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98] hover:from-amber-100 hover:to-orange-100",
        ghost:
          "text-amber-800 rounded-lg hover:bg-amber-100 hover:text-amber-900 active:bg-amber-200 hover:scale-[1.02] active:scale-[0.98]",
        link: "text-amber-800 underline-offset-4 hover:underline font-medium",
      },
      size: {
        default: "h-12 px-6 py-3 min-h-[48px] text-base rounded-lg",
        sm: "h-10 px-4 py-2 min-h-[40px] text-sm rounded-md",
        lg: "h-14 px-8 py-4 min-h-[56px] text-lg rounded-lg",
        icon: "h-12 w-12 min-h-[48px] min-w-[48px] rounded-lg",
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
      >
        {/* Wood shimmer effect for default variant */}
        {variant === "default" && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-200/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-500 pointer-events-none rounded-lg" />
        )}
        {props.children}
      </Comp>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
