import React from "react";
import AdSenseAd from "./AdSenseAd";
import { ADSENSE_CONFIG } from "./AdSenseConfig";
import { useIsMobile } from "@/hooks/use-mobile";

interface AdSenseResponsiveProps {
  className?: string;
  size?: "small" | "medium" | "large";
  showLabel?: boolean;
}

export const AdSenseResponsive: React.FC<AdSenseResponsiveProps> = ({
  className = "",
  size = "medium",
  showLabel = true,
}) => {
  const isMobile = useMobile();

  const getSizeConfig = () => {
    switch (size) {
      case "small":
        return isMobile
          ? { width: "300px", height: "250px" }
          : { width: "300px", height: "250px" };
      case "large":
        return isMobile
          ? { width: "320px", height: "480px" }
          : { width: "728px", height: "400px" };
      default: // medium
        return isMobile
          ? { width: "320px", height: "320px" }
          : { width: "500px", height: "350px" };
    }
  };

  const sizeConfig = getSizeConfig();

  const containerClass = `
    w-full flex flex-col items-center justify-center p-4
    ${className}
  `;

  return (
    <div className={containerClass}>
      <div
        className="bg-gray-50 rounded-lg p-3 shadow-sm border border-gray-200"
        style={{ width: "fit-content" }}
      >
        <AdSenseAd
          adSlot={ADSENSE_CONFIG.AD_SLOTS.RESPONSIVE_DISPLAY}
          adFormat="auto"
          adStyle={{
            width: sizeConfig.width,
            height: sizeConfig.height,
            display: "block",
          }}
          responsive={true}
        />

        {showLabel && (
          <div className="text-center mt-2">
            <span className="text-xs text-gray-500">Advertisement</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdSenseResponsive;
