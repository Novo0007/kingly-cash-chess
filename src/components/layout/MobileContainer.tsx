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
    sm: "p-2 md:p-3",
    md: "p-3 md:p-4",
    lg: "p-4 md:p-6",
  };

  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    full: "max-w-full",
  };

  return (
    <div
      className={cn(
        "mx-auto w-full",
        paddingClasses[padding],
        maxWidthClasses[maxWidth],
        className,
      )}
    >
      {children}
    </div>
  );
};
