import React, { useEffect, useState, useRef } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import {
  getOptimalTextColor,
  getSecondaryTextColor,
  getMutedTextColor,
  createDynamicTextClasses,
  cn,
  componentStyles,
  spacing,
} from "@/utils/designSystem";
import { Header } from "./Header";
import { BottomNav } from "./ProfessionalBottomNav";

interface ProfessionalAppLayoutProps {
  children: React.ReactNode;
  currentView: string;
  onViewChange: (view: string) => void;
  isAdmin?: boolean;
  showHeader?: boolean;
  showBottomNav?: boolean;
  backgroundColor?: string;
}

export const ProfessionalAppLayout: React.FC<ProfessionalAppLayoutProps> = ({
  children,
  currentView,
  onViewChange,
  isAdmin = false,
  showHeader = true,
  showBottomNav = true,
  backgroundColor,
}) => {
  const { currentTheme } = useTheme();
  const [dynamicTextColors, setDynamicTextColors] = useState<any>(null);
  const layoutRef = useRef<HTMLDivElement>(null);

  // Determine background color and set dynamic text colors
  useEffect(() => {
    const updateTextColors = () => {
      let bgColor = backgroundColor;

      if (!bgColor && layoutRef.current) {
        const computedStyle = window.getComputedStyle(layoutRef.current);
        bgColor = computedStyle.backgroundColor;

        // If background is transparent or rgba, get the actual background
        if (bgColor === "rgba(0, 0, 0, 0)" || bgColor === "transparent") {
          // Traverse up to find actual background
          let parent = layoutRef.current.parentElement;
          while (parent && parent !== document.body) {
            const parentStyle = window.getComputedStyle(parent);
            const parentBg = parentStyle.backgroundColor;
            if (parentBg !== "rgba(0, 0, 0, 0)" && parentBg !== "transparent") {
              bgColor = parentBg;
              break;
            }
            parent = parent.parentElement;
          }

          // Default to white if no background found
          if (!bgColor || bgColor === "rgba(0, 0, 0, 0)") {
            bgColor = "#ffffff";
          }
        }
      }

      // Convert RGB to hex if needed
      if (bgColor && bgColor.startsWith("rgb")) {
        const rgb = bgColor.match(/\d+/g);
        if (rgb && rgb.length >= 3) {
          const r = parseInt(rgb[0]);
          const g = parseInt(rgb[1]);
          const b = parseInt(rgb[2]);
          bgColor =
            "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
        }
      }

      if (bgColor) {
        const textColors = createDynamicTextClasses(bgColor);
        setDynamicTextColors(textColors);
      }
    };

    // Initial update
    updateTextColors();

    // Update on resize or theme change
    const observer = new ResizeObserver(updateTextColors);
    if (layoutRef.current) {
      observer.observe(layoutRef.current);
    }

    return () => observer.disconnect();
  }, [backgroundColor, currentTheme]);

  return (
    <div
      ref={layoutRef}
      className={cn(
        "min-h-screen bg-gray-50",
        "flex flex-col",
        "font-sans antialiased",
      )}
      style={dynamicTextColors?.styles}
    >
      {/* Professional Header */}
      {showHeader && (
        <Header currentView={currentView} onViewChange={onViewChange} />
      )}

      {/* Main Content Area */}
      <main
        className={cn(
          "flex-1",
          "px-4 sm:px-6 lg:px-8",
          showBottomNav ? "pb-24" : "pb-8", // Space for bottom nav
          showHeader ? "pt-0" : "pt-8",
        )}
        style={{
          minHeight: showHeader ? "calc(100vh - 80px)" : "100vh",
        }}
      >
        {/* Content Container */}
        <div className={cn("max-w-7xl mx-auto", "py-6 sm:py-8")}>
          {children}
        </div>
      </main>

      {/* Professional Bottom Navigation */}
      {showBottomNav && (
        <BottomNav
          currentView={currentView}
          onViewChange={onViewChange}
          isAdmin={isAdmin}
        />
      )}

      {/* Global Style Injection for Dynamic Text Colors */}
      {dynamicTextColors && (
        <style>{`
          .dynamic-text-primary { color: ${dynamicTextColors.styles["--text-primary"]}; }
          .dynamic-text-secondary { color: ${dynamicTextColors.styles["--text-secondary"]}; }
          .dynamic-text-muted { color: ${dynamicTextColors.styles["--text-muted"]}; }
        `}</style>
      )}
    </div>
  );
};

// Enhanced MobileOptimized component with professional styling
export const ProfessionalMobileOptimized: React.FC<{
  children: React.ReactNode;
  className?: string;
  disableScroll?: boolean;
}> = ({ children, className, disableScroll = false }) => {
  return (
    <div
      className={cn(
        "relative w-full min-h-screen",
        "touch-manipulation",
        "select-none",
        disableScroll && "overflow-hidden",
        // Professional mobile optimizations
        "text-gray-900", // Default text color
        "bg-gray-50", // Professional background
        className,
      )}
      style={{
        WebkitTapHighlightColor: "transparent",
        WebkitTouchCallout: "none",
        WebkitUserSelect: "none",
        touchAction: "manipulation",
        // Professional font rendering
        WebkitFontSmoothing: "antialiased",
        MozOsxFontSmoothing: "grayscale",
        textRendering: "optimizeLegibility",
      }}
    >
      {children}
    </div>
  );
};

export default ProfessionalAppLayout;
