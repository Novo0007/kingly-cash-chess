import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

const SUPABASE_URL = "https://uznjfbqnivhfrotrtzzf.supabase.co";
const SUPABASE_PUBLISHABLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6bmpmYnFuaXZoZnJvdHJ0enpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0MDI4OTIsImV4cCI6MjA2NTk3ODg5Mn0.9o2iKujeSRexB434l_F7kO2eAvWhagx_xcm2ruQkc7s";

// Enhanced client with custom options for better reliability
export const enhancedSupabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: "pkce",
      // Add retry logic for auth operations
      retry: {
        retries: 3,
        delay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
      },
    },
    db: {
      schema: "public",
    },
    global: {
      // Add custom headers for better debugging
      headers: {
        "X-Client-Info": "supabase-js-web",
        "X-Client-Version": "2.0.0",
      },
      // Add fetch options for better network handling
      fetch: (url, options = {}) => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

        return fetch(url, {
          ...options,
          signal: controller.signal,
        }).finally(() => {
          clearTimeout(timeoutId);
        });
      },
    },
    realtime: {
      // Disable realtime for now to reduce connection issues
      params: {
        eventsPerSecond: 10,
      },
      heartbeatIntervalMs: 30000,
      reconnectAfterMs: (tries) => Math.min(tries * 1000, 10000),
    },
  },
);

// Create a wrapper for common operations with automatic retry
export const withRetry = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
): Promise<T> => {
  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Don't retry on auth errors or client errors
      if (
        lastError.message.includes("Invalid login") ||
        lastError.message.includes("User not found") ||
        lastError.message.includes("Email not confirmed")
      ) {
        throw lastError;
      }

      if (attempt < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, attempt), 5000);
        console.log(
          `Retrying operation in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`,
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError!;
};

// Enhanced auth methods with retry logic
export const enhancedAuth = {
  signIn: (email: string, password: string) =>
    withRetry(() =>
      enhancedSupabase.auth.signInWithPassword({ email, password }),
    ),

  signUp: (email: string, password: string, options?: any) =>
    withRetry(() => enhancedSupabase.auth.signUp({ email, password, options })),

  getSession: () => withRetry(() => enhancedSupabase.auth.getSession()),

  signOut: () => withRetry(() => enhancedSupabase.auth.signOut()),
};

// Test connection function
export const testConnection = async (): Promise<{
  success: boolean;
  error?: string;
}> => {
  try {
    const { error } = await enhancedAuth.getSession();
    if (error && !error.message.includes("session")) {
      throw error;
    }
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
};
