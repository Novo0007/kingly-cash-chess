// AdSense Components Export
export { default as AdSenseAd } from "./AdSenseAd";
export { default as AdSenseBanner } from "./AdSenseBanner";
export { default as AdSenseSidebar } from "./AdSenseSidebar";
export { default as AdSenseSectionBreak } from "./AdSenseSectionBreak";
export { default as AdSenseResponsive } from "./AdSenseResponsive";
export { ADSENSE_CONFIG, AD_PLACEMENT } from "./AdSenseConfig";

// Types
export interface AdSenseProps {
  adSlot: string;
  adFormat?: "auto" | "rectangle" | "vertical" | "horizontal";
  adStyle?: React.CSSProperties;
  className?: string;
  responsive?: boolean;
  width?: number;
  height?: number;
}
