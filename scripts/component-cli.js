#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

    // Convert kebab-case to PascalCase
    const pascalName = componentName
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');

    const componentDir = path.join(process.cwd(), 'src/components/ui');
    const componentFile = path.join(componentDir, `${componentName}.tsx`);

    if (fs.existsSync(componentFile)) {
      console.error(`Component ${componentName} already exists!`);
      return;
    }

    const template = `import * as React from "react"
import { cn } from "@/lib/utils"

export interface ${pascalName}Props
  extends React.HTMLAttributes<HTMLDivElement> {}

const ${pascalName} = React.forwardRef<
  HTMLDivElement,
  ${pascalName}Props
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("", className)}
    {...props}
  />
))
${pascalName}.displayName = "${pascalName}"

export { ${pascalName} }
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
