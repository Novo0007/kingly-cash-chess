import React, { useRef, useEffect, useState } from "react";
import { X, Volume2, VolumeX, Play } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface IntroVideoProps {
  onVideoEnd: () => void;
  videoUrl: string;
}

export const IntroVideo: React.FC<IntroVideoProps> = ({
  onVideoEnd,
  videoUrl,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const isMobile = useIsMobile();
  const [isMuted, setIsMuted] = useState(true); // Start muted for better autoplay support
  const [showPlayButton, setShowPlayButton] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleVideoEnd = () => {
      onVideoEnd();
    };

    const handleVideoError = () => {
      console.warn("Video failed to load, skipping intro");
      setVideoError(true);
      onVideoEnd();
    };

    const handleLoadedData = () => {
      // Try autoplay when video data is loaded
      attemptAutoplay();
    };

    const handlePlay = () => {
      setIsPlaying(true);
      setShowPlayButton(false);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    const attemptAutoplay = async () => {
      try {
        // Ensure video is muted for autoplay
        video.muted = true;
        setIsMuted(true);

        await video.play();
        setIsPlaying(true);
        setShowPlayButton(false);
      } catch (error) {
        console.log("Autoplay failed, showing play button");
        setShowPlayButton(true);
        setIsPlaying(false);
      }
    };

    // Mobile-specific optimizations
    if (isMobile) {
      video.setAttribute("webkit-playsinline", "true");
      video.setAttribute("x5-playsinline", "true"); // For WeChat browser
    }

    video.addEventListener("ended", handleVideoEnd);
    video.addEventListener("error", handleVideoError);
    video.addEventListener("loadeddata", handleLoadedData);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);

    // Try immediate autoplay if video is already loaded
    if (video.readyState >= 3) {
      attemptAutoplay();
    }

    return () => {
      video.removeEventListener("ended", handleVideoEnd);
      video.removeEventListener("error", handleVideoError);
      video.removeEventListener("loadeddata", handleLoadedData);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
    };
  }, [onVideoEnd, isMobile]);

  const handleSkip = () => {
    onVideoEnd();
  };

  const handlePlayClick = async () => {
    const video = videoRef.current;
    if (video) {
      setHasUserInteracted(true);
      try {
        await video.play();
        setIsPlaying(true);
        setShowPlayButton(false);
      } catch (error) {
        console.error("Failed to play video:", error);
      }
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (video && hasUserInteracted) {
      video.muted = !video.muted;
      setIsMuted(video.muted);
    }
  };

  const handleVideoClick = () => {
    if (!hasUserInteracted) {
      handlePlayClick();
    }
  };

  if (videoError) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
      {/* Video Element */}
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        muted={isMuted}
        playsInline
        preload="auto"
      >
        <source src={videoUrl} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Play Button Overlay (shown if autoplay fails) */}
      {showPlayButton && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <button
            onClick={handlePlayClick}
            className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-300 border-2 border-white/30"
          >
            <Play className="w-8 h-8 text-white ml-1" />
          </button>
        </div>
      )}

      {/* Control Buttons */}
      <div className="absolute top-4 right-4 flex gap-2">
        {/* Mute/Unmute Button */}
        <button
          onClick={toggleMute}
          className="w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-black/70 transition-colors border border-white/20"
        >
          {isMuted ? (
            <VolumeX className="w-5 h-5 text-white" />
          ) : (
            <Volume2 className="w-5 h-5 text-white" />
          )}
        </button>

        {/* Skip Button */}
        <button
          onClick={handleSkip}
          className="w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-black/70 transition-colors border border-white/20"
        >
          <X className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Skip Text */}
      <div className="absolute bottom-4 right-4">
        <button
          onClick={handleSkip}
          className="text-white/70 hover:text-white transition-colors text-sm font-medium"
        >
          Skip Intro
        </button>
      </div>
    </div>
  );
};
