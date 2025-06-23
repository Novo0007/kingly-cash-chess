
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
      <DialogContent className="w-[95vw] max-w-md mx-auto bg-white border-2 border-gray-300 shadow-xl rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-center gap-3 text-gray-800 text-2xl font-bold">
            <Sword className="h-7 w-7 text-blue-600" />
            Challenge {friendName}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 p-2">
          <div className="text-center">
            <p className="text-gray-700 font-bold text-lg mb-4">
              Select your challenge amount:
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              {challengeAmounts.map(({ amount, color, icon }) => (
                <Button
                  key={amount}
                  onClick={() => setSelectedAmount(amount)}
                  className={`
                    relative p-6 h-auto bg-gradient-to-r ${color} hover:scale-105 transform transition-all duration-200 
                    border-2 ${selectedAmount === amount ? 'border-yellow-500 shadow-lg' : 'border-white/30'} 
                    rounded-xl font-bold text-white text-lg
                  `}
                >
                  <div className="flex flex-col items-center space-y-2">
                    <span className="text-2xl">{icon}</span>
                    <span className="text-xl">₹{amount}</span>
                    {selectedAmount === amount && (
                      <Badge className="bg-yellow-500 text-black font-bold text-sm">
                        SELECTED
                      </Badge>
                    )}
                  </div>
                </Button>
              ))}
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
            <div className="flex items-center justify-center gap-2 text-gray-700 font-bold mb-2">
              <Trophy className="h-5 w-5 text-yellow-600" />
              Prize Pool Preview
            </div>
            <div className="text-center">
              <p className="text-gray-600 text-sm">Entry Fee: ₹{selectedAmount || '?'}</p>
              <p className="text-green-600 font-bold text-lg">
                Winner Takes: ₹{selectedAmount ? selectedAmount * 2 : '?'}
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={() => onOpenChange(false)}
              variant="outline"
              className="flex-1 font-bold text-lg py-3 rounded-xl border-2 border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleChallenge}
              disabled={!selectedAmount}
              className={`
                flex-1 font-bold text-lg py-3 rounded-xl transform transition-all duration-200
                ${selectedAmount 
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 hover:scale-105 text-white' 
                  : 'bg-gray-400 text-gray-700 cursor-not-allowed'
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
