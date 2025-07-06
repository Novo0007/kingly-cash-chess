import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from "react-native";
import { AppAdMobBanner } from "../components/ads/AdMobBanner";
import { useInterstitialAd } from "../hooks/useInterstitialAd";

interface Props {
  navigation: any;
  route: any;
}

const ChessGameScreen: React.FC<Props> = ({ navigation, route }) => {
  const [gameStatus, setGameStatus] = useState("waiting");
  const [currentPlayer, setCurrentPlayer] = useState("white");
  const { loadAd, showAd, isLoaded } = useInterstitialAd();

  useEffect(() => {
    // Load interstitial ad for game over
    loadAd();
  }, []);

  const handleGameEnd = async () => {
    if (isLoaded) {
      await showAd();
    }

    Alert.alert("Game Over!", "Thanks for playing Chess!", [
      { text: "Play Again", onPress: () => resetGame() },
      { text: "Back to Menu", onPress: () => navigation.goBack() },
    ]);
  };

  const resetGame = () => {
    setGameStatus("waiting");
    setCurrentPlayer("white");
  };

  const startGame = () => {
    setGameStatus("playing");
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Banner Ad */}
      <AppAdMobBanner bannerSize="banner" style={styles.topBanner} />

      <View style={styles.content}>
        <Text style={styles.title}>♟️ Chess Game</Text>

        <View style={styles.gameBoard}>
          <Text style={styles.boardPlaceholder}>
            🏁 Chess Board{"\n"}
            {gameStatus === "waiting"
              ? "Ready to start!"
              : `Turn: ${currentPlayer}`}
          </Text>
        </View>

        <View style={styles.gameInfo}>
          <Text style={styles.infoText}>Status: {gameStatus}</Text>
          <Text style={styles.infoText}>Current Player: {currentPlayer}</Text>
        </View>

        <View style={styles.controls}>
          {gameStatus === "waiting" ? (
            <TouchableOpacity style={styles.button} onPress={startGame}>
              <Text style={styles.buttonText}>Start Game</Text>
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity
                style={[styles.button, styles.secondaryButton]}
                onPress={() =>
                  setCurrentPlayer(
                    currentPlayer === "white" ? "black" : "white",
                  )
                }
              >
                <Text style={styles.buttonText}>Switch Turn</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button} onPress={handleGameEnd}>
                <Text style={styles.buttonText}>End Game</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Middle Banner Ad */}
        <AppAdMobBanner
          bannerSize="mediumRectangle"
          style={styles.middleBanner}
        />

        <View style={styles.gameFeatures}>
          <Text style={styles.featuresTitle}>🎯 Game Features</Text>
          <Text style={styles.featuresText}>
            • Classic chess rules{"\n"}• Turn-based gameplay{"\n"}• Move
            validation{"\n"}• Check & checkmate detection{"\n"}• Game history
            tracking
          </Text>
        </View>
      </View>

      {/* Bottom Banner Ad */}
      <AppAdMobBanner
        bannerSize="smartBannerPortrait"
        style={styles.bottomBanner}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  topBanner: {
    marginTop: 10,
  },
  middleBanner: {
    marginVertical: 20,
  },
  bottomBanner: {
    marginBottom: 10,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    color: "#8B4513",
    marginBottom: 20,
  },
  gameBoard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 40,
    margin: 20,
    minHeight: 200,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#8B4513",
  },
  boardPlaceholder: {
    fontSize: 18,
    textAlign: "center",
    color: "#8B4513",
    fontWeight: "600",
  },
  gameInfo: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#e5e5e5",
  },
  infoText: {
    fontSize: 16,
    color: "#171717",
    marginBottom: 4,
  },
  controls: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  button: {
    flex: 1,
    backgroundColor: "#8B4513",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  secondaryButton: {
    backgroundColor: "#A0522D",
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  gameFeatures: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e5e5e5",
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#171717",
    marginBottom: 8,
  },
  featuresText: {
    fontSize: 14,
    color: "#737373",
    lineHeight: 20,
  },
});

export default ChessGameScreen;
