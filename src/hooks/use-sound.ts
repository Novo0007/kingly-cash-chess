import { useCallback } from "react";

// Sound utility hook for button interactions
export const useSound = () => {
  const playSound = useCallback(
    (type: "click" | "hover" | "success" | "error" = "click") => {
      try {
        // Create audio context for better performance
        const audioContext = new (window.AudioContext ||
          (window as any).webkitAudioContext)();

        // Generate different tones for different interactions
        const frequencies = {
          click: 800,
          hover: 600,
          success: 1000,
          error: 400,
        };

        const frequency = frequencies[type];

        // Create oscillator for smooth sound
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        // Connect nodes
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        // Configure sound
        oscillator.frequency.setValueAtTime(
          frequency,
          audioContext.currentTime,
        );
        oscillator.type = "sine";

        // Create smooth envelope
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(
          0.1,
          audioContext.currentTime + 0.01,
        );
        gainNode.gain.exponentialRampToValueAtTime(
          0.001,
          audioContext.currentTime + 0.15,
        );

        // Play sound
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.15);
      } catch (error) {
        // Fallback: silent fail if audio context is not supported
        console.debug("Audio context not supported");
      }
    },
    [],
  );

  const playClickSound = useCallback(() => playSound("click"), [playSound]);
  const playHoverSound = useCallback(() => playSound("hover"), [playSound]);
  const playSuccessSound = useCallback(() => playSound("success"), [playSound]);
  const playErrorSound = useCallback(() => playSound("error"), [playSound]);

  return {
    playSound,
    playClickSound,
    playHoverSound,
    playSuccessSound,
    playErrorSound,
  };
};
