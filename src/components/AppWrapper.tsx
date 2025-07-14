import { ReactNode } from "react";
import { ConnectionDebugOverlay } from "./debug/ConnectionDebugOverlay";

interface AppWrapperProps {
  children: ReactNode;
}

export const AppWrapper = ({ children }: AppWrapperProps) => {
  return (
    <>
      {children}
      <ConnectionDebugOverlay />
    </>
  );
};
