import * as React from "react"
import { cn } from "@/lib/utils"

export interface Test-componentProps
  extends React.HTMLAttributes<HTMLDivElement> {}

const Test-component = React.forwardRef<
  HTMLDivElement,
  Test-componentProps
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("", className)}
    {...props}
  />
))
Test-component.displayName = "Test-component"

export { Test-component }
