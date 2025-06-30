import { useEffect, useRef, useState } from "react";

interface BackgroundMusicOptions {
  volume?: number;
  fadeInDuration?: number;
  autoPlayDelay?: number;
}

export const useBackgroundMusic = (options: BackgroundMusicOptions = {}) => {
  const {
    volume = 0.3,
    fadeInDuration = 3000,
    autoPlayDelay = 10000,
  } = options;

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);
  const fadeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const autoPlayTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  // Alternative: Use a data URL with a simple generated tone
  const generateMusicDataUrl = () => {
    const sampleRate = 44100;
    const duration = 30; // 30 seconds loop
    const samples = sampleRate * duration;
    const buffer = new Float32Array(samples);

    // Generate ambient music with multiple sine waves
    for (let i = 0; i < samples; i++) {
      const t = i / sampleRate;

      // Multiple harmonious frequencies for ambient effect
      const freq1 = 220; // A3
      const freq2 = 330; // E4
      const freq3 = 440; // A4
      const freq4 = 550; // C#5

      // Add some modulation
      const mod = Math.sin(t * 0.5) * 0.1;

      buffer[i] =
        Math.sin(2 * Math.PI * freq1 * t) * 0.15 +
        Math.sin(2 * Math.PI * freq2 * t) * 0.1 +
        Math.sin(2 * Math.PI * freq3 * t) * 0.08 +
        Math.sin(2 * Math.PI * freq4 * t) * 0.05 +
        mod;

      // Add some envelope to make it less harsh
      const envelope = Math.sin((t * Math.PI) / duration) * 0.5 + 0.5;
      buffer[i] *= envelope * 0.3; // Keep volume low
    }

    // Convert to WAV data URL
    const wavBuffer = new ArrayBuffer(44 + samples * 2);
    const view = new DataView(wavBuffer);

    // WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    writeString(0, "RIFF");
    view.setUint32(4, 36 + samples * 2, true);
    writeString(8, "WAVE");
    writeString(12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, "data");
    view.setUint32(40, samples * 2, true);

    // Convert float samples to 16-bit PCM
    let offset = 44;
    for (let i = 0; i < samples; i++) {
      const sample = Math.max(-1, Math.min(1, buffer[i]));
      view.setInt16(offset, sample * 0x7fff, true);
      offset += 2;
    }

    const blob = new Blob([wavBuffer], { type: "audio/wav" });
    return URL.createObjectURL(blob);
  };

  useEffect(() => {
    // Create audio element
    const audio = new Audio();
    audio.loop = true;
    audio.preload = "auto";

    // Generate music data URL
    const musicUrl = generateMusicDataUrl();
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

    // Track user interaction
    const handleUserInteraction = () => {
      setUserInteracted(true);
      document.removeEventListener("click", handleUserInteraction);
      document.removeEventListener("keydown", handleUserInteraction);
      document.removeEventListener("touchstart", handleUserInteraction);
    };

    document.addEventListener("click", handleUserInteraction);
    document.addEventListener("keydown", handleUserInteraction);
    document.addEventListener("touchstart", handleUserInteraction);

    return () => {
      if (fadeIntervalRef.current) {
        clearTimeout(fadeIntervalRef.current);
      }
      if (autoPlayTimeoutRef.current) {
        clearTimeout(autoPlayTimeoutRef.current);
      }
      audio.removeEventListener("canplay", handleCanPlay);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      document.removeEventListener("click", handleUserInteraction);
      document.removeEventListener("keydown", handleUserInteraction);
      document.removeEventListener("touchstart", handleUserInteraction);

      if (audio.src) {
        URL.revokeObjectURL(audio.src);
      }
      audio.pause();
    };
  }, []);

  // Auto-play after delay when user has interacted and audio is loaded
  useEffect(() => {
    if (isLoaded && userInteracted && !isPlaying) {
      autoPlayTimeoutRef.current = setTimeout(() => {
        playMusic();
      }, autoPlayDelay);
    }

    return () => {
      if (autoPlayTimeoutRef.current) {
        clearTimeout(autoPlayTimeoutRef.current);
      }
    };
  }, [isLoaded, userInteracted, isPlaying]);

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
    if (!audioRef.current || isPlaying) return;

    try {
      await audioRef.current.play();
      fadeIn(audioRef.current);
    } catch (error) {
      console.log("Could not play background music:", error);
    }
  };

  const stopMusic = () => {
    if (!audioRef.current || !isPlaying) return;

    if (fadeIntervalRef.current) {
      clearInterval(fadeIntervalRef.current);
    }

    fadeOut(audioRef.current);
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
    userInteracted,
    playMusic,
    stopMusic,
    toggleMusic,
    setVolume: setVolumeLevel,
  };
};
