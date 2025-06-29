
import { supabase } from "@/integrations/supabase/client";

export const checkLudoTablesExist = async (): Promise<boolean> => {
  try {
    console.log("🔗 Testing Supabase connection...");
    // Test if Supabase is working with a simple query
    const { error: testError } = await supabase
      .from("profiles")
      .select("count", { count: "exact", head: true });

    if (testError) {
      console.error("❌ Supabase connection test failed:", testError);
      return false;
    }
    console.log("✅ Supabase connection working");

    console.log("🎯 Testing ludo_games table...");
    // Try a simple query to see if the table exists and is accessible
    const { error } = await supabase
      .from("ludo_games")
      .select("count", { count: "exact", head: true });

    if (error) {
      console.error("Ludo tables check failed:", error);
      return false;
    }

    console.log("✅ Ludo tables are accessible and working");
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
      console.warn("Ludo tables are not accessible or don't exist.");
      return false;
    }

    console.log("✅ Ludo tables are ready to use");
    return true;
  } catch (err) {
    console.error("Error in createLudoTablesIfNeeded:", err);
    return false;
  }
};
