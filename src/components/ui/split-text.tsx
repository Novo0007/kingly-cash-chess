import * as React from "react"
import { cn } from "@/lib/utils"

export interface SplitTextProps
  extends React.HTMLAttributes<HTMLDivElement> {
  text: string
  animation?: "fade" | "slide" | "bounce" | "rotate" | "scale"
  stagger?: number
  trigger?: boolean
  duration?: number
  direction?: "up" | "down" | "left" | "right"
  splitBy?: "char" | "word" | "line"
}

const SplitText = React.forwardRef<
  HTMLDivElement,
  SplitTextProps
>(({ 
  className, 
  text, 
  animation = "fade", 
  stagger = 50, 
  trigger = true, 
  duration = 600,
  direction = "up",
  splitBy = "char",
  ...props 
}, ref) => {
  const [isAnimating, setIsAnimating] = React.useState(false)
  const [hasAnimated, setHasAnimated] = React.useState(false)

  const splitText = React.useMemo(() => {
    switch (splitBy) {
      case "word":
        return text.split(" ").map((word, i) => ({ content: word, index: i, isSpace: false }))
      case "line":
        return text.split("\n").map((line, i) => ({ content: line, index: i, isSpace: false }))
      default:
        return text.split("").map((char, i) => ({ 
          content: char, 
          index: i, 
          isSpace: char === " " 
        }))
    }
  }, [text, splitBy])

  const getAnimationClasses = (animation: string, direction: string) => {
    const baseClasses = "inline-block transition-all duration-300 ease-out"
    
    switch (animation) {
      case "slide":
        return {
          initial: cn(baseClasses, {
            "translate-y-8 opacity-0": direction === "up",
            "translate-y-[-32px] opacity-0": direction === "down",
            "translate-x-8 opacity-0": direction === "left",
            "translate-x-[-32px] opacity-0": direction === "right"
          }),
          animate: "translate-x-0 translate-y-0 opacity-100"
        }
      case "bounce":
        return {
          initial: cn(baseClasses, "scale-0 opacity-0"),
          animate: "scale-100 opacity-100 animate-bounce-once"
        }
      case "rotate":
        return {
          initial: cn(baseClasses, "rotate-180 opacity-0"),
          animate: "rotate-0 opacity-100"
        }
      case "scale":
        return {
          initial: cn(baseClasses, "scale-0 opacity-0"),
          animate: "scale-100 opacity-100"
        }
      default: // fade
        return {
          initial: cn(baseClasses, "opacity-0"),
          animate: "opacity-100"
        }
    }
  }

  const animationClasses = getAnimationClasses(animation, direction)

  React.useEffect(() => {
    if (trigger && !hasAnimated) {
      setIsAnimating(true)
      setHasAnimated(true)
      
      // Reset after animation completes
      const timeout = setTimeout(() => {
        setIsAnimating(false)
      }, duration + (splitText.length * stagger))

      return () => clearTimeout(timeout)
    }
  }, [trigger, hasAnimated, duration, stagger, splitText.length])

  const handleClick = () => {
    if (!trigger) {
      setIsAnimating(true)
      setHasAnimated(true)
      
      const timeout = setTimeout(() => {
        setIsAnimating(false)
      }, duration + (splitText.length * stagger))

      return () => clearTimeout(timeout)
    }
  }

  return (
    <div
      ref={ref}
      className={cn("inline-block", className)}
      onClick={handleClick}
      style={{ cursor: !trigger ? 'pointer' : 'default' }}
      {...props}
    >
      {splitText.map((item, index) => (
        <span
          key={index}
          className={cn(
            isAnimating || hasAnimated ? animationClasses.animate : animationClasses.initial,
            item.isSpace && splitBy === "char" ? "w-2" : ""
          )}
          style={{
            animationDelay: `${index * stagger}ms`,
            transitionDelay: isAnimating ? `${index * stagger}ms` : "0ms"
          }}
        >
          {item.content === " " && splitBy === "char" ? "\u00A0" : item.content}
          {splitBy === "word" && index < splitText.length - 1 && "\u00A0"}
        </span>
      ))}
    </div>
  )
})
SplitText.displayName = "SplitText"

export { SplitText }
