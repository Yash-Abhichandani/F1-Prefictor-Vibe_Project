"use client";
import { useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";

export default function AuthCallbackPage() {
  const router = useRouter();
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const handleCallback = async () => {
      // Supabase will automatically handle the URL hash/query params
      // and set the session. We just need to check if it worked.
      
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("Auth callback error:", error);
        router.push("/login?error=auth_failed");
        return;
      }
      
      if (session) {
        // Successfully authenticated - redirect to home
        router.push("/");
        router.refresh();
      } else {
        // No session - might still be processing, wait a bit
        setTimeout(async () => {
          const { data: { session: retrySession } } = await supabase.auth.getSession();
          if (retrySession) {
            router.push("/");
            router.refresh();
          } else {
            router.push("/login");
          }
        }, 1000);
      }
    };

    handleCallback();
  }, []);

  return (
    <div className="min-h-screen bg-[#0B0C10] flex flex-col items-center justify-center text-white font-orbitron">
      <div className="animate-spin text-6xl mb-8">⟳</div>
      <h1 className="text-2xl tracking-widest animate-pulse">AUTHENTICATING...</h1>
      <p className="text-gray-500 mt-4 text-sm">You'll be redirected automatically</p>
    </div>
  );
}
