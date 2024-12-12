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
 * Creates a new drive in the "drives" table
 * @param {string} team_id
 * @param {string} match_id
 * @returns {Promise<{ data: any; error: any }>}
 */
export async function createDrive(match_id: string, team_id: string) {
  const supabase = createClient();

  try {
    const { data, error } = await supabase
      .from("drives")
      .insert({
        match_id,
        team_id,
        start_time: new Date().toISOString(),
        is_active: true,
      })
      .select();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error creating drive:", error);
    throw error;
  }
}

/**
 * Ends all drives in the "drives" table
 * @returns {Promise<{ data: any; error: any }>}
 */
export async function endAllDrives() {
  const supabase = createClient();

  try {
    const { error } = await supabase
      .from("drives")
      .update({ is_active: false })
      .eq("is_active", true);
    if (error) throw error;
  } catch (error) {
    console.error("Error ending drives:", error);
    throw error;
  }
}

/**
 * Gets all drives for a given match
 * @param {string} match_id
 * @returns {Promise<{ data: any; error: any }>}
 */
export async function getMatchDrives(match_id: string) {
  const supabase = createClient();

  try {
    const { data, error } = await supabase
      .from("drives")
      .select("*")
      .eq("match_id", match_id);
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching match drives:", error);
    throw error;
  }
}

/**
 * Gets all plays for a given drive
 * @param {string} drive_id
 * @returns {Promise<{ data: any; error: any }>}
 */
export async function getDrivePlays(drive_id: string) {
  const supabase = createClient();

  try {
    const { data, error } = await supabase
      .from("plays")
      .select("*")
      .eq("drive_id", drive_id);
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching drive plays:", error);
    throw error;
  }
}

/**
 * Creates a new play in the "plays" table
 * @param {string} drive_id
 * @returns {Promise<{ data: any; error: any }>}
 */
