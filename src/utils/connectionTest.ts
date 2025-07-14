import { supabase } from "@/integrations/supabase/client";

export const testSupabaseConnection = async () => {
  try {
    console.log("🔍 Testing Supabase connection...");

    // Test 1: Check if we can reach Supabase health endpoint
    const healthResponse = await fetch(supabase.supabaseUrl + "/health");
    console.log("Health endpoint status:", healthResponse.status);

    // Test 2: Try a simple query
    const { data, error } = await supabase
      .from("profiles")
      .select("count")
      .limit(1);

    if (error) {
      console.error("Supabase query error:", error);
      return { success: false, error: error.message };
    }

    console.log("✅ Supabase connection successful");
    return { success: true };
  } catch (error) {
    console.error("❌ Supabase connection failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
};

export const testAuthConnection = async () => {
  try {
    console.log("🔍 Testing Supabase Auth connection...");

    // Test auth session retrieval with timeout
    const sessionPromise = supabase.auth.getSession();
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Timeout after 10 seconds")), 10000),
    );

    const result = await Promise.race([sessionPromise, timeoutPromise]);

    console.log("✅ Auth connection successful");
    return { success: true, session: result };
  } catch (error) {
    console.error("❌ Auth connection failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
};
