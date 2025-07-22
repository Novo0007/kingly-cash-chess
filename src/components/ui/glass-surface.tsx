import * as React from "react"
import { cn } from "@/lib/utils"

export interface GlassSurfaceProps
  extends React.HTMLAttributes<HTMLDivElement> {
  blur?: "sm" | "md" | "lg" | "xl"
  opacity?: number
  gradient?: boolean
  border?: boolean
}

const GlassSurface = React.forwardRef<
  HTMLDivElement,
  GlassSurfaceProps
>(({ className, blur = "md", opacity = 0.1, gradient = true, border = true, children, ...props }, ref) => {
  const blurClasses = {
    sm: "backdrop-blur-sm",
    md: "backdrop-blur-md", 
    lg: "backdrop-blur-lg",
    xl: "backdrop-blur-xl"
  }

  return (
    <div
      ref={ref}
      className={cn(
        "relative overflow-hidden",
        blurClasses[blur],
        border && "border border-white/20",
        "bg-white/10",
        gradient && "bg-gradient-to-br from-white/20 via-white/10 to-white/5",
        "shadow-lg shadow-black/10",
        "backdrop-saturate-150",
        className
      )}
      style={{
        background: gradient 
          ? `linear-gradient(135deg, rgba(255,255,255,${opacity * 2}) 0%, rgba(255,255,255,${opacity}) 50%, rgba(255,255,255,${opacity * 0.5}) 100%)`
          : `rgba(255,255,255,${opacity})`
      }}
      {...props}
    >
      {/* Glass reflection effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent opacity-50" />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
})
GlassSurface.displayName = "GlassSurface"

export { GlassSurface }
