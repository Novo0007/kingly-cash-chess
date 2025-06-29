
import React from 'react';
import { cn } from '@/lib/utils';

interface MobileOptimizedProps {
  children: React.ReactNode;
  className?: string;
  disableScroll?: boolean;
}

export const MobileOptimized: React.FC<MobileOptimizedProps> = ({
  children,
  className,
  disableScroll = false
}) => {
  return (
    <div 
      className={cn(
        "relative w-full min-h-screen",
        "touch-manipulation", // Improves touch responsiveness
        "select-none", // Prevents text selection on mobile
        disableScroll && "overflow-hidden",
        className
      )}
      style={{
        WebkitTapHighlightColor: 'transparent', // Removes tap highlight
        WebkitTouchCallout: 'none', // Disables callout
        WebkitUserSelect: 'none',
        touchAction: 'manipulation' // Improves touch performance
      }}
    >
      {children}
    </div>
  );
};
