import * as React from "react"
import { cn } from "@/lib/utils"

export interface FuzzyTextAnimationProps
  extends React.HTMLAttributes<HTMLDivElement> {
  text: string
  duration?: number
  characters?: string
  trigger?: boolean
}

const FuzzyTextAnimation = React.forwardRef<
  HTMLDivElement,
  FuzzyTextAnimationProps
>(({ className, text, duration = 2000, characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?", trigger = true, ...props }, ref) => {
  const [displayText, setDisplayText] = React.useState(text)
  const [isAnimating, setIsAnimating] = React.useState(false)
  const intervalRef = React.useRef<NodeJS.Timeout>()
  const timeoutRef = React.useRef<NodeJS.Timeout>()

  const startAnimation = React.useCallback(() => {
    if (isAnimating) return
    
    setIsAnimating(true)
    const textLength = text.length
    const animationSteps = Math.floor(duration / 50) // 50ms per step
    const revealDelay = Math.floor(animationSteps / textLength)
    
    let step = 0
    let revealedIndices: Set<number> = new Set()
    
    intervalRef.current = setInterval(() => {
      // Gradually reveal characters
      const revealIndex = Math.floor(step / revealDelay)
      if (revealIndex < textLength) {
        revealedIndices.add(revealIndex)
      }
      
      // Generate fuzzy text
      const fuzzyText = text
        .split('')
        .map((char, index) => {
          if (char === ' ') return ' '
          if (revealedIndices.has(index)) return char
          return characters[Math.floor(Math.random() * characters.length)]
        })
        .join('')
      
      setDisplayText(fuzzyText)
      step++
      
      // Complete animation
      if (step >= animationSteps) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
        }
        setDisplayText(text)
        
        // Add a slight delay before ending animation state
        timeoutRef.current = setTimeout(() => {
          setIsAnimating(false)
        }, 200)
      }
    }, 50)
  }, [text, duration, characters, isAnimating])

  React.useEffect(() => {
    if (trigger) {
      startAnimation()
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [trigger, startAnimation])

  React.useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return (
    <div
      ref={ref}
      className={cn(
        "font-mono transition-all duration-300",
        isAnimating && "animate-pulse",
        className
      )}
      onClick={startAnimation}
      style={{ cursor: trigger ? 'pointer' : 'default' }}
      {...props}
    >
      {displayText}
    </div>
  )
})
FuzzyTextAnimation.displayName = "FuzzyTextAnimation"

export { FuzzyTextAnimation }
