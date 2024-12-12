'use server'

import { createClient } from "@/app/_lib/supabase/server";

/**
 * Sign in a user with email and password.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{ success: boolean; error?: string }>}
 */
export async function signInWithEmail(email: string, password: string) {
  const supabase = createClient();

  const payload = {
    email: email,
    password: password
  };

  const { data, error } = await supabase.auth.signInWithPassword(payload);

  if (error) {
    console.error("Sign-in error:", error.message);
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Sign up a user with email and password, and link them to an existing player record.
 * @param {string} username
 * @param {string} email
 * @param {string} password
 * @param {string} playerId - The ID of the anonymous player to link
 * @returns {Promise<{ success: boolean; error?: string }>}
 */
export async function signUpWithEmail(username: string, email: string, password: string, player_id: string) {
  const supabase = createClient();

  const payload = {
    email: email,
    password: password,
    options: {
      data: {
        username: username
      }
    }
  };

  const { data, error } = await supabase.auth.signUp(payload);

  if (error) {
    console.error("Signup error:", error.message);
    return { success: false, error: error.message };
  }

  if (data.user) {
    const { error: linkError } = await supabase
      .from("players")
      .update({
        player_id: data.user.id,
        username: data.user.user_metadata.username,
        auth_id: data.user.id,
        is_anon: false,
      })
      .eq("player_id", player_id);

    if (linkError) {
      console.error("Error linking user:", linkError.message);
      return { success: false, error: linkError.message };
    }
  }

  return { success: true };
}

/**
 * Sign out the current user.
 * @returns {Promise<{ success: boolean; error?: string }>}
 */
export async function signOut() {
  const supabase = createClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("Sign-out error:", error.message);
    return { success: false, error: error.message };
  }

  return { success: true };
}