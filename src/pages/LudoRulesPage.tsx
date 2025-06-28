import { LudoRules } from "@/components/games/ludo/LudoRules";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const LudoRulesPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-gradient-to-br from-blue-900/20 via-transparent to-purple-900/20"></div>

      {/* Floating Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-20 left-20 w-3 h-3 bg-gradient-to-br from-blue-300 to-cyan-300 rounded-full opacity-40 animate-pulse"
          style={{ animationDelay: "0s", animationDuration: "4s" }}
        ></div>
        <div
          className="absolute top-40 right-40 w-2 h-2 bg-gradient-to-br from-purple-300 to-pink-300 rounded-full opacity-50 animate-pulse"
          style={{ animationDelay: "1s", animationDuration: "5s" }}
        ></div>
        <div
          className="absolute bottom-40 left-40 w-4 h-4 bg-gradient-to-br from-cyan-200 to-blue-200 rounded-full opacity-30 animate-pulse"
          style={{ animationDelay: "2s", animationDuration: "3.5s" }}
        ></div>
      </div>

      {/* Header with Back Button */}
      <div className="relative z-30 p-4">
        <Button
          onClick={() => navigate(-1)}
          variant="ghost"
          className="text-white hover:bg-blue-800/50 font-bold border-2 border-blue-400 hover:border-purple-400"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>

      {/* Main Content */}
      <main className="relative z-20 max-w-6xl mx-auto px-4 py-4">
        <div className="relative">
          {/* Content Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 via-transparent to-purple-900/10 rounded-3xl backdrop-blur-sm"></div>

          {/* Content */}
          <div className="relative z-10 p-4">
            <LudoRules />
          </div>
        </div>
      </main>
    </div>
  );
};
