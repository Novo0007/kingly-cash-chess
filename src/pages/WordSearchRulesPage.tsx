import React from "react";
import { useNavigate } from "react-router-dom";
import { WordSearchRules } from "@/components/games/wordsearch/WordSearchRules";
import { MobileOptimized } from "@/components/layout/MobileOptimized";

const WordSearchRulesPage: React.FC = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1); // Go back to previous page
  };

  return (
    <MobileOptimized className="min-h-screen bg-gray-50">
      <WordSearchRules onBack={handleBack} />
    </MobileOptimized>
  );
};

export default WordSearchRulesPage;
