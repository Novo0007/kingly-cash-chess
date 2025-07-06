import React from "react";
import AdSenseAd from "./AdSenseAd";
import { ADSENSE_CONFIG, AD_PLACEMENT } from "./AdSenseConfig";
import { useIsMobile } from "@/hooks/use-mobile";

interface AdSenseSidebarProps {
  className?: string;
  position?: "left" | "right";
}

export const AdSenseSidebar: React.FC<AdSenseSidebarProps> = ({
  className = "",
  position = "right",
}) => {
  const isMobile = useMobile();

  // Don't show sidebar ads on mobile or if disabled
  if (isMobile || !AD_PLACEMENT.SHOW_SIDEBAR) {
    return null;
  }

  const containerClass = `
    hidden lg:block sticky top-4 h-fit
    ${position === "left" ? "mr-4" : "ml-4"}
    ${className}
  `;

  return (
    <div className={containerClass}>
      <div className="w-40 space-y-6">
        {/* Large Sidebar Ad */}
        <div className="bg-gray-50 rounded-lg p-2 shadow-sm">
          <AdSenseAd
            adSlot={ADSENSE_CONFIG.AD_SLOTS.SIDEBAR}
            adFormat="vertical"
            adStyle={{
              width: "160px",
              height: "600px",
              display: "block",
            }}
            responsive={false}
            width={160}
            height={600}
          />
          <div className="text-center mt-2">
            <span className="text-xs text-gray-500">Advertisement</span>
          </div>
        </div>

        {/* Medium Rectangle Ad */}
        <div className="bg-gray-50 rounded-lg p-2 shadow-sm">
          <AdSenseAd
            adSlot={ADSENSE_CONFIG.AD_SLOTS.RESPONSIVE_DISPLAY}
            adFormat="rectangle"
            adStyle={{
              width: "150px",
              height: "150px",
              display: "block",
            }}
            responsive={true}
          />
          <div className="text-center mt-2">
            <span className="text-xs text-gray-500">Advertisement</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdSenseSidebar;
