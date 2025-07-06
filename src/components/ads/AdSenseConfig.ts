// AdSense Configuration
export const ADSENSE_CONFIG = {
  // Replace with your actual Google AdSense Publisher ID
  PUBLISHER_ID: "ca-pub-7196290945919417",

  // Ad Slot IDs - Replace these with your actual ad slot IDs from AdSense dashboard
  AD_SLOTS: {
    BANNER_TOP: "1234567890", // Header banner ad
    SIDEBAR: "2345678901", // Sidebar ad
    SECTION_BREAK: "3456789012", // Between game sections
    MOBILE_BANNER: "4567890123", // Mobile optimized banner
    RESPONSIVE_DISPLAY: "5678901234", // Responsive display ad
  },

  // Ad sizes and formats
  AD_FORMATS: {
    BANNER: {
      width: 728,
      height: 90,
    },
    MOBILE_BANNER: {
      width: 320,
      height: 50,
    },
    LARGE_RECTANGLE: {
      width: 336,
      height: 280,
    },
    MEDIUM_RECTANGLE: {
      width: 300,
      height: 250,
    },
    SIDEBAR: {
      width: 160,
      height: 600,
    },
  },

  // Test mode - set to true during development
  TEST_MODE: false,
};

// Ad placement settings
export const AD_PLACEMENT = {
  SHOW_BANNER: true,
  SHOW_SIDEBAR: true,
  SHOW_SECTION_BREAKS: true,
  MIN_CONTENT_HEIGHT: 400, // Minimum content height before showing ads
  DELAY_MS: 1000, // Delay before initializing ads
};

export default ADSENSE_CONFIG;
