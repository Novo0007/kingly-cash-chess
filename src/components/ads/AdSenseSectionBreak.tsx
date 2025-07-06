import React from "react";
import AdSenseAd from "./AdSenseAd";
import { ADSENSE_CONFIG, AD_PLACEMENT } from "./AdSenseConfig";
import { useIsMobile } from "@/hooks/use-mobile";

interface AdSenseSectionBreakProps {
  className?: string;
  title?: string;
}

export const AdSenseSectionBreak: React.FC<AdSenseSectionBreakProps> = ({
  className = "",
  title = "",
}) => {
  const isMobile = useIsMobile();

  if (!AD_PLACEMENT.SHOW_SECTION_BREAKS) {
    return null;
  }

  const containerClass = `
    w-full flex flex-col items-center my-8 py-6
    border-t border-b border-gray-200
    bg-gradient-to-r from-transparent via-gray-50 to-transparent
    ${className}
  `;

  return (
    <div className={containerClass}>
      {title && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-700 text-center">
            {title}
          </h3>
        </div>
      )}

      <div className="w-full max-w-4xl">
        <AdSenseAd
          adSlot={ADSENSE_CONFIG.AD_SLOTS.SECTION_BREAK}
          adFormat={isMobile ? "horizontal" : "rectangle"}
          adStyle={
            isMobile
              ? {
                  width: "100%",
                  maxWidth: "320px",
                  height: "250px",
                }
              : {
                  width: "100%",
                  maxWidth: "728px",
                  height: "300px",
                }
          }
          className="mx-auto"
          responsive={true}
        />

        <div className="text-center mt-3">
          <span className="text-xs text-gray-500 opacity-75">
            Advertisement
          </span>
        </div>
      </div>
    </div>
  );
};

export default AdSenseSectionBreak;
