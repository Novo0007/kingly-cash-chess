import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ConnectionStatus } from "./ConnectionStatus";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { WifiOff, Settings } from "lucide-react";

export const ConnectionDebugOverlay = () => {
  const [showConnectionIssues, setShowConnectionIssues] = useState(false);
  const [lastConnectionError, setLastConnectionError] = useState<Date | null>(
    null,
  );

  useEffect(() => {
    // Listen for connection errors
    const handleConnectionError = () => {
      setLastConnectionError(new Date());
      setShowConnectionIssues(true);
    };

    // Test initial connection
    const testConnection = async () => {
      try {
        await Promise.race([
          supabase.auth.getSession(),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Timeout")), 5000),
          ),
        ]);
      } catch (error) {
        console.error("Initial connection test failed:", error);
        handleConnectionError();
      }
    };

    testConnection();

    // Set up error listeners
    window.addEventListener("unhandledrejection", (event) => {
      if (
        event.reason?.message?.includes("Failed to fetch") ||
        event.reason?.message?.includes("supabase")
      ) {
        handleConnectionError();
      }
    });

    // Auto-hide after 30 seconds
    let hideTimer: NodeJS.Timeout;
    if (showConnectionIssues) {
      hideTimer = setTimeout(() => {
        setShowConnectionIssues(false);
      }, 30000);
    }

    return () => {
      if (hideTimer) clearTimeout(hideTimer);
    };
  }, [showConnectionIssues]);

  if (!showConnectionIssues && !lastConnectionError) {
    return null;
  }

  return (
    <>
      {/* Floating connection status indicator */}
      {showConnectionIssues && (
        <div className="fixed top-4 right-4 z-50">
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="destructive"
                size="sm"
                className="shadow-lg animate-pulse"
              >
                <WifiOff className="h-4 w-4 mr-2" />
                Connection Issues
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Connection Diagnostics
                </DialogTitle>
              </DialogHeader>
              <ConnectionStatus />
              <div className="flex justify-between items-center mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowConnectionIssues(false)}
                >
                  Dismiss
                </Button>
                <Button size="sm" onClick={() => window.location.reload()}>
                  Refresh Page
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {/* Bottom status bar for persistent issues */}
      {lastConnectionError && !showConnectionIssues && (
        <div className="fixed bottom-20 left-0 right-0 z-40 mx-4">
          <div className="bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-600 rounded-lg p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <WifiOff className="h-4 w-4 text-red-600" />
              <span className="text-sm text-red-800 dark:text-red-200">
                Connection unstable - some features may be limited
              </span>
              <Badge variant="outline" className="text-xs">
                {lastConnectionError.toLocaleTimeString()}
              </Badge>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowConnectionIssues(true)}
            >
              Debug
            </Button>
          </div>
        </div>
      )}
    </>
  );
};
