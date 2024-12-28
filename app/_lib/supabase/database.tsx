"use server";

// TODO [REFACTOR]: Consider using gameContext directly for IDs instead of passing parameters (Added on 2024-10-24)

import { createClient } from "./server";
import { cookies } from "next/headers";

/**
 * Creates a new anonymous user and sets the session token in cookies
 * @returns {Promise<{ data: any; error: any }>}
 */
export async function createNewAnonUser() {
  const supabase = createClient();

  try {
    const currentSessionToken = cookies().get("session_token");

    if (currentSessionToken) {
      return currentSessionToken.value;
    }

    const { data, error } = await supabase
      .from("players")
      .insert({
        auth_id: null,
        username: null,
        is_anon: true,
        email: null,
      })
      .select();

    if (error) throw error;

    if (data && data.length > 0) {
      const player_id = data[0].player_id;
      cookies().set("session_token", player_id, {
        path: "/",
        httpOnly: true,
        secure: true,
        sameSite: "strict",
      });
      return player_id;
    }
  } catch (error) {
    console.error("Error creating anonymous user:", error);
    throw error;
  }
}

/**
 * Gets all teams from the "teams" table
 * @returns {Promise<{ data: any; error: any }>}
 */
export async function getTeams() {
  const supabase = createClient();

  try {
    const { data, error } = await supabase.from("teams").select("*");
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching teams:", error);
    throw error;
  }
}

/**
 * Creates a new match in the "matches" table
 * @param {string} home_team_id
 * @param {string} home_team_name
 * @param {string} home_team_logo
 * @param {string} away_team_id
 * @param {string} away_team_name
 * @param {string} away_team_logo
 * @returns {Promise<{ data: any; error: any }>}
 */
export async function createMatch(
  home_team_id: string,
  home_team_name: string,
  home_team_logo: string,
  away_team_id: string,
  away_team_name: string,
  away_team_logo: string
) {
  const supabase = createClient();

  try {
    const { data, error } = await supabase
      .from("matches")
      .insert({
        home_team_id,
        home_team_name,
        home_team_logo,
        away_team_id,
        away_team_name,
        away_team_logo,
        is_active: true,
        team_possession: home_team_id,
        current_down: 1,
        start_time: new Date().toISOString(),
      })
      .select();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error creating match:", error);
    throw error;
  }
}

/**
 * Updates the team_possession and resets the down to first down for a given match
 * @param {string} match_id
 * @param {string} team_id
 * @returns {Promise<{ data: any; error: any }>}
 */
export async function setPossession(match_id: string, team_id: string) {
  const supabase = createClient();  

  try {
    const { data, error } = await supabase
      .from("matches")
      .update({ team_possession: team_id, current_down: 1 })
      .eq("match_id", match_id);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error taking possession:", error);
    throw error;
  }
}


/**
 * Sets the current down for a given match
 * @param {string} match_id
 * @param {number} down_number
 * @returns {Promise<{ data: any; error: any }>}
 */
export async function setDown(match_id: string, down_number: number) {
  const supabase = createClient();
  try {
    const { data, error } = await supabase.from("matches").update({ current_down: down_number }).eq("match_id", match_id);
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error taking possession:", error);
    throw error;
  }
}

/**
 * Ends all matches in the "matches" table
 * @returns {Promise<{ data: any; error: any }>}
 */
export async function endAllMatches() {
  const supabase = createClient();

  try {
    const { error } = await supabase
      .from("matches")
      .update({ is_active: false })
      .eq("is_active", true);
    if (error) throw error;
  } catch (error) {
    console.error("Error ending matches:", error);
    throw error;
  }
}
 
/**
 * Creates a new play in the "plays" table
 * 
 * @param {string} match_id
 * @returns {Promise<{ data: any; error: any }>}
 */
export async function createPlay(match_id: string) {
  const supabase = createClient();

  try {
    const { data, error } = await supabase
      .from("plays")
      .insert({
        match_id,
      })
      .select();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error creating play:", error);
    throw error;
  }
}

/**
 * Gets all plays for a given match
 * @param {string} match_id
 * @returns {Promise<{ data: any; error: any }>}
 */
export async function getMatchPlays(match_id: string) {
  const supabase = createClient();
  try {
    const { data, error } = await supabase.from("plays").select("*").eq("match_id", match_id).order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching match plays:", error);
    throw error;
  }
}

