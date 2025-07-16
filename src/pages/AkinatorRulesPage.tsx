import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { MobileContainer } from "@/components/layout/MobileContainer";
import { AkinatorRules } from "@/components/games/akinator/AkinatorRules";

export const AkinatorRulesPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <MobileContainer>
      <div className="space-y-6">
        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Games
          </Button>
        </div>

        {/* Rules Content */}
        <AkinatorRules />
      </div>
    </MobileContainer>
  );
};

export default AkinatorRulesPage;
