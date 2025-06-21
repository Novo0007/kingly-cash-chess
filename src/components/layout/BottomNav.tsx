
import React from 'react';
import { Button } from '@/components/ui/button';
import { Crown, Users, DollarSign, User, MessageCircle } from 'lucide-react';

interface BottomNavProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentView, onViewChange }) => {
  const navItems = [
    { id: 'lobby', label: 'Games', icon: Crown },
    { id: 'friends', label: 'Friends', icon: Users },
    { id: 'wallet', label: 'Wallet', icon: DollarSign },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-lg border-t border-yellow-500/20">
      <div className="flex items-center justify-around px-2 py-2 max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          
          return (
            <Button
              key={item.id}
              variant="ghost"
              size="sm"
              onClick={() => onViewChange(item.id)}
              className={`flex flex-col items-center gap-1 px-3 py-2 h-auto min-w-0 ${
                isActive 
                  ? 'text-yellow-500 bg-yellow-500/10' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
};
