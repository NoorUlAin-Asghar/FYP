// components/ProtectedRoute.tsx
"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import supabase from "@/lib/supabaseClient";
import { Session } from "@supabase/auth-helpers-nextjs";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);

  //make sure the user is authorized.
  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push("/sign-in?error=unauthorized");
      } else {
        setSession(session);
      }

      setLoading(false);
    };

    checkSession();
  }, [router, supabase]);

    if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-gradient-to-r from-[#008080] to-[#00f5f5]">
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/20 backdrop-blur-sm">
          <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin mr-4"></div>
          <p className="text-white font-dancing text-6xl font-bold">Checking Authentication...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
