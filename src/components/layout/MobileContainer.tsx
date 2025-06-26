import React from "react";
import { cn } from "@/lib/utils";

interface MobileContainerProps {
  children: React.ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
  maxWidth?: "sm" | "md" | "lg" | "xl" | "full";
}

export const MobileContainer: React.FC<MobileContainerProps> = ({
  children,
  className,
  padding = "md",
  maxWidth = "lg",
}) => {
  const paddingClasses = {
    none: "",
    sm: "p-1 sm:p-2 md:p-3",
    md: "p-2 sm:p-3 md:p-4",
    lg: "p-3 sm:p-4 md:p-6",
  };

  const maxWidthClasses = {
    sm: "max-w-full sm:max-w-sm",
    md: "max-w-full sm:max-w-md",
    lg: "max-w-full sm:max-w-lg",
    xl: "max-w-full sm:max-w-xl md:max-w-2xl lg:max-w-4xl",
    full: "max-w-full",
  };

  return (
    <div
      className={cn(
        "mx-100% w-full",
        paddingClasses[padding],
        maxWidthClasses[maxWidth],
        className,
      )}
    >
      {children}
    </div>
  );
};