/**
 * Starts a play in the "plays" table
 * @param {string} play_id
 * @returns {Promise<{ data: any; error: any }>}
 */
export async function startPlay(play_id: string) {
  const supabase = createClient();

  try {
    const { data, error } = await supabase
      .from("plays")
      .update({ play_state: "play_started" })
      .eq("play_id", play_id);
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error starting play:", error);
    throw error;
  }
}


/**
 * Checks if a player has submitted a pick for a given play
 * @param {string} match_id
 * @param {string} play_id
 * @param {string} player_id
 * @returns {Promise<boolean>}
 */
export async function checkSubmissionExists(play_id: string, player_id: string) {
  const supabase = createClient();
  try {
    const { data, error } = await supabase
      .from("player_picks")
      .select("*")
      .eq("play_id", play_id)
      .eq("player_id", player_id)
      .maybeSingle()

    if (error) throw error;

    return !!data;
  } catch (error) {
    console.error("Error checking submission state:", error);
    throw error;
  }
}


/**
 * Updates the scores for a given play
 * @param {string} play_id
 * @param {string} match_id
 * @param {string} actual_type
 * @param {string} actual_distance
 * @param {boolean} is_ignored
 * @returns {Promise<{ data: any; error: any }>}
 */
export async function updateScoresforPlay(
  play_id: string,
  match_id: string,
  actual_type: string,
  actual_distance: string,
  is_ignored: boolean
) {
  const supabase = createClient();
  const maxRetries = 3;

  const CORRECT_MULTIPLIERS = {
    "run-short": 3,
    "pass-short": 10,
    "run-med": 5,
    "pass-med": 3,
    "run-long": 90,
    "pass-long": 20,
  };

  const { data: playerPicks, error: playerPicksError } = await supabase
    .from("player_picks")
    .select("*")
    .eq("play_id", play_id)
    .eq("match_id", match_id);

  console.log("playerPicks", playerPicks);

  if (playerPicksError) {
    console.error("Error fetching player picks:", playerPicksError);
    throw playerPicksError;
  }

  for (const playerPick of playerPicks) {
    console.log("Scoring this pick", playerPick);
    const playerId = playerPick.player_id;
    const playerBalance = (await getCoinBalance(playerId));
    console.log("Player balance is currently", playerBalance);

    // REFUND THE PLAYERS IF THE PICKS IS IGNORED
    if (is_ignored) {
      console.log("ignoring since play is ignored and refunding player");
      try {
        const { error: ignoreAndUpdateError } = await supabase
          .from("player_picks")
          .update({
            is_ignored: true,
            points_allocated: playerPick.points_wagered
          })
          .eq("pick_id", playerPick.pick_id);

        if (ignoreAndUpdateError) {
          throw new Error(`Error updating pick as ignored and setting points_allocated: ${ignoreAndUpdateError.message}`);
        }

        const newBalance = Number(playerBalance) + Number(playerPick.points_wagered);
        console.log("new balance after refund for ignored play", newBalance);
        await setCoinBalance(playerPick.player_id, newBalance);

      } catch (error) {
        console.error(error);
        throw error;
      }

      continue;
    }

    // IF THEY ARE PARIALY CORRECT, REUND THE PLAYERS THEIR WAGER 
    if (playerPick.pick_type === actual_type && playerPick.pick_distance !== actual_distance) {
      console.log("partially correct, refunding player");
      try {
        const newBalance = Number(playerBalance) + Number(playerPick.points_wagered);
        console.log("new balance after refund for partially correct play", newBalance);
        await setCoinBalance(playerPick.player_id, newBalance);

        // Update the player_pick table with the points_allocated
        const { error: updatePickError } = await supabase
          .from("player_picks")
          .update({
            is_ignored: false,
            points_allocated: playerPick.points_wagered
          })
          .eq("pick_id", playerPick.pick_id);

        if (updatePickError) {
          throw new Error(`Error updating points_allocated for correct pick: ${updatePickError.message}`);
        }
      } catch (error) {
        console.error(error);
        throw error;
      }
    }

    // IF THEY ARE CORRECT, ALLOCATE POINTS 
    if (playerPick.pick_type === actual_type && playerPick.pick_distance === actual_distance) {
      console.log("correct, allocating points");
      try {

        const outcomeKey = `${actual_type}-${actual_distance}`;
        console.log("outcomeKey", outcomeKey);
        const multiplier = CORRECT_MULTIPLIERS[outcomeKey as keyof typeof CORRECT_MULTIPLIERS] || 0;
        console.log("multiplier", multiplier);

        const points_allocated = playerPick.points_wagered * multiplier;
        const newBalance = Number(playerBalance) + Number(points_allocated);
        console.log("new balance after correct play", newBalance);
        await setCoinBalance(playerPick.player_id, newBalance);

        // Update the player_pick table with the points_allocated
        const { error: updatePickError } = await supabase
          .from("player_picks")
          .update({
            is_ignored: false,
            points_allocated: points_allocated
          })
          .eq("pick_id", playerPick.pick_id);

        if (updatePickError) {
          throw new Error(`Error updating points_allocated for correct pick: ${updatePickError.message}`);
        }
      } catch (error) {
        console.error(error);
        throw error;
      }
    }
    

    // IF IT GETS HERE THE PLAYER HAS LOST
    if (playerPick.pick_type !== actual_type || playerPick.pick_distance !== actual_distance) {
      console.log("lost, updating points_allocated to 0");
      try {
        const { error: updatePickError } = await supabase
          .from("player_picks")
          .update({
            is_correct: false,
            points_allocated: 0
          })
          .eq("pick_id", playerPick.pick_id);
  
        if (updatePickError) {
          throw new Error(`Error updating points_allocated for lost pick: ${updatePickError.message}`);
        }
      } catch (error) {
        console.error(error);
        throw error;
      }
    
    }
  }
}

