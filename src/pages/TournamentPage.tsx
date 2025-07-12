import React from "react";
import { TournamentSection } from "@/components/games/tournaments/TournamentSection";
import { MobileContainer } from "@/components/layout/MobileContainer";

export const TournamentPage: React.FC = () => {
  return (
    <MobileContainer maxWidth="xl">
      <TournamentSection />
    </MobileContainer>
  );
};
