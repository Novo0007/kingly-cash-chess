import React from "react";
import { View, StyleSheet } from "react-native";
import { AdMobBanner } from "expo-ads-admob";
import { getAdUnitId } from "../../config/admob";

interface Props {
  bannerSize?:
    | "banner"
    | "largeBanner"
    | "mediumRectangle"
    | "fullBanner"
    | "leaderboard"
    | "smartBannerPortrait"
    | "smartBannerLandscape";
  style?: any;
}

export const AppAdMobBanner: React.FC<Props> = ({
  bannerSize = "smartBannerPortrait",
  style,
}) => {
  const adUnitId = getAdUnitId("BANNER");

  if (!adUnitId) {
    return null;
  }

  return (
    <View style={[styles.container, style]}>
      <AdMobBanner
        bannerSize={bannerSize}
        adUnitID={adUnitId}
        servePersonalizedAds={true}
        onDidFailToReceiveAdWithError={(error) => {
          console.log("Banner ad failed to load:", error);
        }}
        onAdViewDidReceiveAd={() => {
          console.log("Banner ad loaded successfully");
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
});
