import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { HangmanRules } from "@/components/games/hangman/HangmanRules";

export const HangmanRulesPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <div className="mb-6">
          <Button
            onClick={() => navigate("/")}
            variant="outline"
            className="flex items-center gap-2 hover:bg-slate-100"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Games
          </Button>
        </div>

        {/* Hangman Rules Component */}
        <HangmanRules />
      </div>
    </div>
  );
};

export default HangmanRulesPage;
