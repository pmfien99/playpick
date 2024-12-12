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
}

interface GameState {
  isMatchActive: boolean;
  matchData: MatchData | null;
  driveId: string | null;
  driveTeam: string | null;
  playId: string | null;
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
    driveId: null,
    driveTeam: null,
    playId: null,
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
          driveId: null,
          driveTeam: null,
          playId: null,
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
        matchId: matchData.match_id
      };

      const { data: driveData, error: driveError } = await supabaseClient
        .from('drives')
        .select('*')
        .eq('match_id', newMatchData.matchId)
        .eq('is_active', true)
        .maybeSingle();

      const driveId = driveData?.drive_id || null;

      const { data: playData, error: playError } = await supabaseClient
        .from('plays')
        .select('*')
        .eq('drive_id', driveId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      setGameState(prevState => ({
        ...prevState,
        isMatchActive: true,
        matchData: newMatchData,
        driveId: driveId,
        driveTeam: driveData?.team_id || null,
        playId: playData?.play_id || null,
      }));

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
          updateGameContext();
        }).subscribe();

    const driveStatusSubscription = supabaseClient.channel('drive_state')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'drives' },
        () => {
          updateGameContext();
        }).subscribe();

    const playStatusSubscription = supabaseClient.channel('play_state')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'plays' },
        () => {
          updateGameContext();
        }).subscribe();

    return () => {
      supabaseClient.removeChannel(matchStatusSubscription);
      supabaseClient.removeChannel(driveStatusSubscription);
      supabaseClient.removeChannel(playStatusSubscription);
    };
  }, []);

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