import React, { createContext, useState, ReactNode, useEffect, useContext } from "react";
import { createClient } from "@/app/_lib/supabase/client";

interface MatchData {
  homeTeamId: string;
  homeTeamName: string;
  homeTeamLogo: string;
  awayTeamId: string;
  awayTeamName: string;
  awayTeamLogo: string;
  matchId: string;
  currentDown: number;
  possessionId: string;
}

interface GameState {
  isMatchActive: boolean;
  matchData: MatchData | null;
  play_id: string | null;
  play_state: string | null;
}

interface GameContextType extends GameState {
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
}

const supabaseClient = createClient();
const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [gameState, setGameState] = useState<GameState>({
    isMatchActive: false,
    matchData: null,
    play_id: null,
    play_state: null,
  });


  const updateGameContext = async () => {
    try {
      const { data: matchData, error: matchError } = await supabaseClient
        .from('matches')
        .select('*')
        .eq('is_active', true)
        .single();

      if (matchError || !matchData) {
        setGameState(prevState => ({
          ...prevState,
          isMatchActive: false,
          matchData: null,
          play_id: null,
          play_state: null,
        }));
        return;
      }

      const newMatchData: MatchData = {
        homeTeamId: matchData.home_team_id,
        homeTeamName: matchData.home_team_name,
        homeTeamLogo: matchData.home_team_logo,
        awayTeamId: matchData.away_team_id,
        awayTeamName: matchData.away_team_name,
        awayTeamLogo: matchData.away_team_logo,
        matchId: matchData.match_id,
        possessionId: matchData.team_possession,
        currentDown: matchData.current_down,
      };

      try {
        const { data: playData, error: playError } = await supabaseClient
          .from('plays')
          .select('*')
          .eq('match_id', matchData.match_id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        setGameState(prevState => ({
          ...prevState,
          isMatchActive: true,
          matchData: newMatchData,
          play_id: playData?.play_id,
          play_state: playData?.play_state,
        }));
      } catch (error) {
        console.error("Error fetching current play:", error);
      }

    } catch (error) {
      console.error("Error in updateGameContext:", error);
    }


  };


  useEffect(() => {
    updateGameContext();

    const matchStatusSubscription = supabaseClient.channel('match_state')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'matches' },
      () => {
        console.log("Detected change in matches table");
        updateGameContext();
      }).subscribe();

    const playStatusSubscription = supabaseClient.channel('play_state')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'plays' },
      () => {
        console.log("Detected change in plays table");
        updateGameContext();
      }).subscribe();


    return () => {
      supabaseClient.removeChannel(matchStatusSubscription);
      supabaseClient.removeChannel(playStatusSubscription);
    };
  }, []);

  useEffect(() => {
    console.log("game context", gameState);
  }, [gameState]);

  return (
    <GameContext.Provider value={{ ...gameState, setGameState }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
};