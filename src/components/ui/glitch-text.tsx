import * as React from "react"
import { cn } from "@/lib/utils"

export interface GlitchTextProps
  extends React.HTMLAttributes<HTMLDivElement> {
  text: string
  intensity?: "low" | "medium" | "high"
  speed?: "slow" | "medium" | "fast"
  trigger?: boolean
  continuous?: boolean
}

const GlitchText = React.forwardRef<
  HTMLDivElement,
  GlitchTextProps
>(({ className, text, intensity = "medium", speed = "medium", trigger = true, continuous = false, ...props }, ref) => {
  const [isGlitching, setIsGlitching] = React.useState(continuous)
  const [displayText, setDisplayText] = React.useState(text)
  const intervalRef = React.useRef<NodeJS.Timeout>()
  const timeoutRef = React.useRef<NodeJS.Timeout>()

  const glitchChars = "!@#$%^&*()_+-=[]{}|;:,.<>?ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"

  const speedMs = {
    slow: 200,
    medium: 100,
    fast: 50
  }

  const intensityLevel = {
    low: 0.1,
    medium: 0.3,
    high: 0.5
  }

  const startGlitch = React.useCallback(() => {
    if (isGlitching && !continuous) return
    
    setIsGlitching(true)
    const glitchDuration = continuous ? Infinity : 1000
    const glitchChance = intensityLevel[intensity]
    let elapsed = 0

    intervalRef.current = setInterval(() => {
      const glitchedText = text
        .split('')
        .map(char => {
          if (char === ' ') return ' '
          if (Math.random() < glitchChance) {
            return glitchChars[Math.floor(Math.random() * glitchChars.length)]
          }
          return char
        })
        .join('')

      setDisplayText(glitchedText)
      elapsed += speedMs[speed]

      if (!continuous && elapsed >= glitchDuration) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
        }
        setDisplayText(text)
        
        timeoutRef.current = setTimeout(() => {
          setIsGlitching(false)
        }, 200)
      }
    }, speedMs[speed])
  }, [text, intensity, speed, isGlitching, continuous])

  const stopGlitch = React.useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    setDisplayText(text)
    setIsGlitching(false)
  }, [text])

  React.useEffect(() => {
    if (trigger && !continuous) {
      startGlitch()
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [trigger, startGlitch, continuous])

  React.useEffect(() => {
    if (continuous) {
      startGlitch()
    } else {
      stopGlitch()
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [continuous, startGlitch, stopGlitch])

  return (
    <div
      ref={ref}
      className={cn(
        "relative inline-block",
        "glitch-container",
        isGlitching && "animate-pulse",
        className
      )}
      onClick={!continuous ? startGlitch : undefined}
      style={{ cursor: trigger && !continuous ? 'pointer' : 'default' }}
      {...props}
    >
      {/* Main text */}
      <span 
        className={cn(
          "relative z-20",
          isGlitching && "text-shadow-glitch"
        )}
      >
        {displayText}
      </span>

      {/* Glitch layers */}
      {isGlitching && (
        <>
          <span 
            className="absolute inset-0 text-red-500 opacity-80 animate-glitch-1"
            style={{
              clipPath: "inset(0 0 95% 0)",
              transform: "translateX(-2px)"
            }}
          >
            {displayText}
          </span>
          <span 
            className="absolute inset-0 text-blue-500 opacity-80 animate-glitch-2"
            style={{
              clipPath: "inset(85% 0 0 0)",
              transform: "translateX(2px)"
            }}
          >
            {displayText}
          </span>
          <span 
            className="absolute inset-0 text-green-500 opacity-60 animate-glitch-3"
            style={{
              clipPath: "inset(40% 0 50% 0)",
              transform: "translateX(-1px)"
            }}
          >
            {displayText}
          </span>
        </>
      )}
    </div>
  )
})
GlitchText.displayName = "GlitchText"

export { GlitchText }
