import { supabase } from "@/integrations/supabase/client";

export const testSupabaseConnection = async () => {
  console.log("🔍 Testing Supabase connection...");

  try {
    // Test 1: Check if Supabase client is initialized
    console.log("✓ Supabase client initialized");
    console.log("📍 URL:", supabase.supabaseUrl);
    console.log("🔑 Key exists:", !!supabase.supabaseKey);

    // Test 2: Simple ping test
    const startTime = Date.now();
    const { data, error } = await supabase
      .from("profiles")
      .select("count")
      .limit(1);
    const responseTime = Date.now() - startTime;

    if (error) {
      console.error("❌ Supabase connection failed:", {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });
      return {
        connected: false,
        error: error.message || "Unknown Supabase error",
        responseTime: null,
      };
    }

    console.log(`✅ Supabase connection successful (${responseTime}ms)`);
    return {
      connected: true,
      error: null,
      responseTime,
    };
  } catch (error) {
    console.error(
      "💥 Connection test failed:",
      error instanceof Error ? error.message : String(error),
    );
    return {
      connected: false,
      error: error instanceof Error ? error.message : String(error),
      responseTime: null,
    };
  }
};

export const checkNetworkConnectivity = async () => {
  console.log("🌐 Testing network connectivity...");

  try {
    // Test basic internet connectivity
    const response = await fetch("https://httpbin.org/get", {
      method: "GET",
      mode: "cors",
    });

    if (response.ok) {
      console.log("✅ Internet connectivity working");
      return { connected: true, error: null };
    } else {
      console.log("❌ Internet connectivity issues");
      return { connected: false, error: `HTTP ${response.status}` };
    }
  } catch (error) {
    console.error(
      "💥 Network test failed:",
      error instanceof Error ? error.message : String(error),
    );
    return {
      connected: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
};

export const runFullDiagnostic = async () => {
  console.log("🏥 Running full connection diagnostic...");

  const results = {
    browserOnline: navigator.onLine,
    networkTest: await checkNetworkConnectivity(),
    supabaseTest: await testSupabaseConnection(),
    timestamp: new Date().toISOString(),
  };

  console.log("📊 Diagnostic Results:", results);
  return results;
};