export async function createPlay(drive_id: string) {
  const supabase = createClient();

  try {
    const { data, error } = await supabase
      .from("plays")
      .insert({
        drive_id,
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



export async function updateScoresforPlay(
  play_id: string,
  drive_id: string,
  actual_type: string,
  actual_distance: string,
  is_ignored: boolean
) {
  const supabase = createClient();
  const maxRetries = 3;

  const { data: playerPicks, error: playerPicksError } = await supabase
    .from("player_picks")
    .select("*")
    .eq("play_id", play_id);

  if (playerPicksError) {
    console.error("Error fetching player picks:", playerPicksError);
    throw playerPicksError;
  }

  for (const playerPick of playerPicks) {
    if (is_ignored) {
      const { error: ignorePickError } = await supabase
        .from("player_picks")
        .update({ is_ignored: true })
        .eq("pick_id", playerPick.pick_id);

      if (ignorePickError) {
        console.error("Error marking pick as ignored:", ignorePickError);
        throw ignorePickError;
      }

      continue;
    }

    let retryCount = 0;
    let success = false;

    while (retryCount < maxRetries && !success) {
      const isCorrect = playerPick.pick_type === actual_type;

      const { data: currentScoreData, error: currentScoreError } = await supabase
        .from("scores")
        .select("*")
        .eq("player_id", playerPick.player_id)
        .eq("drive_id", drive_id)
        .single();

      if (currentScoreError && currentScoreError.code !== 'PGRST116') {
        console.error("Error fetching current score:", currentScoreError);
        throw currentScoreError;
      }

      let points = currentScoreData?.points || 0;
      let correct_picks = currentScoreData?.correct_picks || 0;
      let total_picks = currentScoreData?.total_picks || 0;
      const lastUpdated = currentScoreData?.last_updated;

      let pointsAllocated = 0;

      if (isCorrect) {
        correct_picks += 1;
        switch (actual_distance) {
          case "short":
            pointsAllocated = actual_type === "pass" ? 150 : 150;
            break;
          case "med":
            pointsAllocated = actual_type === "pass" ? 300 : 500;
            break;
          case "long":
            pointsAllocated = actual_type === "pass" ? 1000 : 2000;
            break;
          default:
            pointsAllocated = 100; // Default to base points if distance is unknown
        }
        points += pointsAllocated;
      } else {
        pointsAllocated = -50;
        points += pointsAllocated;
      }
      total_picks += 1;

      const { error: updatePickError } = await supabase
        .from("player_picks")
        .update({ is_correct: isCorrect, points_allocated: pointsAllocated })
        .eq("pick_id", playerPick.pick_id);

      if (updatePickError) {
        console.error("Error updating player pick:", updatePickError);
        throw updatePickError;
      }

      const { error: upsertError } = await supabase.from("scores").upsert(
        {
          player_id: playerPick.player_id,
          drive_id: drive_id,
          points,
          correct_picks,
          total_picks,
          last_updated: new Date().toISOString(),
        },
        { onConflict: "player_id, drive_id" }
      ).eq("last_updated", lastUpdated);

      if (!upsertError) {
        success = true;
      } else {
        console.warn(`Conflict detected, retrying... (${retryCount + 1}/${maxRetries})`);
        retryCount++;
      }
    }

    if (!success) {
      console.error("Failed to update score after multiple attempts.");
      throw new Error("Failed to update score after multiple attempts.");
    }
  }
}
/**
 * Logs a play in the "plays" table
 * @param {string} play_id
 * @param {string} drive_id
 * @param {string} play_type
 * @param {string} play_distance
 * @returns {Promise<{ data: any; error: any }>}
 */
export async function logPlayStateUpdateScores(
  play_id: string,
  drive_id: string,
  play_type: string,
  play_distance: string,
) {
  const supabase = createClient();

  try {

    const is_ignored = play_type !== "run" && play_type !== "pass";

    const updateData = {
      drive_id,
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

    updateScoresforPlay(play_id, drive_id, play_type, play_distance, is_ignored);

    return data;
  } catch (error) {
    console.error("Error logging play:", error);
    throw error;
  }
}

/**
 * Gets the score for a given drive and user
 * @param {string} drive_id
 * @param {string} player_id
 * @returns {Promise<{ data: any; error: any }>}
 */
export async function getUserScore(
  drive_id: string,
  player_id: string
) {
  const supabase = createClient();

  try {
    const { data, error } = await supabase
      .from("scores")
      .select("*")
      .eq("drive_id", drive_id)
      .eq("player_id", player_id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching user score:", error);
    throw error;
  }
}


/**
 * Gets the leaderboard for a given drive
 * @param {string} drive_id
 * @returns {Promise<{ data: any; error: any }>}
 */
export async function getLeaderboard(drive_id: string) {
  const supabase = createClient();

  try {
    const { data, error } = await supabase
      .from("leaderboard")
      .select("username, points, is_anon")
      .eq("drive_id", drive_id)
      .eq("is_anon", false)
      .order("points", { ascending: false })
      .limit(10);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    throw error;
  }
}


/**
 * Gets the past picks for a given player in a given drive, including the last 3 plays without picks
 * @param {string} player_id
 * @param {string} drive_id
 * @returns {Promise<{ data: any; error: any }>}
 */
export async function getPastPicks(player_id: string, drive_id: string) {
  const supabase = createClient();

  try {
    const { data: allPlaysData, error: allPlaysError } = await supabase
      .from("plays")
      .select("play_id, play_type, play_distance")
      .eq("drive_id", drive_id)
      .order("created_at", { ascending: false })
      .limit(3);

    if (allPlaysError) throw allPlaysError;

    const { data: pastPicksData, error: pastPicksError } = await supabase
      .from("player_picks")
      .select("pick_type, pick_distance, points_allocated, play_id, is_ignored")
      .eq("player_id", player_id)
      .eq("drive_id", drive_id);

    if (pastPicksError) throw pastPicksError;

    const pastPicks = allPlaysData.map((play) => {
      const pick = pastPicksData.find(pick => pick.play_id === play.play_id);
      return {
        play_id: play.play_id,
        play_type: play.play_type,
        play_distance: play.play_distance,
        pick_type: pick?.pick_type || null,
        pick_distance: pick?.pick_distance || null,
        points_allocated: pick?.points_allocated || 0,
        is_ignored: pick?.is_ignored || false,
      };
    });

    return pastPicks;
  } catch (error) {
    console.error("Error fetching past picks:", error);
    throw error;
  }
}


/**
 *
 * @param player_id
 * @param play_id
 * @param play_type
 * @param play_distance
 * @returns
 */
export async function playerSubmitPlay(
  match_id: string,
  drive_id: string,
  player_id: string,
  play_id: string,
  play_type: string,
  play_distance: string,
) {
  const supabase = createClient();

  try {
    const { data, error } = await supabase.from("player_picks").upsert(
      {
        match_id: match_id,
        drive_id: drive_id,
        player_id: player_id,
        play_id: play_id,
        pick_type: play_type,
        pick_distance: play_distance,
        is_correct: false,
        is_ignored: false,
      },
      { onConflict: "play_id,player_id" }
    );

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error submitting play:", error);
    throw error;
  }
}

/**
 * Undoes a play in the "player_picks" table
 * @param {string} match_id
 * @param {string} drive_id
 * @param {string} player_id
 * @param {string} play_id
 * @returns {Promise<{ data: any; error: any }>}
 */
export async function undoPlay(  
  match_id: string,
  drive_id: string,
  player_id: string,
  play_id: string
) {
  const supabase = createClient();
  try {
    const { data, error } = await supabase.from("player_picks").delete()
      .eq("match_id", match_id)
      .eq("drive_id", drive_id)
      .eq("player_id", player_id)
      .eq("play_id", play_id);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error undoing play:", error);
    throw error;
  }
}
