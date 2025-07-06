import React, { useEffect, useRef } from "react";
import { ADSENSE_CONFIG } from "./AdSenseConfig";

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

interface AdSenseAdProps {
  adSlot: string;
  adFormat?: "auto" | "rectangle" | "vertical" | "horizontal";
  adStyle?: React.CSSProperties;
  className?: string;
  responsive?: boolean;
  width?: number;
  height?: number;
}

export const AdSenseAd: React.FC<AdSenseAdProps> = ({
  adSlot,
  adFormat = "auto",
  adStyle = {},
  className = "",
  responsive = true,
  width,
  height,
}) => {
  const adRef = useRef<HTMLDivElement>(null);
  const isInitialized = useRef(false);

  useEffect(() => {
    // Don't initialize the same ad twice
    if (isInitialized.current) return;

    const initializeAd = () => {
      try {
        // Ensure adsbygoogle is available
        if (typeof window !== "undefined" && window.adsbygoogle) {
          // Push the ad to the queue
          window.adsbygoogle.push({});
          isInitialized.current = true;
          console.log("AdSense ad initialized for slot:", adSlot);
        } else {
          console.warn("AdSense script not loaded yet, retrying...");
          // Retry after a short delay
          setTimeout(initializeAd, 1000);
        }
      } catch (error) {
        console.error("Error initializing AdSense ad:", error);
      }
    };

    // Add a small delay to ensure the component is mounted
    const timer = setTimeout(initializeAd, 100);

    return () => {
      clearTimeout(timer);
    };
  }, [adSlot]);

  // Don't render in test mode if specified
  if (ADSENSE_CONFIG.TEST_MODE) {
    return (
      <div
        className={`bg-gray-200 border-2 border-dashed border-gray-400 flex items-center justify-center text-gray-600 text-sm ${className}`}
        style={{
          width: width || "100%",
          height: height || 250,
          minHeight: 90,
          ...adStyle,
        }}
      >
        [AdSense Ad Placeholder - Slot: {adSlot}]
      </div>
    );
  }

  const adProps: any = {
    "data-ad-client": ADSENSE_CONFIG.PUBLISHER_ID,
    "data-ad-slot": adSlot,
    "data-ad-format": adFormat,
  };

  // Add responsive attribute if specified
  if (responsive) {
    adProps["data-full-width-responsive"] = "true";
  }

  // Add fixed dimensions if specified
  if (width && height) {
    adStyle = {
      width: `${width}px`,
      height: `${height}px`,
      ...adStyle,
    };
  }

  return (
    <div ref={adRef} className={`adsbygoogle ${className}`} style={adStyle}>
      <ins
        className="adsbygoogle"
        style={{ display: "block", ...adStyle }}
        {...adProps}
      />
    </div>
  );
};

export default AdSenseAd;
