import { supabase } from "@/integrations/supabase/client";

export const checkLudoTablesExist = async (): Promise<boolean> => {
  try {
    // Try a simple query to see if the table exists
    const { error } = await supabase
      .from("ludo_games")
      .select("count", { count: "exact", head: true });

    if (error) {
      console.error("Ludo tables check failed:");
      console.error("Error message:", error?.message || "Unknown error");
      console.error("Error code:", error?.code || "No code");
      console.error("Full error:", JSON.stringify(error, null, 2));

      if (error.code === "42P01" || error.message?.includes("does not exist")) {
        console.warn(
          "Table does not exist - this is expected if migration hasn't been run",
        );
        return false;
      }
      // If it's another error, we can't be sure, so return true to let normal error handling work
      return true;
    }

    return true;
  } catch (err) {
    console.error("Error checking Ludo tables:");
    console.error("Error message:", err?.message || "Unknown error");
    console.error("Error type:", typeof err);
    console.error("Full error:", JSON.stringify(err, null, 2));
    return false;
  }
};

export const createLudoTablesIfNeeded = async (): Promise<boolean> => {
  try {
    const tablesExist = await checkLudoTablesExist();

    if (!tablesExist) {
      console.warn(
        "Ludo tables do not exist. They need to be created through database migration.",
      );
      return false;
    }

    return true;
  } catch (err) {
    console.error("Error in createLudoTablesIfNeeded:", err);
    return false;
  }
};
