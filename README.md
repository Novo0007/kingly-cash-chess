# Welcome to your Lovable project

## 🎨 Theme System

This project includes a comprehensive theme system with multiple beautiful themes:

### Available Themes:

- **Default**:  Clean and minimal design
- **PixelNova** 🌟: Retro pixel-inspired with vibrant neon colors
- **MindMaze UI** 🧠: Professional dark theme with blue accents for focus
- **GlowyFun** ✨: Bright and playful theme with glowing elements
- **DreamPixels** 🌙: Soft pastel theme with dreamy gradient colors
- **Hacker Matrix** 🔰: Dark terminal-inspired theme with green matrix effects
- **Glitch Cyber** ⚡: Futuristic cyberpunk theme with neon glitch effects

### Features:

- ✅ Real-time theme switching
- ✅ Automatic localStorage persistence
- ✅ Mobile-friendly theme selector
- ✅ CSS custom properties for dynamic styling
- ✅ Applied across all game lobbies and components
- ✅ Theme-specific animations and effects
- ✅ **Beautiful themed loading screen** with smooth animations
- ✅ **Mobile-optimized** loading experience
- ✅ **Floating particles** and dynamic backgrounds
- ✅ **Special effects** for Hacker Matrix and Glitch Cyber themes
- ✅ **Matrix rain** and **glitch animations** for immersive experience

### How to Use:

1. Go to Profile → Settings → 🎨 Theme
2. Browse available themes with live previews
3. Click any theme to instantly apply it
4. Your preference is automatically saved

### 🌟 Loading Screen:

The app features a stunning theme-aware loading screen with:

- **Dynamic backgrounds** that match the selected theme
- **Floating particle animations** for visual appeal
- **Smooth progress animations** with shimmer effects
- **Responsive design** optimized for mobile devices
- **Theme-specific colors** and gradients throughout
- **Staggered entrance animations** for smooth loading
- **Matrix rain effect** for Hacker Matrix theme
- **Glitch particles** for Glitch Cyber theme
- **Interactive hover effects** with theme-specific animations

### For Developers:

- Themes are defined in `src/types/themes.ts`
- Context provider in `src/contexts/ThemeContext.tsx`
- Theme selector component in `src/components/profile/ThemeSelector.tsx`
- Loading screen component in `src/App.tsx` (LoadingScreen component)
- CSS variables automatically updated on theme change
- Use `useTheme()` hook to access current theme in components

## Project info

**URL**: https://lovable.dev/projects/9412019b-409b-4e66-8b4c-8a670b35046d

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/9412019b-409b-4e66-8b4c-8a670b35046d) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/9412019b-409b-4e66-8b4c-8a670b35046d) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
