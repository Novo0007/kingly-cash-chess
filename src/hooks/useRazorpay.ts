import { useState, useCallback } from "react";
import { toast } from "sonner";

// Extend Window interface to include Razorpay
declare global {
  interface Window {
    Razorpay: any;
  }
}

interface RazorpayOptions {
  amount: number; // Amount in INR
  currency?: string;
  name?: string;
  description?: string;
  orderId?: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
}

interface PaymentResult {
  success: boolean;
  paymentId?: string;
  orderId?: string;
  signature?: string;
  error?: string;
}

export const useRazorpay = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load Razorpay script dynamically
  const loadRazorpayScript = useCallback((): Promise<boolean> => {
    return new Promise((resolve) => {
      // Check if already loaded
      if (window.Razorpay) {
        setIsInitialized(true);
        resolve(true);
        return;
      }

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => {
        setIsInitialized(true);
        resolve(true);
      };
      script.onerror = () => {
        console.error("Failed to load Razorpay script");
        resolve(false);
      };
      document.body.appendChild(script);
    });
  }, []);

  // Initialize payment
  const initiatePayment = useCallback(
    async (options: RazorpayOptions): Promise<PaymentResult> => {
      setIsLoading(true);

      try {
        // Load Razorpay script if not loaded
        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded) {
          throw new Error("Failed to load Razorpay");
        }

        // Create order (in real app, this would be done on backend)
        const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        const razorpayOptions = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_1234567890", // Use environment variable
          amount: options.amount * 100, // Razorpay expects amount in paise
          currency: options.currency || "INR",
          name: options.name || "Word Search Game",
          description: options.description || "Coin Purchase",
          order_id: orderId,
          prefill: {
            name: options.prefill?.name || "",
            email: options.prefill?.email || "",
            contact: options.prefill?.contact || "",
          },
          theme: {
            color: "#3B82F6", // Blue theme to match the app
          },
          modal: {
            ondismiss: () => {
              console.log("Payment modal dismissed by user");
            },
          },
          handler: (response: any) => {
            // Payment successful
            console.log("Payment successful:", response);
          },
        };

        return new Promise((resolve) => {
          const razorpay = new window.Razorpay({
            ...razorpayOptions,
            handler: (response: any) => {
              resolve({
                success: true,
                paymentId: response.razorpay_payment_id,
                orderId: response.razorpay_order_id,
                signature: response.razorpay_signature,
              });
            },
            modal: {
              ondismiss: () => {
                resolve({
                  success: false,
                  error: "Payment cancelled by user",
                });
              },
            },
          });

          razorpay.open();
        });
      } catch (error) {
        console.error("Payment initiation failed:", error);
        return {
          success: false,
          error: error instanceof Error ? error.message : "Payment failed",
        };
      } finally {
        setIsLoading(false);
      }
    },
    [loadRazorpayScript],
  );

  // Check if Razorpay is available (for fallback UI)
  const isRazorpayAvailable = useCallback(() => {
    return typeof window !== "undefined" && (window.Razorpay || isInitialized);
  }, [isInitialized]);

  return {
    initiatePayment,
    isLoading,
    isInitialized,
    isRazorpayAvailable,
    loadRazorpayScript,
  };
};

// Currency conversion utility (simplified for demo)
export const convertUSDToINR = (usdAmount: number): number => {
  // In a real app, you'd fetch live exchange rates
  const exchangeRate = 83; // Approximate USD to INR rate
  return Math.round(usdAmount * exchangeRate);
};

// INR formatting utility
export const formatINR = (amount: number): string => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};
