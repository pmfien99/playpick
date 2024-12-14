import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { createClient } from "@/app/_lib/supabase/client";
import { createNewAnonUser } from "@/app/_lib/supabase/database";

// TODO: Add proper coins login to user context 

interface User {
  player_id: string;
  username: string | null;
  is_anon: boolean;
  email: string | null;
  coins: number;
}

interface UserContextType {
  user: User;
  setUser: (user: User) => void;
}

const defaultAnonUser: User = {
  player_id: '',
  username: null,
  is_anon: true,
  email: null,
  coins: 0,
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(defaultAnonUser);
  const supabase = createClient();

  useEffect(() => {
    const initializeUser = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (error || !data?.user) {
          const playerId = await createNewAnonUser();
          if (playerId) {
            setUser({
              ...defaultAnonUser,
              player_id: playerId,
            });
          } else {
            console.error('Failed to create a new anonymous user.');
          }
        } else {
          setUser({
            player_id: data.user.id,
            username: data.user.user_metadata.username || null,
            is_anon: false,
            email: data.user.email || null,
            coins: 0,
          });
        }
      } catch (err) {
        console.error('Unexpected error:', err);
      }
    };

    initializeUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser({
          player_id: session.user.id,
          username: session.user.user_metadata.username || null,
          is_anon: false,
          email: session.user.email || null,
          coins: 0,
        });
      } else {
        setUser(defaultAnonUser);
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [supabase]);

  useEffect(() => {
    console.log("user", user);
  }, [user]);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};