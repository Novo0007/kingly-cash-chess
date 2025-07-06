import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { MazeRules } from "@/components/games/maze/MazeRules";
import { MobileOptimized } from "@/components/layout/MobileOptimized";

const MazeRulesPage = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate("/");
  };

  const handleStartGame = () => {
    navigate("/");
  };

  return (
    <MobileOptimized className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <Button
            onClick={handleBack}
            variant="outline"
            className="flex items-center gap-2 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Games
          </Button>
        </div>

        <MazeRules onStartGame={handleStartGame} onBack={handleBack} />
      </div>
    </MobileOptimized>
  );
};

export default MazeRulesPage;
