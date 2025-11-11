import { useEffect, useState } from "react";
import supabase from "./supabaseClient";

export function useSession() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    // Get the current session once, when the component mounts
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });

    // Listen for auth state changes: sign-in, sign-out, token refresh
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    // Cleanup: unsubscribe when the component unmounts
    return () => subscription.unsubscribe();
  }, []);

  return session;
}
