import { useEffect, useRef, useState } from "react";

interface BackgroundMusicOptions {
  volume?: number;
  fadeInDuration?: number;
}

export const useBackgroundMusic = (options: BackgroundMusicOptions = {}) => {
  const { volume = 0.3, fadeInDuration = 3000 } = options;

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const fadeIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Create a simple ambient game music using Web Audio API
  const createAmbientMusic = () => {
    try {
      const audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      const oscillator1 = audioContext.createOscillator();
      const oscillator2 = audioContext.createOscillator();
      const oscillator3 = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      const masterGain = audioContext.createGain();

      // Create ambient soundscape
      oscillator1.type = "sine";
      oscillator1.frequency.setValueAtTime(220, audioContext.currentTime); // A3

      oscillator2.type = "triangle";
      oscillator2.frequency.setValueAtTime(330, audioContext.currentTime); // E4

      oscillator3.type = "sine";
      oscillator3.frequency.setValueAtTime(440, audioContext.currentTime); // A4

      // Connect oscillators to gain
      oscillator1.connect(gainNode);
      oscillator2.connect(gainNode);
      oscillator3.connect(gainNode);
      gainNode.connect(masterGain);
      masterGain.connect(audioContext.destination);

      // Set low volume for ambient effect
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      masterGain.gain.setValueAtTime(0, audioContext.currentTime);

      // Add some modulation for interesting effect
      const lfo = audioContext.createOscillator();
      const lfoGain = audioContext.createGain();

      lfo.type = "sine";
      lfo.frequency.setValueAtTime(0.5, audioContext.currentTime);
      lfoGain.gain.setValueAtTime(10, audioContext.currentTime);

      lfo.connect(lfoGain);
      lfoGain.connect(oscillator1.frequency);

      return {
        start: () => {
          oscillator1.start();
          oscillator2.start();
          oscillator3.start();
          lfo.start();
        },
        stop: () => {
          oscillator1.stop();
          oscillator2.stop();
          oscillator3.stop();
          lfo.stop();
        },
        fadeIn: () => {
          masterGain.gain.linearRampToValueAtTime(
            volume,
            audioContext.currentTime + fadeInDuration / 1000,
          );
        },
        fadeOut: () => {
          masterGain.gain.linearRampToValueAtTime(
            0,
            audioContext.currentTime + 1,
          );
        },
        setVolume: (vol: number) => {
          masterGain.gain.setValueAtTime(vol, audioContext.currentTime);
        },
      };
    } catch (error) {
      console.log("Web Audio API not supported, using fallback");
      return null;
    }
  };

  // Use external music file
  const getMusicUrl = () => {
    return "https://www.dropbox.com/scl/fi/2a07gv4j2ujcbzerl53g6/LIGHT-IT-UP.mp3?rlkey=3p8t5g90u3oobful4lgg3wkrp&st=8rf6kpgc&dl=0";
  };

  useEffect(() => {
    // Create audio element
    const audio = new Audio();
    audio.loop = true;
    audio.preload = "auto";
    audio.crossOrigin = "anonymous"; // For external URLs

    // Set external music URL
    const musicUrl = getMusicUrl();
    audio.src = musicUrl;

    audioRef.current = audio;

    // Handle audio events
    const handleCanPlay = () => {
      setIsLoaded(true);
    };

    const handlePlay = () => {
      setIsPlaying(true);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    audio.addEventListener("canplay", handleCanPlay);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);

    return () => {
      if (fadeIntervalRef.current) {
        clearTimeout(fadeIntervalRef.current);
      }
      audio.removeEventListener("canplay", handleCanPlay);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);

      // Don't revoke external URLs
      audio.pause();
      audio.src = "";
    };
  }, []);

  const fadeIn = (audio: HTMLAudioElement) => {
    audio.volume = 0;
    const step = volume / (fadeInDuration / 100);

    fadeIntervalRef.current = setInterval(() => {
      if (audio.volume + step >= volume) {
        audio.volume = volume;
        if (fadeIntervalRef.current) {
          clearInterval(fadeIntervalRef.current);
        }
      } else {
        audio.volume += step;
      }
    }, 100);
  };

  const fadeOut = (audio: HTMLAudioElement, callback?: () => void) => {
    const step = audio.volume / 10;

    const fadeOutInterval = setInterval(() => {
      if (audio.volume - step <= 0) {
        audio.volume = 0;
        audio.pause();
        clearInterval(fadeOutInterval);
        callback?.();
      } else {
        audio.volume -= step;
      }
    }, 100);
  };

  const playMusic = async () => {
    if (!audioRef.current) return;

    try {
      // Reset volume for fade in
      audioRef.current.volume = 0;
      await audioRef.current.play();
      fadeIn(audioRef.current);
      setIsPlaying(true);
    } catch (error) {
      console.log("Could not play background music:", error);
      setIsPlaying(false);
    }
  };

  const stopMusic = () => {
    if (!audioRef.current) return;

    if (fadeIntervalRef.current) {
      clearInterval(fadeIntervalRef.current);
    }

    // Immediate pause for better user control
    audioRef.current.pause();
    setIsPlaying(false);
  };

  const toggleMusic = () => {
    if (isPlaying) {
      stopMusic();
    } else {
      playMusic();
    }
  };

  const setVolumeLevel = (newVolume: number) => {
    if (audioRef.current) {
      audioRef.current.volume = Math.max(0, Math.min(1, newVolume));
    }
  };

  return {
    isPlaying,
    isLoaded,
    playMusic,
    stopMusic,
    toggleMusic,
    setVolume: setVolumeLevel,
  };
};
