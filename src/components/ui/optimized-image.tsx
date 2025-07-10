import React, { useState, useRef, useEffect } from "react";
import {
  getOptimizedImageUrl,
  generatePlaceholder,
  generateSrcSet,
  getOptimalFormat,
} from "@/utils/imageOptimization";

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  quality?: number;
  className?: string;
  loading?: "lazy" | "eager";
  placeholder?: "blur" | "empty";
  fallback?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width = 400,
  height = 300,
  quality = 80,
  className = "",
  loading = "lazy",
  placeholder = "blur",
  fallback,
  onLoad,
  onError,
}) => {
  // Validate and sanitize inputs
  const safeSrc = typeof src === "string" ? src.trim() : "";
  const safeAlt = typeof alt === "string" ? alt.replace(/[<>"']/g, "") : "";
  const safeWidth = Math.max(1, Math.min(2000, Math.floor(Number(width))));
  const safeHeight = Math.max(1, Math.min(2000, Math.floor(Number(height))));
  const safeQuality = Math.max(1, Math.min(100, Math.floor(Number(quality))));

  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(loading === "eager");
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (loading === "eager" || !containerRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: "50px 0px",
        threshold: 0.1,
      },
    );

    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, [loading]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  const optimizedSrc = getOptimizedImageUrl(safeSrc, {
    width: safeWidth,
    height: safeHeight,
    quality: safeQuality,
  });
  const finalSrc = getOptimalFormat(optimizedSrc);
  const srcSet = generateSrcSet(safeSrc);
  const placeholderSrc = generatePlaceholder(safeWidth, safeHeight);

  const displaySrc = hasError ? fallback || placeholderSrc : finalSrc;

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      style={{ width: width || "100%", height: height || "auto" }}
    >
      {/* Placeholder/Loading state */}
      {!isLoaded && placeholder === "blur" && (
        <div
          className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center"
          style={{
            backgroundImage: `url(${placeholderSrc})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "blur(5px)",
          }}
        >
          <div className="text-gray-400 text-sm">Loading...</div>
        </div>
      )}

      {/* Main image */}
      {isInView && (
        <img
          ref={imgRef}
          src={displaySrc}
          srcSet={srcSet}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          alt={alt}
          loading={loading}
          onLoad={handleLoad}
          onError={handleError}
          className={`
            w-full h-full object-cover transition-all duration-500
            ${isLoaded ? "opacity-100" : "opacity-0"}
            ${hasError ? "filter grayscale" : ""}
          `}
          style={{
            transform: isLoaded ? "scale(1)" : "scale(1.05)",
          }}
        />
      )}

      {/* Loading overlay with modern spinner */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
          <div className="relative">
            <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <div
              className="absolute inset-0 w-8 h-8 border-2 border-transparent border-r-purple-600 rounded-full animate-spin"
              style={{
                animationDirection: "reverse",
                animationDuration: "1.5s",
              }}
            ></div>
          </div>
        </div>
      )}

      {/* Error state */}
      {hasError && !fallback && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 text-gray-500">
          <div className="text-center">
            <div className="text-2xl mb-2">🖼️</div>
            <div className="text-sm">Image not available</div>
          </div>
        </div>
      )}

      {/* Smooth fade-in effect */}
      <div
        className={`
          absolute inset-0 bg-white transition-opacity duration-500
          ${isLoaded ? "opacity-0 pointer-events-none" : "opacity-100"}
        `}
      />
    </div>
  );
};

// Game card specific image component
export const GameCardImage: React.FC<{
  gameId: string;
  title: string;
  className?: string;
}> = ({ gameId, title, className = "" }) => {
  const gameImageMap: Record<string, string> = {
    chess: "https://images.unsplash.com/photo-1528819622765-d6bcf132ac11",
    ludo: "https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5",
    maze: "https://images.unsplash.com/photo-1551103782-8ab07afd45c1",
    game2048: "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937",
    math: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb",
    wordsearch: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570",
  };

  return (
    <OptimizedImage
      src={gameImageMap[gameId] || gameImageMap.chess}
      alt={`${title} game`}
      width={400}
      height={300}
      quality={85}
      className={className}
      loading="lazy"
      placeholder="blur"
      fallback="https://images.unsplash.com/photo-1551103782-8ab07afd45c1?w=400&h=300&fit=crop&q=80"
    />
  );
};

// Hero image component for large displays
export const HeroImage: React.FC<{
  src: string;
  alt: string;
  className?: string;
}> = ({ src, alt, className = "" }) => {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={1200}
      height={800}
      quality={90}
      className={className}
      loading="eager"
      placeholder="blur"
    />
  );
};
