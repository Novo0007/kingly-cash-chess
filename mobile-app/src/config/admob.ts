import { Platform } from "react-native";

export const ADMOB_CONFIG = {
  // App ID
  APP_ID: "ca-app-pub-7196290945919417~2175417759",

  // Ad Unit IDs (Replace with your actual ad unit IDs from AdMob dashboard)
  AD_UNITS: {
    BANNER: Platform.select({
      ios: "ca-app-pub-7196290945919417/1234567890", // Replace with actual iOS banner ad unit ID
      android: "ca-app-pub-7196290945919417/0987654321", // Replace with actual Android banner ad unit ID
    }),
    INTERSTITIAL: Platform.select({
      ios: "ca-app-pub-7196290945919417/1111111111", // Replace with actual iOS interstitial ad unit ID
      android: "ca-app-pub-7196290945919417/2222222222", // Replace with actual Android interstitial ad unit ID
    }),
    REWARDED: Platform.select({
      ios: "ca-app-pub-7196290945919417/3333333333", // Replace with actual iOS rewarded ad unit ID
      android: "ca-app-pub-7196290945919417/4444444444", // Replace with actual Android rewarded ad unit ID
    }),
  },

  // Test ad unit IDs for development
  TEST_AD_UNITS: {
    BANNER: Platform.select({
      ios: "ca-app-pub-3940256099942544/2934735716",
      android: "ca-app-pub-3940256099942544/6300978111",
    }),
    INTERSTITIAL: Platform.select({
      ios: "ca-app-pub-3940256099942544/4411468910",
      android: "ca-app-pub-3940256099942544/1033173712",
    }),
    REWARDED: Platform.select({
      ios: "ca-app-pub-3940256099942544/1712485313",
      android: "ca-app-pub-3940256099942544/5224354917",
    }),
  },

  // Development mode - set to false for production
  TEST_MODE: __DEV__,
};

// Get the appropriate ad unit ID based on test mode
export const getAdUnitId = (adType: keyof typeof ADMOB_CONFIG.AD_UNITS) => {
  return ADMOB_CONFIG.TEST_MODE
    ? ADMOB_CONFIG.TEST_AD_UNITS[adType]
    : ADMOB_CONFIG.AD_UNITS[adType];
};
