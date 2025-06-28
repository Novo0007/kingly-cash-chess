import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const LudoTableChecker = () => {
  const [tableExists, setTableExists] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkLudoTable();
  }, []);

  const checkLudoTable = async () => {
    try {
      // Try to query the ludo_games table
      const { data, error } = await supabase
        .from("ludo_games")
        .select("count", { count: "exact", head: true });

      if (error) {
        console.error("Ludo table check error:", error);
        if (
          error.code === "42P01" ||
          error.message?.includes("does not exist")
        ) {
          setTableExists(false);
          setError("Table 'ludo_games' does not exist");
        } else {
          setError(error.message);
        }
      } else {
        setTableExists(true);
        toast.success("Ludo tables are available!");
      }
    } catch (err) {
      console.error("Error checking ludo table:", err);
      setError(err.message);
    }
  };

  if (tableExists === null) {
    return <div className="text-white">Checking Ludo tables...</div>;
  }

  return (
    <div className="p-4 bg-gray-800 rounded text-white">
      <h3 className="font-bold mb-2">Ludo Table Status</h3>
      {tableExists ? (
        <div className="text-green-400">
          ✅ Ludo tables exist and are accessible
        </div>
      ) : (
        <div className="text-red-400">
          ❌ Ludo tables not found
          <br />
          <small>Error: {error}</small>
          <br />
          <small>The database migration may need to be applied.</small>
        </div>
      )}
    </div>
  );
};
