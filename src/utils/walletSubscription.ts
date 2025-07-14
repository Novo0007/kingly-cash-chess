import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

interface WalletSubscriptionOptions {
  onWalletUpdate?: (wallet: Tables<"wallets">) => void;
  onTransactionInsert?: (transaction: Tables<"transactions">) => void;
  onTransactionUpdate?: () => void;
  onError?: (error: string) => void;
}

export const createWalletSubscription = (
  options: WalletSubscriptionOptions,
) => {
  console.log("Creating wallet subscription with enhanced error handling...");

  const walletChannel = supabase
    .channel("wallet_updates_safe")
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "wallets",
      },
      (payload) => {
        try {
          console.log("Safe wallet update received:", payload);
          if (payload.new && options.onWalletUpdate) {
            options.onWalletUpdate(payload.new as Tables<"wallets">);
          }
        } catch (error) {
          console.error("Error processing wallet update:", error);
          options.onError?.("Failed to process wallet update");
        }
      },
    )
    .subscribe((status) => {
      console.log("Safe wallet channel status:", status);
      switch (status) {
        case "SUBSCRIBED":
          console.log("✅ Wallet subscription active");
          break;
        case "CHANNEL_ERROR":
        case "TIMED_OUT":
        case "CLOSED":
          console.warn("⚠️ Wallet subscription failed:", status);
          options.onError?.(`Wallet subscription failed: ${status}`);
          break;
      }
    });

  const transactionChannel = supabase
    .channel("transaction_updates_safe")
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "transactions",
      },
      (payload) => {
        try {
          console.log("Safe transaction insert received:", payload);
          if (payload.new && options.onTransactionInsert) {
            options.onTransactionInsert(payload.new as Tables<"transactions">);
          }
        } catch (error) {
          console.error("Error processing transaction insert:", error);
          options.onError?.("Failed to process transaction insert");
        }
      },
    )
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "transactions",
      },
      (payload) => {
        try {
          console.log("Safe transaction update received:", payload);
          if (options.onTransactionUpdate) {
            options.onTransactionUpdate();
          }
        } catch (error) {
          console.error("Error processing transaction update:", error);
          options.onError?.("Failed to process transaction update");
        }
      },
    )
    .subscribe((status) => {
      console.log("Safe transaction channel status:", status);
      switch (status) {
        case "SUBSCRIBED":
          console.log("✅ Transaction subscription active");
          break;
        case "CHANNEL_ERROR":
        case "TIMED_OUT":
        case "CLOSED":
          console.warn("⚠️ Transaction subscription failed:", status);
          options.onError?.(`Transaction subscription failed: ${status}`);
          break;
      }
    });

  // Return cleanup function
  return () => {
    console.log("Cleaning up safe wallet subscriptions...");
    try {
      supabase.removeChannel(walletChannel);
      supabase.removeChannel(transactionChannel);
    } catch (error) {
      console.error("Error cleaning up subscriptions:", error);
    }
  };
};

export const testWalletConnection = async () => {
  try {
    // Test basic wallet query
    const { data, error } = await supabase
      .from("wallets")
      .select("count")
      .limit(1);

    if (error) {
      throw error;
    }

    return { success: true, message: "Wallet connection OK" };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown wallet error",
    };
  }
};