/**
 * Logs a play in the "plays" table
 * @param {string} play_id
 * @param {string} match_id
 * @param {string} play_type
 * @param {string} play_distance
 * @returns {Promise<{ data: any; error: any }>}
 */
export async function logPlayStateUpdateScores(
  play_id: string,
  match_id: string,
  play_type: string,
  play_distance: string,
) {
  const supabase = createClient();

  try {

    const is_ignored = play_type === "punt" || play_type === "spike" || play_type === "knee" || play_type === "field goal" || play_type === "penalty" || play_type === "no-play";

    const updateData = {
      match_id,
      play_state: "play_closed",
      play_type,
      play_distance:
        play_type === "run" || play_type === "pass" ? play_distance : null,
      play_ignored: is_ignored,
    };

    const { data, error } = await supabase
      .from("plays")
      .update(updateData)
      .eq("play_id", play_id);
    if (error) throw error;

    updateScoresforPlay(play_id, match_id, play_type, play_distance, is_ignored);

    return data;
  } catch (error) {
    console.error("Error logging play:", error);
    throw error;
  }
}

/**
 * Gets the coin balance for a given player
 * @param {string} player_id
 * @returns {Promise<{ coin_balance: number; error: any }>}
 */
export async function getCoinBalance(player_id: string) {
  const supabase = createClient();

  try {
    const { data, error } = await supabase
      .from("players")
      .select("coin_balance")
      .eq("player_id", player_id)
      .single();

    if (error) throw error;
    return data.coin_balance;
  } catch (error) {
    console.error("Error fetching coin balance:", error);
    throw error;
  }
}

/**
 * Sets the coin balance for a given player
 * @param {string} player_id
 * @param {number} new_balance
 * @returns {Promise<{ data: any; error: any }>}
 */
export async function setCoinBalance(player_id: string, new_balance: number) {
  const supabase = createClient();
  try {
    const { data, error } = await supabase.from("players").update({ coin_balance: new_balance }).eq("player_id", player_id);
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error setting coin balance:", error);
    throw error;
  }
}


/**
 * Gets the leaderboard from the players table
 * @returns {Promise<{ data: any; error: any }>}
 */
export async function getLeaderboard() {
  const supabase = createClient();
  try {
    const { data, error } = await supabase
      .from("players")
      .select("username, coin_balance")
      .eq("is_anon", false)
      .not("auth_id", "is", null)
      .order("coin_balance", { ascending: false })
      .limit(50);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    throw error;
  }
}


/**
 * Gets the past picks for a given player, including their guess, the actual result, and the change in balance
 * @param {string} player_id
 * @returns {Promise<any[]>}
 */
