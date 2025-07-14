import { supabase } from "@/integrations/supabase/client";

export class SupabaseConnectionError extends Error {
  constructor(
    message: string,
    public readonly cause?: Error,
  ) {
    super(message);
    this.name = "SupabaseConnectionError";
  }
}

interface RetryOptions {
  maxRetries?: number;
  timeout?: number;
  baseDelay?: number;
}

export const withRetry = async <T>(
  operation: () => Promise<T>,
  options: RetryOptions = {},
): Promise<T> => {
  const { maxRetries = 3, timeout = 10000, baseDelay = 1000 } = options;
  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // Create timeout promise
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(
          () => reject(new Error(`Operation timeout after ${timeout}ms`)),
          timeout,
        ),
      );

      // Race the operation against timeout
      const result = await Promise.race([operation(), timeoutPromise]);

      console.log(`✅ Operation successful on attempt ${attempt + 1}`);
      return result;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.warn(`❌ Attempt ${attempt + 1} failed:`, lastError.message);

      if (attempt < maxRetries) {
        const delay = Math.min(baseDelay * Math.pow(2, attempt), 5000);
        console.log(`⏳ Retrying in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw new SupabaseConnectionError(
    `Operation failed after ${maxRetries + 1} attempts: ${lastError!.message}`,
    lastError!,
  );
};

export const safeGetSession = async () => {
  try {
    return await withRetry(() => supabase.auth.getSession(), {
      maxRetries: 2,
      timeout: 8000,
    });
  } catch (error) {
    console.error("Failed to get session:", error);

    // Return a safe fallback
    return {
      data: { session: null },
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
};

export const safeAuthOperation = async <T>(
  operation: () => Promise<T>,
  fallbackValue?: T,
): Promise<T | null> => {
  try {
    return await withRetry(operation, { maxRetries: 1, timeout: 5000 });
  } catch (error) {
    console.error("Auth operation failed:", error);
    return fallbackValue ?? null;
  }
};

export const isNetworkError = (error: any): boolean => {
  if (!error) return false;

  const errorMessage = error.message?.toLowerCase() || "";
  return (
    errorMessage.includes("failed to fetch") ||
    errorMessage.includes("network error") ||
    errorMessage.includes("timeout") ||
    errorMessage.includes("connection") ||
    error.name === "NetworkError" ||
    error.code === "NETWORK_ERROR"
  );
};

export const getErrorMessage = (error: any): string => {
  if (isNetworkError(error)) {
    return "Unable to connect to server. Please check your internet connection.";
  }

  if (error?.message?.includes("timeout")) {
    return "Request timeout. Please try again.";
  }

  return error?.message || "An unexpected error occurred.";
};
