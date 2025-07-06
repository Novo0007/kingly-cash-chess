import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { AppAdMobBanner } from "../components/ads/AdMobBanner";
import { useInterstitialAd } from "../hooks/useInterstitialAd";

interface Props {
  navigation: any;
}

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const { loadAd, showAd, isLoaded } = useInterstitialAd();

  useEffect(() => {
    // Load interstitial ad when component mounts
    loadAd();
  }, []);

  const handleGameSelection = async () => {
    // Show interstitial ad before navigating
    if (isLoaded) {
      await showAd();
    }
    navigation.navigate("GameSelection");
  };

  const features = [
    { icon: "🔒", title: "Secure", description: "Safe & protected" },
    { icon: "👥", title: "Multiplayer", description: "Play together" },
    { icon: "⚡", title: "Fast", description: "Lightning quick" },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={["#ffffff", "#f5f5f5", "#ffffff"]}
        style={styles.gradient}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header Banner Ad */}
          <AppAdMobBanner bannerSize="banner" style={styles.topBanner} />

          <View style={styles.content}>
            {/* Logo Section */}
            <View style={styles.logoContainer}>
              <LinearGradient
                colors={["#171717", "rgba(23, 23, 23, 0.8)"]}
                style={styles.logoCircle}
              >
                <Ionicons name="game-controller" size={40} color="#fafafa" />
              </LinearGradient>
            </View>

            {/* Title Section */}
            <View style={styles.titleContainer}>
              <Text style={styles.title}>GAME HUB</Text>
              <Text style={styles.subtitle}>
                BY{" "}
                <Text style={styles.subtitleBold}>
                  NNC GAMES / HACKER TEAM LEGACY 😜
                </Text>
              </Text>
            </View>

            {/* Features Grid */}
            <View style={styles.featuresContainer}>
              {features.map((feature, index) => (
                <View key={index} style={styles.featureCard}>
                  <Text style={styles.featureIcon}>{feature.icon}</Text>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDescription}>
                    {feature.description}
                  </Text>
                </View>
              ))}
            </View>

            {/* Middle Banner Ad */}
            <AppAdMobBanner
              bannerSize="mediumRectangle"
              style={styles.middleBanner}
            />

            {/* Play Button */}
            <TouchableOpacity
              style={styles.playButton}
              onPress={handleGameSelection}
            >
              <LinearGradient
                colors={["#171717", "rgba(23, 23, 23, 0.8)"]}
                style={styles.playButtonGradient}
              >
                <Text style={styles.playButtonText}>🎮 START PLAYING</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Welcome Message */}
            <View style={styles.welcomeMessage}>
              <Text style={styles.welcomeText}>🎮 Welcome to Game Hub</Text>
            </View>
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            © 2024 NNC Games / Hacker See You 😘
          </Text>
        </View>

        {/* Bottom Banner Ad */}
        <AppAdMobBanner
          bannerSize="smartBannerPortrait"
          style={styles.bottomBanner}
        />
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  topBanner: {
    marginBottom: 20,
  },
  middleBanner: {
    marginVertical: 20,
  },
  bottomBanner: {
    marginTop: 10,
  },
  content: {
    flex: 1,
    alignItems: "center",
  },
  logoContainer: {
    marginBottom: 32,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  titleContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  title: {
    fontSize: 36,
    fontWeight: "700",
    lineHeight: 40,
    color: "#000",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 18,
    lineHeight: 28,
    color: "#737373",
    marginTop: 16,
    textAlign: "center",
  },
  subtitleBold: {
    fontWeight: "600",
  },
  featuresContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 32,
  },
  featureCard: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderColor: "#e5e5e5",
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
  },
  featureIcon: {
    fontSize: 24,
    lineHeight: 32,
    marginBottom: 8,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
    color: "#000",
  },
  featureDescription: {
    fontSize: 12,
    lineHeight: 16,
    color: "#737373",
    marginTop: 4,
    textAlign: "center",
  },
  playButton: {
    width: "100%",
    marginBottom: 20,
  },
  playButtonGradient: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  playButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "600",
  },
  welcomeMessage: {
    backgroundColor: "#ffffff",
    borderColor: "#e5e5e5",
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
  footer: {
    paddingVertical: 24,
    alignItems: "center",
  },
  footerText: {
    color: "#737373",
    fontSize: 12,
    lineHeight: 16,
    textAlign: "center",
  },
});

export default HomeScreen;