export async function getPastPicks(player_id: string) {
  const supabase = createClient();

  try {
    // Fetch past picks with the necessary details
    const { data: pastPicksData, error: pastPicksError } = await supabase
      .from("player_picks")
      .select("pick_type, pick_distance, points_wagered, points_allocated, play_id")
      .eq("player_id", player_id)
      .order("created_at", { ascending: false })
      .limit(50);

    if (pastPicksError) throw pastPicksError;

    // Fetch the actual results of the plays
    const playIds = pastPicksData.map(pick => pick.play_id);
    const { data: playsData, error: playsError } = await supabase
      .from("plays")
      .select("play_id, play_type, play_distance")
      .in("play_id", playIds);

    if (playsError) throw playsError;

    // Combine the data to include the player's guess, actual result, and balance change
    const pastPicks = pastPicksData.map(pick => {
      const play = playsData.find(play => play.play_id === pick.play_id);
      const balanceChange = (pick.points_allocated || 0) - (pick.points_wagered || 0);
      return {
        play_id: pick.play_id,
        guess: {
          type: pick.pick_type,
          distance: pick.pick_distance,
        },
        actual: {
          type: play?.play_type || null,
          distance: play?.play_distance || null,
        },
        balanceChange,
      };
    });

    return pastPicks;
  } catch (error) {
    console.error("Error fetching past picks:", error);
    throw error;
  }
}


/**
 * Submits a play in the "player_picks" table
 * @param {string} match_id
 * @param {string} player_id
 * @param {string} play_id
 * @param {string} play_type
 * @param {string} play_distance
 * @param {number} play_bet
 * @returns {Promise<{ data: any; error: any }>}
 */
export async function playerSubmitPlay(
  match_id: string,
  player_id: string,
  play_id: string,
  play_type: string,
  play_distance: string,
  play_bet: number
) {
  const supabase = createClient();

  const betValues = {
    1: 10,
    2: 25,
    3: 50,
    4: 100,
    5: 250,
    6: 500,
  };

  try {
    const { data: pickData, error: pickError } = await supabase.from("player_picks").upsert(
      {
        match_id: match_id,
        player_id: player_id,
        play_id: play_id,
        pick_type: play_type,
        pick_distance: play_distance,
        is_ignored: false,
        points_wagered: betValues[play_bet as keyof typeof betValues],
      },
      { onConflict: "play_id,player_id" }
    );

    if (pickError) throw pickError;

    const { data: playerData, error: playerError } = await supabase
      .from("players")
      .select("coin_balance")
      .eq("player_id", player_id)
      .single();

    if (playerError) throw playerError;
    const currentBalance = Number(playerData.coin_balance);
    const newBalance = Number(currentBalance) - Number(betValues[play_bet as keyof typeof betValues]);

    const { error: balanceError } = await supabase
      .from("players")
      .update({ coin_balance: newBalance })
      .eq("player_id", player_id);

    if (balanceError) throw balanceError;

    return pickData;
  } catch (error) {
    console.error("Error submitting play:", error);
    throw error;
  }
}

/**
 * Undoes a play in the "player_picks" table and refunds the player's bet amount
 * @param {string} match_id
 * @param {string} player_id
 * @param {string} play_id
 * @returns {Promise<{ data: any; error: any }> }
 */
export async function undoPlay(
  match_id: string,
  player_id: string,
  play_id: string
) {
  const supabase = createClient();
  try {
    const { data: pickData, error: pickError } = await supabase
      .from("player_picks")
      .select("points_wagered")
      .eq("match_id", match_id)
      .eq("player_id", player_id)
      .eq("play_id", play_id)
      .single();

    if (pickError) throw pickError;

    const betAmount = pickData?.points_wagered || 0;

    const { error: deleteError } = await supabase
      .from("player_picks")
      .delete()
      .eq("match_id", match_id)
      .eq("player_id", player_id)
      .eq("play_id", play_id);

    if (deleteError) throw deleteError;

    const { data: playerData, error: playerError } = await supabase
      .from("players")
      .select("coin_balance")
      .eq("player_id", player_id)
      .single();

    if (playerError) throw playerError;

    const currentBalance = playerData.coin_balance;

    const newBalance = Number(currentBalance) + Number(betAmount);
    const { error: updateError } = await supabase
      .from("players")
      .update({ coin_balance: newBalance })
      .eq("player_id", player_id);

    if (updateError) throw updateError;

    return { success: true };
  } catch (error) {
    console.error("Error undoing play:", error);
    throw error;
  }
}
