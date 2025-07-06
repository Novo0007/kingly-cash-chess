import { useEffect, useState } from "react";
import { AdMobInterstitial } from "expo-ads-admob";
import { getAdUnitId } from "../config/admob";

export const useInterstitialAd = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const adUnitId = getAdUnitId("INTERSTITIAL");

  useEffect(() => {
    if (!adUnitId) return;

    const setupInterstitial = () => {
      AdMobInterstitial.setAdUnitID(adUnitId);

      AdMobInterstitial.addEventListener("interstitialDidLoad", () => {
        console.log("Interstitial ad loaded");
        setIsLoaded(true);
        setIsLoading(false);
      });

      AdMobInterstitial.addEventListener(
        "interstitialDidFailToLoad",
        (error) => {
          console.log("Interstitial ad failed to load:", error);
          setIsLoaded(false);
          setIsLoading(false);
        },
      );

      AdMobInterstitial.addEventListener("interstitialDidOpen", () => {
        console.log("Interstitial ad opened");
      });

      AdMobInterstitial.addEventListener("interstitialDidClose", () => {
        console.log("Interstitial ad closed");
        setIsLoaded(false);
        // Preload next ad
        loadAd();
      });
    };

    setupInterstitial();

    return () => {
      AdMobInterstitial.removeAllListeners();
    };
  }, [adUnitId]);

  const loadAd = async () => {
    if (!adUnitId || isLoading) return;

    try {
      setIsLoading(true);
      await AdMobInterstitial.requestAdAsync({
        servePersonalizedAds: true,
      });
    } catch (error) {
      console.log("Error loading interstitial ad:", error);
      setIsLoading(false);
    }
  };

  const showAd = async () => {
    if (!isLoaded) {
      console.log("Interstitial ad not loaded yet");
      return false;
    }

    try {
      await AdMobInterstitial.showAdAsync();
      return true;
    } catch (error) {
      console.log("Error showing interstitial ad:", error);
      return false;
    }
  };

  return {
    isLoaded,
    isLoading,
    loadAd,
    showAd,
  };
};
