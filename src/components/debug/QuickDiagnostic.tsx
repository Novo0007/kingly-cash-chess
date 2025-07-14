import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import {
  testSupabaseConnection,
  testAuthConnection,
} from "@/utils/connectionTest";
import { testWalletConnection } from "@/utils/walletSubscription";

export const QuickDiagnostic = () => {
  const [testing, setTesting] = useState(false);
  const [lastTest, setLastTest] = useState<{
    timestamp: Date;
    results: {
      supabase: boolean;
      auth: boolean;
      wallet: boolean;
    };
  } | null>(null);

  const runQuickTest = async () => {
    setTesting(true);
    toast.info("Running quick diagnostic...", { duration: 1000 });

    try {
      const [supabaseResult, authResult, walletResult] =
        await Promise.allSettled([
          testSupabaseConnection(),
          testAuthConnection(),
          testWalletConnection(),
        ]);

      const results = {
        supabase:
          supabaseResult.status === "fulfilled" && supabaseResult.value.success,
        auth: authResult.status === "fulfilled" && authResult.value.success,
        wallet:
          walletResult.status === "fulfilled" && walletResult.value.success,
      };

      setLastTest({
        timestamp: new Date(),
        results,
      });

      const passedTests = Object.values(results).filter(Boolean).length;
      const totalTests = Object.keys(results).length;

      if (passedTests === totalTests) {
        toast.success(`✅ All ${totalTests} tests passed!`);
      } else {
        toast.warning(`⚠️ ${passedTests}/${totalTests} tests passed`);
      }
    } catch (error) {
      console.error("Quick diagnostic error:", error);
      toast.error("Diagnostic failed to run");
    } finally {
      setTesting(false);
    }
  };

  const getStatusIcon = (status: boolean) => {
    return status ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500" />
    );
  };

  const getStatusBadge = (status: boolean) => {
    return status ? (
      <Badge className="bg-green-500/20 text-green-700 border-green-500/30">
        OK
      </Badge>
    ) : (
      <Badge variant="destructive">FAIL</Badge>
    );
  };

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          Connection Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {lastTest && (
          <div className="space-y-2">
            <div className="text-xs text-muted-foreground">
              Last check: {lastTest.timestamp.toLocaleTimeString()}
            </div>

            {Object.entries(lastTest.results).map(([test, passed]) => (
              <div key={test} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon(passed)}
                  <span className="text-sm capitalize">{test}</span>
                </div>
                {getStatusBadge(passed)}
              </div>
            ))}
          </div>
        )}

        <Button
          onClick={runQuickTest}
          disabled={testing}
          className="w-full"
          size="sm"
          variant="outline"
        >
          {testing ? (
            <>
              <RefreshCw className="h-3 w-3 mr-2 animate-spin" />
              Testing...
            </>
          ) : (
            <>
              <RefreshCw className="h-3 w-3 mr-2" />
              Quick Test
            </>
          )}
        </Button>

        {lastTest && !Object.values(lastTest.results).every(Boolean) && (
          <div className="text-xs text-muted-foreground p-2 bg-orange-50 dark:bg-orange-900/20 rounded border-l-2 border-orange-500">
            <strong>Issues detected:</strong> Try refreshing the page or check
            your internet connection.
          </div>
        )}
      </CardContent>
    </Card>
  );
};
