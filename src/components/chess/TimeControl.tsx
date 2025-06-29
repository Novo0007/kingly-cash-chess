
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface TimeControlProps {
  whiteTime: number;
  blackTime: number;
  currentTurn: 'white' | 'black';
  gameStatus: string;
  onTimeUp: (player: 'white' | 'black') => void;
  isActive: boolean;
}

export const TimeControl: React.FC<TimeControlProps> = ({
  whiteTime,
  blackTime,
  currentTurn,
  gameStatus,
  onTimeUp,
  isActive
}) => {
  const [displayWhiteTime, setDisplayWhiteTime] = useState(whiteTime);
  const [displayBlackTime, setDisplayBlackTime] = useState(blackTime);
  const [lastUpdate, setLastUpdate] = useState(Date.now());

  // Memoized time formatting for better performance
  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(Math.max(0, seconds) / 60);
    const secs = Math.max(0, seconds) % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const isLowTime = useCallback((time: number) => time <= 30, []);

  // Memoized values to prevent unnecessary re-renders
  const whiteTimeFormatted = useMemo(() => formatTime(displayWhiteTime), [displayWhiteTime, formatTime]);
  const blackTimeFormatted = useMemo(() => formatTime(displayBlackTime), [displayBlackTime, formatTime]);
  const whiteIsLow = useMemo(() => isLowTime(displayWhiteTime), [displayWhiteTime, isLowTime]);
  const blackIsLow = useMemo(() => isLowTime(displayBlackTime), [displayBlackTime, isLowTime]);

  useEffect(() => {
    setDisplayWhiteTime(whiteTime);
    setDisplayBlackTime(blackTime);
    setLastUpdate(Date.now());
  }, [whiteTime, blackTime]);

  useEffect(() => {
    if (!isActive || gameStatus !== 'active') return;

    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = Math.floor((now - lastUpdate) / 1000);
      
      if (elapsed >= 1) {
        setLastUpdate(now);
        
        if (currentTurn === 'white') {
          setDisplayWhiteTime(prev => {
            const newTime = Math.max(0, prev - elapsed);
            if (newTime <= 0 && prev > 0) {
              onTimeUp('white');
            }
            return newTime;
          });
        } else {
          setDisplayBlackTime(prev => {
            const newTime = Math.max(0, prev - elapsed);
            if (newTime <= 0 && prev > 0) {
              onTimeUp('black');
            }
            return newTime;
          });
        }
      }
    }, 100); // Check more frequently but only update when needed

    return () => clearInterval(interval);
  }, [currentTurn, gameStatus, isActive, onTimeUp, lastUpdate]);

  return (
    <div className="flex justify-between items-center gap-1 sm:gap-2 mb-2 sm:mb-4 px-1">
      {/* White Player Time */}
      <Card className={cn(
        "flex-1 transition-all duration-200 border-2",
        currentTurn === 'white' && isActive 
          ? 'border-yellow-400 bg-yellow-900/20 shadow-lg' 
          : 'border-gray-600 bg-gray-900/50'
      )}>
        <CardContent className="p-1 sm:p-2 text-center">
          <div className="flex items-center justify-center gap-1 text-white mb-1">
            <Clock className="h-2 w-2 sm:h-3 sm:w-3" />
            <span className="text-xs font-medium">⚪</span>
          </div>
          <div className={cn(
            "text-sm sm:text-lg font-mono font-bold transition-colors duration-200",
            whiteIsLow 
              ? 'text-red-400 animate-pulse' 
              : 'text-white'
          )}>
            {whiteTimeFormatted}
            {whiteIsLow && <AlertTriangle className="inline h-2 w-2 sm:h-3 sm:w-3 ml-1" />}
          </div>
        </CardContent>
      </Card>

      {/* Black Player Time */}
      <Card className={cn(
        "flex-1 transition-all duration-200 border-2",
        currentTurn === 'black' && isActive 
          ? 'border-yellow-400 bg-yellow-900/20 shadow-lg' 
          : 'border-gray-600 bg-gray-900/50'
      )}>
        <CardContent className="p-1 sm:p-2 text-center">
          <div className="flex items-center justify-center gap-1 text-white mb-1">
            <Clock className="h-2 w-2 sm:h-3 sm:w-3" />
            <span className="text-xs font-medium">⚫</span>
          </div>
          <div className={cn(
            "text-sm sm:text-lg font-mono font-bold transition-colors duration-200",
            blackIsLow 
              ? 'text-red-400 animate-pulse' 
              : 'text-white'
          )}>
            {blackTimeFormatted}
            {blackIsLow && <AlertTriangle className="inline h-2 w-2 sm:h-3 sm:w-3 ml-1" />}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

function cn(...classes: (string | boolean | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}
