import * as React from "react"
import { cn } from "@/lib/utils"

export interface TestComponentProps
  extends React.HTMLAttributes<HTMLDivElement> {}

const TestComponent = React.forwardRef<
  HTMLDivElement,
  TestComponentProps
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("", className)}
    {...props}
  />
))
TestComponent.displayName = "TestComponent"

export { TestComponent }
