import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Wifi,
  WifiOff,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

interface ConnectionTest {
  name: string;
  status: "pending" | "success" | "error" | "warning";
  message: string;
  details?: string;
}

export const ConnectionStatus = () => {
  const [tests, setTests] = useState<ConnectionTest[]>([]);
  const [testing, setTesting] = useState(false);

  const runConnectionTests = async () => {
    setTesting(true);
    const newTests: ConnectionTest[] = [];

    // Test 1: Basic connectivity
    try {
      const response = await fetch("https://httpbin.org/status/200", {
        method: "HEAD",
        mode: "no-cors",
      });
      newTests.push({
        name: "Internet Connection",
        status: "success",
        message: "Connected to internet",
      });
    } catch {
      newTests.push({
        name: "Internet Connection",
        status: "error",
        message: "No internet connection detected",
      });
    }

    // Test 2: Supabase URL accessibility
    try {
      const supabaseUrl = supabase.supabaseUrl;
      const response = await fetch(`${supabaseUrl}/health`, {
        method: "HEAD",
        signal: AbortSignal.timeout(5000),
      });

      if (response.ok) {
        newTests.push({
          name: "Supabase Server",
          status: "success",
          message: "Supabase server is reachable",
        });
      } else {
        newTests.push({
          name: "Supabase Server",
          status: "warning",
          message: `Server responded with status: ${response.status}`,
          details: "Server may be experiencing issues",
        });
      }
    } catch (error: any) {
      newTests.push({
        name: "Supabase Server",
        status: "error",
        message: "Cannot reach Supabase server",
        details: error.message || "Network error",
      });
    }

    // Test 3: Auth service
    try {
      const { data, error } = (await Promise.race([
        supabase.auth.getSession(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Timeout")), 8000),
        ),
      ])) as any;

      if (error && !error.message.includes("session")) {
        throw error;
      }

      newTests.push({
        name: "Authentication Service",
        status: "success",
        message: "Auth service is working",
        details: data?.session ? "User session found" : "No active session",
      });
    } catch (error: any) {
      newTests.push({
        name: "Authentication Service",
        status: "error",
        message: "Auth service unavailable",
        details: error.message || "Connection failed",
      });
    }

    // Test 4: Database connection
    try {
      const { data, error } = (await Promise.race([
        supabase.from("profiles").select("count").limit(1),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Timeout")), 8000),
        ),
      ])) as any;

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      newTests.push({
        name: "Database Connection",
        status: "success",
        message: "Database is accessible",
      });
    } catch (error: any) {
      newTests.push({
        name: "Database Connection",
        status: "error",
        message: "Database unavailable",
        details: error.message || "Connection failed",
      });
    }

    setTests(newTests);
    setTesting(false);

    // Show summary
    const failedTests = newTests.filter((t) => t.status === "error").length;
    if (failedTests === 0) {
      toast.success("All connection tests passed!");
    } else {
      toast.error(`${failedTests} connection test(s) failed`);
    }
  };

  useEffect(() => {
    runConnectionTests();
  }, []);

  const getStatusIcon = (status: ConnectionTest["status"]) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "warning":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <RefreshCw className="h-4 w-4 text-gray-400 animate-spin" />;
    }
  };

  const getStatusBadge = (status: ConnectionTest["status"]) => {
    switch (status) {
      case "success":
        return (
          <Badge variant="default" className="bg-green-500">
            OK
          </Badge>
        );
      case "error":
        return <Badge variant="destructive">FAIL</Badge>;
      case "warning":
        return (
          <Badge variant="secondary" className="bg-yellow-500 text-white">
            WARN
          </Badge>
        );
      default:
        return <Badge variant="outline">TESTING</Badge>;
    }
  };

  const overallStatus = tests.some((t) => t.status === "error")
    ? "error"
    : tests.some((t) => t.status === "warning")
      ? "warning"
      : "success";

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          {overallStatus === "error" ? (
            <WifiOff className="h-5 w-5 text-red-500" />
          ) : (
            <Wifi className="h-5 w-5 text-green-500" />
          )}
          Connection Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {tests.map((test, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
          >
            <div className="flex items-center gap-2">
              {getStatusIcon(test.status)}
              <div>
                <div className="font-medium text-sm">{test.name}</div>
                <div className="text-xs text-muted-foreground">
                  {test.message}
                </div>
                {test.details && (
                  <div className="text-xs text-muted-foreground mt-1 opacity-75">
                    {test.details}
                  </div>
                )}
              </div>
            </div>
            {getStatusBadge(test.status)}
          </div>
        ))}

        <Button
          onClick={runConnectionTests}
          disabled={testing}
          className="w-full mt-4"
          variant="outline"
        >
          {testing ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Testing...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Run Tests Again
            </>
          )}
        </Button>

        {overallStatus === "error" && (
          <div className="text-sm text-muted-foreground text-center mt-3 p-2 bg-red-50 dark:bg-red-900/20 rounded">
            <strong>Connection Issues Detected</strong>
            <br />
            Try refreshing the page or check your internet connection.
          </div>
        )}
      </CardContent>
    </Card>
  );
};
