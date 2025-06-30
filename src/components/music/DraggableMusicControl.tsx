import { useState, useRef, useEffect } from "react";

interface DraggableMusicControlProps {
  isPlaying: boolean;
  onToggle: () => void;
}

export const DraggableMusicControl = ({
  isPlaying,
  onToggle,
}: DraggableMusicControlProps) => {
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const elementRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!elementRef.current) return;

    const rect = elementRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    setIsDragging(true);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!elementRef.current) return;

    const touch = e.touches[0];
    const rect = elementRef.current.getBoundingClientRect();
    setDragOffset({
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top,
    });
    setIsDragging(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;

      // Keep within viewport bounds
      const maxX = window.innerWidth - 60; // 60px is approximate button width
      const maxY = window.innerHeight - 60; // 60px is approximate button height

      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY)),
      });
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging) return;

      const touch = e.touches[0];
      const newX = touch.clientX - dragOffset.x;
      const newY = touch.clientY - dragOffset.y;

      // Keep within viewport bounds
      const maxX = window.innerWidth - 60;
      const maxY = window.innerHeight - 60;

      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY)),
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    const handleTouchEnd = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.addEventListener("touchmove", handleTouchMove);
      document.addEventListener("touchend", handleTouchEnd);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isDragging, dragOffset]);

  const handleClick = (e: React.MouseEvent) => {
    // Only toggle if not dragging (to prevent accidental toggles while dragging)
    if (!isDragging) {
      onToggle();
    }
  };

  return (
    <div
      ref={elementRef}
      className="fixed z-50 select-none"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        cursor: isDragging ? "grabbing" : "grab",
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onClick={handleClick}
    >
      <button
        className={`bg-gradient-to-r from-purple-600/80 to-pink-600/80 backdrop-blur-xl hover:from-purple-500/90 hover:to-pink-500/90 text-white p-3 rounded-full shadow-lg border border-purple-300/30 transition-all duration-300 group ${
          isDragging ? "scale-110" : "hover:scale-110"
        }`}
        title={isPlaying ? "Pause Background Music" : "Play Background Music"}
        style={{ pointerEvents: isDragging ? "none" : "auto" }}
      >
        {isPlaying ? (
          // Pause icon
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
          </svg>
        ) : (
          // Play icon
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        )}

        {/* Pulsing animation when music is playing */}
        {isPlaying && (
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/40 to-pink-500/40 rounded-full animate-pulse"></div>
        )}

        {/* Sound waves animation */}
        {isPlaying && (
          <div className="absolute -right-1 top-1/2 transform -translate-y-1/2">
            <div className="flex space-x-0.5">
              <div
                className="w-0.5 h-2 bg-white/60 rounded-full animate-pulse"
                style={{ animationDelay: "0ms" }}
              ></div>
              <div
                className="w-0.5 h-3 bg-white/60 rounded-full animate-pulse"
                style={{ animationDelay: "150ms" }}
              ></div>
              <div
                className="w-0.5 h-2 bg-white/60 rounded-full animate-pulse"
                style={{ animationDelay: "300ms" }}
              ></div>
            </div>
          </div>
        )}
      </button>
    </div>
  );
};
