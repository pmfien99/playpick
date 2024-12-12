import React, { createContext, useContext, useState, useCallback } from "react";
import { getPastPicks } from "@/app/_lib/supabase/database";

type PastPick = {
  pick_type: string;
  pick_distance: string;
  points_allocated: number;
  play_type: string;
  play_distance: string;
  is_ignored: boolean;
};

type PastPicksContextType = {
  pastPicksData: PastPick[];
  refreshPastPicks: (playerId: string, driveId: string) => Promise<void>;
};

const PastPicksContext = createContext<PastPicksContextType | undefined>(undefined);

export const PastPicksProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pastPicksData, setPastPicksData] = useState<PastPick[]>([]);

  const refreshPastPicks = useCallback(async (playerId: string, driveId: string) => {
    try {
      const pastPicks = await getPastPicks(playerId, driveId);
      setPastPicksData(pastPicks || []);
      console.log("pastPicksData", pastPicksData);
    } catch (error) {
      console.error("Error fetching past picks:", error);
    }
  }, []);

  return (
    <PastPicksContext.Provider value={{ pastPicksData, refreshPastPicks }}>
      {children}
    </PastPicksContext.Provider>
  );
};

export const usePastPicks = () => {
  const context = useContext(PastPicksContext);
  if (!context) {
    throw new Error("usePastPicks must be used within a PastPicksProvider");
  }
  return context;
};