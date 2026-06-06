import { useContext } from "react";
import type { AppContextType } from "../types";
import { AppContext } from "./context";

export const useAppData = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppData must be used within AppProvider");
  }
  return context;
};
