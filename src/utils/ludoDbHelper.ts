import { supabase } from "@/integrations/supabase/client";

export const checkLudoTablesExist = async (): Promise<boolean> => {
  try {
    // Try a simple query to see if the table exists
    const { error } = await supabase
      .from("ludo_games")
      .select("count", { count: "exact", head: true });

    if (error) {
      console.error("Ludo tables check failed:", error);
      if (error.code === "42P01" || error.message?.includes("does not exist")) {
        return false;
      }
      // If it's another error, we can't be sure, so return true to let normal error handling work
      return true;
    }

    return true;
  } catch (err) {
    console.error("Error checking Ludo tables:", err);
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
