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
          "bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 text-white border border-purple-500/30 rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] hover:from-purple-500 hover:via-blue-500 hover:to-cyan-500",
        destructive:
          "bg-gradient-to-r from-red-500 to-pink-500 text-white border border-red-400/30 rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] hover:from-red-400 hover:to-pink-400",
        outline:
          "border-2 border-purple-300 bg-white/80 backdrop-blur-sm text-purple-700 rounded-xl hover:bg-purple-50 hover:border-purple-400 hover:scale-[1.02] active:scale-[0.98] shadow-sm hover:shadow-md",
        secondary:
          "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border border-gray-300 rounded-xl shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98] hover:from-gray-50 hover:to-gray-150",
        ghost:
          "text-purple-600 rounded-xl hover:bg-purple-50 hover:text-purple-700 active:bg-purple-100 hover:scale-[1.02] active:scale-[0.98]",
        link: "text-purple-600 underline-offset-4 hover:underline font-medium",
      },
      size: {
        default: "h-12 px-6 py-3 min-h-[48px] text-base rounded-xl",
        sm: "h-10 px-4 py-2 min-h-[40px] text-sm rounded-lg",
        lg: "h-14 px-8 py-4 min-h-[56px] text-lg rounded-xl",
        icon: "h-12 w-12 min-h-[48px] min-w-[48px] rounded-xl",
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
        {/* Shimmer effect for default variant */}
        {variant === "default" && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none" />
        )}
        {props.children}
      </Comp>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
