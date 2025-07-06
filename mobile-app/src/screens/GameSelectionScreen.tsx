import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { AppAdMobBanner } from "../components/ads/AdMobBanner";

interface Props {
  navigation: any;
}

const GameSelectionScreen: React.FC<Props> = ({ navigation }) => {
  const games = [
    {
      id: "chess",
      title: "Chess",
      emoji: "♟️",
      description: "Classic strategy game",
      color: ["#8B4513", "#A0522D"],
      screen: "ChessGame",
    },
    {
      id: "ludo",
      title: "Ludo",
      emoji: "🎲",
      description: "Fun board game for everyone",
      color: ["#FF6B6B", "#FF8E8E"],
      screen: "LudoGame",
    },
  ];

  const handleGameSelect = (game: any) => {
    navigation.navigate(game.screen, { gameType: game.id });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Top Banner Ad */}
        <AppAdMobBanner bannerSize="banner" style={styles.topBanner} />

        <Text style={styles.title}>Choose Your Game</Text>
        <Text style={styles.subtitle}>Select a game to start playing</Text>

        <View style={styles.gamesContainer}>
          {games.map((game) => (
            <TouchableOpacity
              key={game.id}
              style={styles.gameCard}
              onPress={() => handleGameSelect(game)}
            >
              <LinearGradient
                colors={game.color}
                style={styles.gameCardGradient}
              >
                <Text style={styles.gameEmoji}>{game.emoji}</Text>
                <Text style={styles.gameTitle}>{game.title}</Text>
                <Text style={styles.gameDescription}>{game.description}</Text>
                <View style={styles.playButton}>
                  <Text style={styles.playButtonText}>Play Now</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>

        {/* Middle Banner Ad */}
        <AppAdMobBanner
          bannerSize="mediumRectangle"
          style={styles.middleBanner}
        />

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>🏆 Features</Text>
          <Text style={styles.infoText}>
            • Real-time multiplayer gaming{"\n"}• Secure and fair gameplay{"\n"}
            • Cross-platform compatibility{"\n"}• Achievement system{"\n"}•
            Leaderboards and rankings
          </Text>
        </View>

        {/* Bottom Banner Ad */}
        <AppAdMobBanner bannerSize="banner" style={styles.bottomBanner} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  content: {
    padding: 20,
  },
  topBanner: {
    marginBottom: 20,
  },
  middleBanner: {
    marginVertical: 20,
  },
  bottomBanner: {
    marginTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    color: "#171717",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    color: "#737373",
    marginBottom: 30,
  },
  gamesContainer: {
    gap: 16,
  },
  gameCard: {
    borderRadius: 16,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  gameCardGradient: {
    padding: 24,
    alignItems: "center",
  },
  gameEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  gameTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 8,
  },
  gameDescription: {
    fontSize: 16,
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 16,
    opacity: 0.9,
  },
  playButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  playButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  infoCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    marginVertical: 16,
    borderWidth: 1,
    borderColor: "#e5e5e5",
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#171717",
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
    color: "#737373",
  },
});

export default GameSelectionScreen;
