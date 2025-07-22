import * as React from "react"
import { cn } from "@/lib/utils"

export interface BackgroundIridescenceProps
  extends React.HTMLAttributes<HTMLDivElement> {
  intensity?: "low" | "medium" | "high"
  speed?: "slow" | "medium" | "fast"
  colors?: string[]
}

const BackgroundIridescence = React.forwardRef<
  HTMLDivElement,
  BackgroundIridescenceProps
>(({ className, intensity = "medium", speed = "medium", colors = ["#ff0080", "#7928ca", "#0070f3", "#00dfd8"], children, ...props }, ref) => {
  const intensityOpacity = {
    low: "opacity-20",
    medium: "opacity-30", 
    high: "opacity-40"
  }

  const speedDuration = {
    slow: "animate-spin-slow",
    medium: "animate-spin",
    fast: "animate-spin-fast"
  }

  return (
    <div
      ref={ref}
      className={cn("relative overflow-hidden", className)}
      {...props}
    >
      {/* Iridescent background layers */}
      <div className="absolute inset-0">
        {/* Base gradient */}
        <div 
          className={cn(
            "absolute inset-0 bg-gradient-conic from-purple-500 via-blue-500 via-green-500 via-yellow-500 via-red-500 to-purple-500",
            intensityOpacity[intensity],
            "animate-spin-slow"
          )}
          style={{
            background: `conic-gradient(from 0deg, ${colors.join(", ")}, ${colors[0]})`
          }}
        />
        
        {/* Secondary layer for more complexity */}
        <div 
          className={cn(
            "absolute inset-0 bg-gradient-radial from-transparent via-purple-500/20 to-transparent",
            "animate-pulse"
          )}
        />
        
        {/* Tertiary moving layer */}
        <div 
          className={cn(
            "absolute inset-0 bg-gradient-linear",
            intensityOpacity[intensity],
            speedDuration[speed]
          )}
          style={{
            background: `linear-gradient(45deg, transparent, ${colors[0]}20, transparent, ${colors[1]}20, transparent)`
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
})
BackgroundIridescence.displayName = "BackgroundIridescence"

export { BackgroundIridescence }
