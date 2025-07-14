import React from "react";
import { useNavigate } from "react-router-dom";
import { FourPicsRules } from "@/components/games/fourpics/FourPicsRules";

const FourPicsRulesPage: React.FC = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate("/");
  };

  return <FourPicsRules onBack={handleBack} />;
};

export default FourPicsRulesPage;
