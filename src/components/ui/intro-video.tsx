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
  const [isMuted, setIsMuted] = useState(false); // Try unmuted first
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
      // Small delay for mobile compatibility
      await new Promise((resolve) => setTimeout(resolve, 100));

      try {
        // First try to play with sound
        video.muted = false;
        setIsMuted(false);

        await video.play();
        setIsPlaying(true);
        setShowPlayButton(false);
        console.log("Autoplay with sound successful");
      } catch (error) {
        console.log("Autoplay with sound failed, trying muted...");

        try {
          // Fallback to muted autoplay
          video.muted = true;
          setIsMuted(true);

          await video.play();
          setIsPlaying(true);
          setShowPlayButton(false);
          console.log("Muted autoplay successful");

          // Show unmute option after a short delay
          setTimeout(() => {
            if (!hasUserInteracted) {
              setHasUserInteracted(true);
            }
          }, 1000);
        } catch (mutedError) {
          console.log("All autoplay attempts failed, showing play button");
          setShowPlayButton(true);
          setIsPlaying(false);
        }
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
        // Try to play with sound first since user clicked
        video.muted = false;
        setIsMuted(false);
        await video.play();
        setIsPlaying(true);
        setShowPlayButton(false);
      } catch (error) {
        console.error("Failed to play video:", error);
        // If still fails, try muted
        try {
          video.muted = true;
          setIsMuted(true);
          await video.play();
          setIsPlaying(true);
          setShowPlayButton(false);
        } catch (mutedError) {
          console.error("Failed to play video even muted:", mutedError);
        }
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
      <div
        className="relative w-full h-full cursor-pointer"
        onClick={handleVideoClick}
      >
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          muted={isMuted}
          playsInline
          webkit-playsinline="true"
          x5-playsinline="true"
          preload="auto"
          autoPlay
          loop={false}
        >
          <source src={videoUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        {/* Play Button Overlay (shown if autoplay fails) */}
        {showPlayButton && (
          <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center">
            <button
              onClick={handlePlayClick}
              className={`${isMobile ? "w-24 h-24" : "w-20 h-20"} bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 active:bg-white/40 transition-all duration-300 border-2 border-white/30 touch-manipulation`}
            >
              <Play
                className={`${isMobile ? "w-10 h-10" : "w-8 h-8"} text-white ml-1`}
              />
            </button>
            {isMobile && (
              <p className="text-white/70 text-sm mt-4 text-center px-4">
                Tap to play intro video
              </p>
            )}
          </div>
        )}
      </div>

      {/* Control Buttons */}
      <div
        className={`absolute ${isMobile ? "top-2 right-2" : "top-4 right-4"} flex gap-2`}
      >
        {/* Mute/Unmute Button - Only show if user has interacted */}
        {hasUserInteracted && (
          <button
            onClick={toggleMute}
            className={`${isMobile ? "w-12 h-12" : "w-10 h-10"} bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-black/70 active:bg-black/80 transition-colors border border-white/20 touch-manipulation`}
          >
            {isMuted ? (
              <VolumeX
                className={`${isMobile ? "w-6 h-6" : "w-5 h-5"} text-white`}
              />
            ) : (
              <Volume2
                className={`${isMobile ? "w-6 h-6" : "w-5 h-5"} text-white`}
              />
            )}
          </button>
        )}

        {/* Skip Button */}
        <button
          onClick={handleSkip}
          className={`${isMobile ? "w-12 h-12" : "w-10 h-10"} bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-black/70 active:bg-black/80 transition-colors border border-white/20 touch-manipulation`}
        >
          <X className={`${isMobile ? "w-6 h-6" : "w-5 h-5"} text-white`} />
        </button>
      </div>

      {/* Skip Text */}
      <div
        className={`absolute ${isMobile ? "bottom-2 right-2" : "bottom-4 right-4"}`}
      >
        <button
          onClick={handleSkip}
          className={`text-white/70 hover:text-white active:text-white/90 transition-colors ${isMobile ? "text-base py-2 px-3" : "text-sm"} font-medium touch-manipulation`}
        >
          Skip Intro
        </button>
      </div>
    </div>
  );
};
