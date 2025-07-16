import React, { useRef, useEffect, useState } from "react";
import { X, Volume2, VolumeX, Play } from "lucide-react";

interface IntroVideoProps {
  onVideoEnd: () => void;
  videoUrl: string;
}

export const IntroVideo: React.FC<IntroVideoProps> = ({
  onVideoEnd,
  videoUrl,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [showPlayButton, setShowPlayButton] = useState(false);
  const [videoError, setVideoError] = useState(false);

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

    const handleCanPlay = () => {
      video.play().catch(() => {
        // If autoplay fails, show play button
        setShowPlayButton(true);
      });
    };

    video.addEventListener("ended", handleVideoEnd);
    video.addEventListener("error", handleVideoError);
    video.addEventListener("canplay", handleCanPlay);

    return () => {
      video.removeEventListener("ended", handleVideoEnd);
      video.removeEventListener("error", handleVideoError);
      video.removeEventListener("canplay", handleCanPlay);
    };
  }, [onVideoEnd]);

  const handleSkip = () => {
    onVideoEnd();
  };

  const handlePlayClick = () => {
    const video = videoRef.current;
    if (video) {
      video.play();
      setShowPlayButton(false);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (video) {
      video.muted = !video.muted;
      setIsMuted(video.muted);
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
