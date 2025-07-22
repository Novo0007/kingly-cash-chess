#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const commands = {
  list: () => {
    console.log('Available component management commands:');
    console.log('  npm run comp:create <name> - Create a new component');
    console.log('  npm run comp:list - List all components');
    console.log('  npm run comp:template - Show component template');
    console.log('');
    console.log('Your current UI components:');
    
    const uiPath = path.join(process.cwd(), 'src/components/ui');
    if (fs.existsSync(uiPath)) {
      const files = fs.readdirSync(uiPath).filter(file => file.endsWith('.tsx'));
      files.forEach(file => {
        console.log(`  - ${file.replace('.tsx', '')}`);
      });
    }
  },
  
  create: (componentName) => {
    if (!componentName) {
      console.error('Please provide a component name: npm run comp:create <name>');
      return;
    }
    
    const componentDir = path.join(process.cwd(), 'src/components/ui');
    const componentFile = path.join(componentDir, `${componentName}.tsx`);
    
    if (fs.existsSync(componentFile)) {
      console.error(`Component ${componentName} already exists!`);
      return;
    }
    
    const template = `import * as React from "react"
import { cn } from "@/lib/utils"

export interface ${componentName.charAt(0).toUpperCase() + componentName.slice(1)}Props
  extends React.HTMLAttributes<HTMLDivElement> {}

const ${componentName.charAt(0).toUpperCase() + componentName.slice(1)} = React.forwardRef<
  HTMLDivElement,
  ${componentName.charAt(0).toUpperCase() + componentName.slice(1)}Props
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("", className)}
    {...props}
  />
))
${componentName.charAt(0).toUpperCase() + componentName.slice(1)}.displayName = "${componentName.charAt(0).toUpperCase() + componentName.slice(1)}"

export { ${componentName.charAt(0).toUpperCase() + componentName.slice(1)} }
`;

    fs.writeFileSync(componentFile, template);
    console.log(`Component ${componentName} created successfully at ${componentFile}`);
  },
  
  template: () => {
    console.log(`
Component Template Structure:
----------------------------
import * as React from "react"
import { cn } from "@/lib/utils"

export interface ComponentProps extends React.HTMLAttributes<HTMLDivElement> {}

const Component = React.forwardRef<HTMLDivElement, ComponentProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("", className)} {...props} />
  )
)
Component.displayName = "Component"

export { Component }
`);
  }
};

const [,, command, ...args] = process.argv;

if (commands[command]) {
  commands[command](...args);
} else {
  commands.list();
}
