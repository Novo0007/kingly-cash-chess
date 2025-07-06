import React, { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { setTestDeviceIDAsync } from "expo-ads-admob";
import { ADMOB_CONFIG } from "./src/config/admob";

// Screens
import HomeScreen from "./src/screens/HomeScreen";
import GameSelectionScreen from "./src/screens/GameSelectionScreen";
import ChessGameScreen from "./src/screens/ChessGameScreen";
import LudoGameScreen from "./src/screens/LudoGameScreen";

const Stack = createStackNavigator();

export default function App() {
  useEffect(() => {
    const initializeAds = async () => {
      if (ADMOB_CONFIG.TEST_MODE) {
        // Add test device ID for development
        await setTestDeviceIDAsync("EMULATOR");
      }
    };

    initializeAds();
  }, []);

  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: "#171717",
          },
          headerTintColor: "#fff",
          headerTitleStyle: {
            fontWeight: "bold",
          },
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: "Game Hub" }}
        />
        <Stack.Screen
          name="GameSelection"
          component={GameSelectionScreen}
          options={{ title: "Select Game" }}
        />
        <Stack.Screen
          name="ChessGame"
          component={ChessGameScreen}
          options={{ title: "Chess" }}
        />
        <Stack.Screen
          name="LudoGame"
          component={LudoGameScreen}
          options={{ title: "Ludo" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
