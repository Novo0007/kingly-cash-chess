import React from "react";
import AdSenseAd from "./AdSenseAd";
import { ADSENSE_CONFIG, AD_PLACEMENT } from "./AdSenseConfig";
import { useIsMobile } from "@/hooks/use-mobile";

interface AdSenseBannerProps {
  position?: "top" | "bottom" | "middle";
  className?: string;
}

export const AdSenseBanner: React.FC<AdSenseBannerProps> = ({
  position = "top",
  className = "",
}) => {
  const isMobile = useMobile();

  if (!AD_PLACEMENT.SHOW_BANNER) {
    return null;
  }

  const adSlot = isMobile
    ? ADSENSE_CONFIG.AD_SLOTS.MOBILE_BANNER
    : ADSENSE_CONFIG.AD_SLOTS.BANNER_TOP;

  const containerClass = `
    w-full flex justify-center items-center my-4
    ${position === "top" ? "mb-6" : ""}
    ${position === "bottom" ? "mt-6" : ""}
    ${className}
  `;

  const adStyle = isMobile
    ? {
        width: "100%",
        maxWidth: "320px",
        height: "50px",
      }
    : {
        width: "100%",
        maxWidth: "728px",
        height: "90px",
      };

  return (
    <div className={containerClass}>
      <div className="w-full max-w-4xl">
        <AdSenseAd
          adSlot={adSlot}
          adFormat="horizontal"
          adStyle={adStyle}
          className="mx-auto"
          responsive={true}
        />
        {/* Label for transparency */}
        <div className="text-center mt-1">
          <span className="text-xs text-gray-500 opacity-75">
            Advertisement
          </span>
        </div>
      </div>
    </div>
  );
};

export default AdSenseBanner;
