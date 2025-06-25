
import React from 'react';
import { Button } from '@/components/ui/button';
import { Crown, Grid3X3 } from 'lucide-react';

interface GameSelectionProps {
  onSelectGame: (gameType: 'chess' | 'dots-and-boxes') => void;
}

export const GameSelection: React.FC<GameSelectionProps> = ({ onSelectGame }) => {
  return (
    <div className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8 rounded-xl shadow-2xl border-4 border-yellow-400">
      <h2 className="text-white text-3xl font-bold text-center mb-8">
        Choose Your Game
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-black/30 p-6 rounded-lg border-2 border-purple-400 hover:border-yellow-400 transition-colors">
          <div className="text-center">
            <Crown className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
            <h3 className="text-white text-2xl font-bold mb-2">Chess</h3>
            <p className="text-gray-300 mb-4">
              Classic strategy game with timed matches and betting
            </p>
            <Button 
              onClick={() => onSelectGame('chess')}
              className="w-full bg-yellow-600 hover:bg-yellow-700 text-black font-bold"
            >
              Play Chess
            </Button>
          </div>
        </div>

        <div className="bg-black/30 p-6 rounded-lg border-2 border-purple-400 hover:border-yellow-400 transition-colors">
          <div className="text-center">
            <Grid3X3 className="w-16 h-16 text-blue-400 mx-auto mb-4" />
            <h3 className="text-white text-2xl font-bold mb-2">Dots and Boxes</h3>
            <p className="text-gray-300 mb-4">
              Connect dots to complete boxes and score points
            </p>
            <Button 
              onClick={() => onSelectGame('dots-and-boxes')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold"
            >
              Play Dots & Boxes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
