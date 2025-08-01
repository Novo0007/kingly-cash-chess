import { supabase } from "@/integrations/supabase/client";

export async function checkFourPicsDatabase(): Promise<{
  isSetup: boolean;
  error?: string;
  tables: {
    fourpics_levels: boolean;
    fourpics_progress: boolean;
    fourpics_scores: boolean;
    fourpics_coin_transactions: boolean;
  };
  functions: {
    get_fourpics_progress: boolean;
    complete_fourpics_level: boolean;
    use_fourpics_hint: boolean;
  };
}> {
  const result: {
    isSetup: boolean;
    error?: string;
    tables: {
      fourpics_levels: boolean;
      fourpics_progress: boolean;
      fourpics_scores: boolean;
      fourpics_coin_transactions: boolean;
    };
    functions: {
      get_fourpics_progress: boolean;
      complete_fourpics_level: boolean;
      use_fourpics_hint: boolean;
    };
  } = {
    isSetup: false,
    tables: {
      fourpics_levels: false,
      fourpics_progress: false,
      fourpics_scores: false,
      fourpics_coin_transactions: false,
    },
    functions: {
      get_fourpics_progress: false,
      complete_fourpics_level: false,
      use_fourpics_hint: false,
    },
  };

  try {
    // Check if fourpics_levels table exists
    const { error: levelsError } = await supabase
      .from("fourpics_levels")
      .select("id")
      .limit(1);

    result.tables.fourpics_levels = !levelsError;

    // Check if fourpics_progress table exists
    const { error: progressError } = await supabase
      .from("fourpics_progress")
      .select("id")
      .limit(1);

    result.tables.fourpics_progress = !progressError;

    // Check if fourpics_scores table exists
    const { error: scoresError } = await supabase
      .from("fourpics_scores")
      .select("id")
      .limit(1);

    result.tables.fourpics_scores = !scoresError;

    // Check if fourpics_coin_transactions table exists
    const { error: transactionsError } = await supabase
      .from("fourpics_coin_transactions")
      .select("id")
      .limit(1);

    result.tables.fourpics_coin_transactions = !transactionsError;

    // Check if function exists by trying to call it
    try {
      await supabase.rpc("get_fourpics_progress", {
        user_id_param: "test",
      });
      result.functions.get_fourpics_progress = true;
    } catch {
      result.functions.get_fourpics_progress = false;
    }

    // Determine if setup is complete
    const allTablesExist = Object.values(result.tables).every(
      (exists) => exists,
    );
    const criticalFunctionExists = result.functions.get_fourpics_progress;

    result.isSetup = allTablesExist && criticalFunctionExists;

    if (!result.isSetup) {
      const missingTables = Object.entries(result.tables)
        .filter(([, exists]) => !exists)
        .map(([name]) => name);

      const missingFunctions = Object.entries(result.functions)
        .filter(([, exists]) => !exists)
        .map(([name]) => name);

      result.error = `Missing database components. Tables: [${missingTables.join(", ")}], Functions: [${missingFunctions.join(", ")}]. Please run the migration: supabase/migrations/20250130000000_create_fourpics_system.sql`;
    }
  } catch (error) {
    result.error = `Database check failed: ${error instanceof Error ? error.message : String(error)}`;
  }

  return result;
}
