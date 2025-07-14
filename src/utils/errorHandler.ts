import { toast } from "sonner";

export const handleSupabaseError = (
  error: any,
  context: string = "operation",
) => {
  console.error(`Supabase ${context} error:`, error);

  // Check for network-related errors
  if (
    error?.message?.includes("Failed to fetch") ||
    error?.message?.includes("NetworkError") ||
    error?.message?.includes("fetch")
  ) {
    toast.error(
      "Unable to connect to server. Please check your internet connection and try again.",
      {
        duration: 5000,
      },
    );
    return;
  }

  // Check for timeout errors
  if (error?.message?.includes("timeout") || error?.code === "TIMEOUT") {
    toast.error("Request timeout. Please try again.", {
      duration: 4000,
    });
    return;
  }

  // Check for CORS errors
  if (
    error?.message?.includes("CORS") ||
    error?.message?.includes("Access-Control")
  ) {
    toast.error(
      "Connection blocked. Please contact support if this persists.",
      {
        duration: 5000,
      },
    );
    return;
  }

  // Default error handling
  const message = error?.message || "An unexpected error occurred";
  toast.error(message, {
    duration: 4000,
  });
};

// Add a global error handler for uncaught promise rejections
if (typeof window !== "undefined") {
  window.addEventListener("unhandledrejection", (event) => {
    console.error("Unhandled promise rejection:", event.reason);

    // Check if it's a Supabase-related error
    if (
      event.reason?.message?.includes("supabase") ||
      event.reason?.message?.includes("Failed to fetch")
    ) {
      handleSupabaseError(event.reason, "connection");
      event.preventDefault(); // Prevent the error from propagating
    }
  });
}

export const withErrorHandling = async <T>(
  operation: () => Promise<T>,
  context: string = "operation",
): Promise<T | null> => {
  try {
    return await operation();
  } catch (error) {
    handleSupabaseError(error, context);
    return null;
  }
};
