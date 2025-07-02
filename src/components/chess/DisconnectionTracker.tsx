
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertTriangle, Wifi, WifiOff } from 'lucide-react';

interface DisconnectionTrackerProps {
  gameId: string;
  currentUser: string | null;
  whitePlayerId: string | null;
  blackPlayerId: string | null;
  gameStatus: string;
  onPlayerDisconnected: (playerId: string) => void;
}

export const DisconnectionTracker: React.FC<DisconnectionTrackerProps> = ({
  gameId,
  currentUser,
  whitePlayerId,
  blackPlayerId,
  gameStatus,
  onPlayerDisconnected
}) => {
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'reconnecting'>('connected');
  const [showDisconnectionWarning, setShowDisconnectionWarning] = useState(false);
  const [disconnectedPlayer, setDisconnectedPlayer] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(30);
  
  const presenceChannelRef = useRef<any>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const disconnectionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const cleanup = useCallback(() => {
    if (presenceChannelRef.current) {
      supabase.removeChannel(presenceChannelRef.current);
      presenceChannelRef.current = null;
    }
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
    if (disconnectionTimerRef.current) {
      clearTimeout(disconnectionTimerRef.current);
      disconnectionTimerRef.current = null;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);

  const startDisconnectionTimer = useCallback((playerId: string) => {
    setShowDisconnectionWarning(true);
    setDisconnectedPlayer(playerId);
    setCountdown(30);

    countdownIntervalRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
            countdownIntervalRef.current = null;
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    disconnectionTimerRef.current = setTimeout(() => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
      setShowDisconnectionWarning(false);
      onPlayerDisconnected(playerId);
    }, 30000);
  }, [onPlayerDisconnected]);

  const setupPresenceTracking = useCallback(() => {
    if (!currentUser || gameStatus !== 'active') return;

    cleanup();

    console.log('Setting up presence tracking for game:', gameId, 'user:', currentUser);

    const channel = supabase
      .channel(`presence-${gameId}`, {
        config: {
          presence: {
            key: currentUser
          }
        }
      })
      .on('presence', { event: 'sync' }, () => {
        console.log('Presence sync - connection restored');
        setConnectionStatus('connected');
        setShowDisconnectionWarning(false);
        
        if (disconnectionTimerRef.current) {
          clearTimeout(disconnectionTimerRef.current);
          disconnectionTimerRef.current = null;
        }
        if (countdownIntervalRef.current) {
          clearInterval(countdownIntervalRef.current);
          countdownIntervalRef.current = null;
        }
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        console.log('Player joined presence:', newPresences);
        setConnectionStatus('connected');
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        try {
          console.log('Player left presence:', leftPresences);
          const leftUser = leftPresences[0];
          if (leftUser && 
              (leftUser.user_id === whitePlayerId || leftUser.user_id === blackPlayerId) &&
              leftUser.user_id !== currentUser) {
            console.log('Starting disconnection timer for player:', leftUser.user_id);
            startDisconnectionTimer(leftUser.user_id);
          }
        } catch (error) {
          console.error('Error handling presence leave:', error);
        }
      })
      .subscribe(async (status) => {
        console.log('Presence channel status:', status);
        
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to presence channel');
          await channel.track({
            user_id: currentUser,
            online_at: new Date().toISOString(),
            game_id: gameId
          });
          setConnectionStatus('connected');
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
          console.log('Presence channel error, attempting reconnection...');
          setConnectionStatus('reconnecting');
          
          // Exponential backoff retry with better error handling
          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
          }
          
          reconnectTimeoutRef.current = setTimeout(() => {
            if (navigator.onLine && currentUser && gameStatus === 'active') {
              console.log('Retrying presence connection...');
              setupPresenceTracking();
            }
          }, Math.min(5000, 1000 * Math.pow(2, 1))); // Start with 2s, max 5s
        }
      });

    presenceChannelRef.current = channel;

    // Heartbeat with better error handling
    heartbeatIntervalRef.current = setInterval(async () => {
      if (channel && navigator.onLine) {
        try {
          await channel.track({
            user_id: currentUser,
            online_at: new Date().toISOString(),
            game_id: gameId,
            heartbeat: Date.now()
          });
          console.log('Heartbeat sent successfully');
        } catch (error) {
          console.error('Heartbeat error:', error);
          setConnectionStatus('reconnecting');
        }
      }
    }, 20000); // Every 20 seconds
  }, [gameId, currentUser, gameStatus, whitePlayerId, blackPlayerId, startDisconnectionTimer, cleanup]);

  useEffect(() => {
    const handleOnline = () => {
      console.log('Network came back online');
      setConnectionStatus('connected');
      setupPresenceTracking();
    };

    const handleOffline = () => {
      console.log('Network went offline');
      setConnectionStatus('disconnected');
      cleanup();
    };

    // Network status listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial setup
    if (navigator.onLine && currentUser && gameStatus === 'active') {
      setupPresenceTracking();
    } else if (!navigator.onLine) {
      setConnectionStatus('disconnected');
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      cleanup();
    };
  }, [setupPresenceTracking, cleanup, currentUser, gameStatus]);

  return (
    <>
      {/* Connection Status Indicator */}
      <div className="flex items-center gap-1 text-xs">
        {connectionStatus === 'connected' ? (
          <>
            <Wifi className="h-3 w-3 text-green-400" />
            <span className="text-green-400 hidden sm:inline">Connected</span>
          </>
        ) : connectionStatus === 'disconnected' ? (
          <>
            <WifiOff className="h-3 w-3 text-red-400" />
            <span className="text-red-400 hidden sm:inline">Offline</span>
          </>
        ) : (
          <>
            <Wifi className="h-3 w-3 text-yellow-400 animate-pulse" />
            <span className="text-yellow-400 hidden sm:inline">Connecting...</span>
          </>
        )}
      </div>

      {/* Disconnection Warning Dialog */}
      <Dialog open={showDisconnectionWarning} onOpenChange={() => {}}>
        <DialogContent className="text-center w-[90vw] max-w-xs mx-auto bg-gradient-to-br from-orange-900 to-red-900 border-2 border-orange-400 rounded-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-center gap-2 text-lg sm:text-xl text-white font-bold">
              <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-orange-400" />
              Player Left!
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="text-orange-200 font-medium text-sm">
              Opponent disconnected.
              <br />
              <span className="text-xl sm:text-2xl font-bold text-orange-400">
                {countdown}
              </span>
              <br />
              seconds until you win...
            </div>
            <div className="w-full bg-orange-800 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-orange-400 to-red-500 h-2 rounded-full transition-all duration-1000"
                style={{ width: `${(countdown / 30) * 100}%` }}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
