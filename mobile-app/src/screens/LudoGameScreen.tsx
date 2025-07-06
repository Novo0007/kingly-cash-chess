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

const LudoGameScreen: React.FC<Props> = ({ navigation, route }) => {
  const [gameStatus, setGameStatus] = useState("waiting");
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [diceValue, setDiceValue] = useState(1);
  const { loadAd, showAd, isLoaded } = useInterstitialAd();

  useEffect(() => {
    // Load interstitial ad for game over
    loadAd();
  }, []);

  const handleGameEnd = async () => {
    if (isLoaded) {
      await showAd();
    }

    Alert.alert("Game Over!", `Player ${currentPlayer} wins! 🎉`, [
      { text: "Play Again", onPress: () => resetGame() },
      { text: "Back to Menu", onPress: () => navigation.goBack() },
    ]);
  };

  const resetGame = () => {
    setGameStatus("waiting");
    setCurrentPlayer(1);
    setDiceValue(1);
  };

  const startGame = () => {
    setGameStatus("playing");
  };

  const rollDice = () => {
    const newValue = Math.floor(Math.random() * 6) + 1;
    setDiceValue(newValue);

    // Simple turn switching logic
    if (newValue !== 6) {
      setCurrentPlayer(currentPlayer === 4 ? 1 : currentPlayer + 1);
    }
  };

  const playerColors = ["🔴", "🟢", "🟡", "🔵"];

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Banner Ad */}
      <AppAdMobBanner bannerSize="banner" style={styles.topBanner} />

      <View style={styles.content}>
        <Text style={styles.title}>🎲 Ludo Game</Text>

        <View style={styles.gameBoard}>
          <Text style={styles.boardPlaceholder}>
            🎯 Ludo Board{"\n"}
            {gameStatus === "waiting"
              ? "Ready to start!"
              : `Player ${currentPlayer}'s turn`}
          </Text>

          {gameStatus === "playing" && (
            <View style={styles.diceContainer}>
              <Text style={styles.diceLabel}>Last Roll:</Text>
              <Text style={styles.diceValue}>{diceValue}</Text>
            </View>
          )}
        </View>

        <View style={styles.playersContainer}>
          <Text style={styles.playersTitle}>Players:</Text>
          <View style={styles.playersList}>
            {playerColors.map((color, index) => (
              <View
                key={index}
                style={[
                  styles.playerCard,
                  currentPlayer === index + 1 && styles.activePlayer,
                ]}
              >
                <Text style={styles.playerEmoji}>{color}</Text>
                <Text style={styles.playerText}>P{index + 1}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.controls}>
          {gameStatus === "waiting" ? (
            <TouchableOpacity style={styles.button} onPress={startGame}>
              <Text style={styles.buttonText}>Start Game</Text>
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity style={styles.button} onPress={rollDice}>
                <Text style={styles.buttonText}>🎲 Roll Dice</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.secondaryButton]}
                onPress={handleGameEnd}
              >
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
            • 2-4 players support{"\n"}• Classic Ludo rules{"\n"}• Safe zones
            and home{"\n"}• Token capturing{"\n"}• Automatic turn management
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
    color: "#FF6B6B",
    marginBottom: 20,
  },
  gameBoard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 30,
    margin: 20,
    minHeight: 180,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FF6B6B",
  },
  boardPlaceholder: {
    fontSize: 18,
    textAlign: "center",
    color: "#FF6B6B",
    fontWeight: "600",
  },
  diceContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  diceLabel: {
    fontSize: 14,
    color: "#737373",
  },
  diceValue: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FF6B6B",
  },
  playersContainer: {
    marginBottom: 20,
  },
  playersTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#171717",
    marginBottom: 10,
  },
  playersList: {
    flexDirection: "row",
    gap: 8,
  },
  playerCard: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e5e5",
  },
  activePlayer: {
    borderColor: "#FF6B6B",
    borderWidth: 2,
    backgroundColor: "#FFF5F5",
  },
  playerEmoji: {
    fontSize: 20,
    marginBottom: 4,
  },
  playerText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#171717",
  },
  controls: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  button: {
    flex: 1,
    backgroundColor: "#FF6B6B",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  secondaryButton: {
    backgroundColor: "#FF8E8E",
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

export default LudoGameScreen;
