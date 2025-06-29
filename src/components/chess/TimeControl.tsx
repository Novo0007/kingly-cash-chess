
import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    setDisplayWhiteTime(whiteTime);
    setDisplayBlackTime(blackTime);
  }, [whiteTime, blackTime]);

  useEffect(() => {
    if (!isActive || gameStatus !== 'active') return;

    const interval = setInterval(() => {
      if (currentTurn === 'white') {
        setDisplayWhiteTime(prev => {
          if (prev <= 1) {
            onTimeUp('white');
            return 0;
          }
          return prev - 1;
        });
      } else {
        setDisplayBlackTime(prev => {
          if (prev <= 1) {
            onTimeUp('black');
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [currentTurn, gameStatus, isActive, onTimeUp]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isLowTime = (time: number) => time <= 30;

  return (
    <div className="flex justify-between items-center gap-2 mb-4">
      {/* White Player Time */}
      <Card className={`flex-1 ${currentTurn === 'white' && isActive ? 'border-yellow-400 bg-yellow-900/20' : 'border-gray-600'}`}>
        <CardContent className="p-2 text-center">
          <div className="flex items-center justify-center gap-1 text-white">
            <Clock className="h-3 w-3" />
            <span className="text-xs font-medium">⚪</span>
          </div>
          <div className={`text-lg font-mono font-bold ${isLowTime(displayWhiteTime) ? 'text-red-400 animate-pulse' : 'text-white'}`}>
            {formatTime(displayWhiteTime)}
            {isLowTime(displayWhiteTime) && <AlertTriangle className="inline h-3 w-3 ml-1" />}
          </div>
        </CardContent>
      </Card>

      {/* Black Player Time */}
      <Card className={`flex-1 ${currentTurn === 'black' && isActive ? 'border-yellow-400 bg-yellow-900/20' : 'border-gray-600'}`}>
        <CardContent className="p-2 text-center">
          <div className="flex items-center justify-center gap-1 text-white">
            <Clock className="h-3 w-3" />
            <span className="text-xs font-medium">⚫</span>
          </div>
          <div className={`text-lg font-mono font-bold ${isLowTime(displayBlackTime) ? 'text-red-400 animate-pulse' : 'text-white'}`}>
            {formatTime(displayBlackTime)}
            {isLowTime(displayBlackTime) && <AlertTriangle className="inline h-3 w-3 ml-1" />}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
