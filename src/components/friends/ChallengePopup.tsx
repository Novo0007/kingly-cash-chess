
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sword, Coins, Trophy, Zap } from 'lucide-react';

interface ChallengePopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  friendName: string;
  onChallenge: (amount: number) => void;
}

const challengeAmounts = [
  { amount: 10, color: 'from-green-500 to-emerald-500', icon: '💚' },
  { amount: 20, color: 'from-blue-500 to-cyan-500', icon: '💙' },
  { amount: 50, color: 'from-purple-500 to-violet-500', icon: '💜' },
  { amount: 100, color: 'from-orange-500 to-red-500', icon: '❤️' }
];

export const ChallengePopup = ({ open, onOpenChange, friendName, onChallenge }: ChallengePopupProps) => {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);

  const handleChallenge = () => {
    if (selectedAmount) {
      onChallenge(selectedAmount);
      setSelectedAmount(null);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-md mx-auto bg-gradient-to-br from-purple-700 to-blue-700 border-4 border-purple-400 shadow-2xl rounded-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-center gap-3 text-white text-2xl sm:text-3xl font-black animate-pulse">
            <Sword className="h-8 w-8 text-yellow-400 animate-bounce" />
            ⚔️ Challenge {friendName}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 p-2">
          <div className="text-center">
            <p className="text-white font-bold text-lg mb-4">
              Select your battle stakes:
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              {challengeAmounts.map(({ amount, color, icon }) => (
                <Button
                  key={amount}
                  onClick={() => setSelectedAmount(amount)}
                  className={`
                    relative p-6 h-auto bg-gradient-to-r ${color} hover:scale-110 transform transition-all duration-300 
                    border-4 ${selectedAmount === amount ? 'border-yellow-400 shadow-2xl' : 'border-white/30'} 
                    rounded-2xl font-black text-white text-xl
                    ${selectedAmount === amount ? 'animate-pulse' : ''}
                  `}
                >
                  <div className="flex flex-col items-center space-y-2">
                    <span className="text-3xl">{icon}</span>
                    <span className="text-2xl">₹{amount}</span>
                    {selectedAmount === amount && (
                      <Badge className="bg-yellow-400 text-black font-black text-sm animate-bounce">
                        SELECTED
                      </Badge>
                    )}
                  </div>
                  {selectedAmount === amount && (
                    <div className="absolute inset-0 bg-yellow-400/20 rounded-2xl animate-ping"></div>
                  )}
                </Button>
              ))}
            </div>
          </div>

          <div className="bg-white/10 p-4 rounded-2xl border-2 border-white/30">
            <div className="flex items-center justify-center gap-2 text-white font-bold mb-2">
              <Trophy className="h-5 w-5 text-yellow-400" />
              Prize Pool Preview
            </div>
            <div className="text-center">
              <p className="text-gray-300 text-sm">Entry Fee: ₹{selectedAmount || '?'}</p>
              <p className="text-yellow-400 font-black text-lg">
                🏆 Winner Takes: ₹{selectedAmount ? selectedAmount * 2 : '?'}
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={() => onOpenChange(false)}
              variant="outline"
              className="flex-1 font-bold text-lg py-3 rounded-xl border-2 border-gray-400 text-gray-300 hover:bg-gray-800"
            >
              Cancel
            </Button>
            <Button
              onClick={handleChallenge}
              disable={!selectedAmount}
              className={`
                flex-1 font-black text-lg py-3 rounded-xl shadow-lg transform transition-all duration-300
                ${selectedAmount 
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 hover:scale-105 text-white' 
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }
              `}
            >
              <Zap className="h-5 w-5 mr-2" />
              {selectedAmount ? 'Send Challenge!' : 'Select Amount'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
