import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Game2048Rules } from "@/components/games/game2048/Game2048Rules";
import { MobileContainer } from "@/components/layout/MobileContainer";

export const Game2048RulesPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <MobileContainer maxWidth="4xl" className="py-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            onClick={() => navigate("/")}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Games
          </Button>
        </div>

        {/* Rules Content */}
        <Game2048Rules />
      </div>
    </MobileContainer>
  );
};

export default Game2048RulesPage;
