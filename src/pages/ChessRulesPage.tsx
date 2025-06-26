import { ChessRules } from "@/components/chess/ChessRules";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const ChessRulesPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative overflow-hidden lavender-bg">
      {/* Elegant Lavender Background */}
      <div className="fixed inset-0 lavender-gradient">
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-purple-100/10"></div>
      </div>

      {/* Subtle Pattern Overlay */}
      <div className="fixed inset-0 opacity-10">
        <div
          className="h-full w-full"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 20%, hsl(250, 70%, 80%) 0%, transparent 30%),
                             radial-gradient(circle at 80% 80%, hsl(270, 80%, 85%) 0%, transparent 30%),
                             radial-gradient(circle at 50% 50%, hsl(260, 75%, 82%) 0%, transparent 25%)`,
          }}
        ></div>
      </div>

      {/* Elegant Floating Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-20 left-20 w-3 h-3 bg-gradient-to-br from-purple-300 to-indigo-300 rounded-full lavender-float opacity-40"
          style={{ animationDelay: "0s", animationDuration: "4s" }}
        ></div>
        <div
          className="absolute top-40 right-40 w-2 h-2 bg-gradient-to-br from-lavender-300 to-purple-300 rounded-full lavender-float opacity-50"
          style={{ animationDelay: "1s", animationDuration: "5s" }}
        ></div>
        <div
          className="absolute bottom-40 left-40 w-4 h-4 bg-gradient-to-br from-indigo-200 to-purple-200 rounded-full lavender-float opacity-30"
          style={{ animationDelay: "2s", animationDuration: "3.5s" }}
        ></div>
        <div
          className="absolute bottom-20 right-20 w-2 h-2 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full lavender-float opacity-60"
          style={{ animationDelay: "1.5s", animationDuration: "4.5s" }}
        ></div>
      </div>

      {/* Navigation Bar */}
      <div className="relative z-30 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <Button
              onClick={() => navigate(-1)}
              variant="ghost"
              className="flex items-center gap-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <Button
              onClick={() => navigate("/")}
              variant="ghost"
              className="flex items-center gap-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50"
            >
              <Home className="h-4 w-4" />
              Home
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="relative z-20 max-w-7xl mx-auto px-4 pb-8">
        <div className="relative">
          {/* Content Background with Lavender Glass Effect */}
          <div className="absolute inset-0 lavender-glass rounded-2xl sm:rounded-3xl lavender-shadow"></div>

          {/* Content */}
          <div className="relative z-10 p-4">
            <ChessRules />
          </div>
        </div>
      </main>
    </div>
  );
};
