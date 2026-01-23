"use client";
import { createBrowserClient } from "@supabase/ssr";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { TEAM_COLORS, ALL_DRIVERS_NAMES, DRIVERS_DATA_2026 } from "../lib/drivers";
import AmbientNumberBg from "../components/AmbientNumberBg";

type AuthMode = "signin" | "signup" | "magic-link" | "forgot-password";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState(""); 
  const [favTeam, setFavTeam] = useState("");
  const [favDriver, setFavDriver] = useState("");
  const [authMode, setAuthMode] = useState<AuthMode>("signin");
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // === BULLETPROOF TIMEOUT HELPER ===
  // Must be defined BEFORE useEffect that uses it
  const withTimeout = async <T,>(promise: Promise<T>, ms = 8000): Promise<T> => {
      const timeout = new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error("Request timed out. Check connection.")), ms)
      );
      return Promise.race([promise, timeout]);
  };

  // === HARD DEADLINE SAFETY NET ===
  // This absolute deadline GUARANTEES we exit checkingSession state
  useEffect(() => {
    const hardDeadline = setTimeout(() => {
      if (checkingSession) {
        console.warn("HARD DEADLINE: Force-exiting session check after 5s");
        setCheckingSession(false);
      }
    }, 5000); // 5 seconds absolute maximum
    
    return () => clearTimeout(hardDeadline);
  }, [checkingSession]);

  // === SESSION CHECK ===
  useEffect(() => {
    const checkSession = async () => {
      try {
        // 2.5s timeout - fail fast, don't keep users waiting
        const { data } = await withTimeout(supabase.auth.getSession(), 2500);
         if (data?.session) {
            router.push('/');
         } else {
            setCheckingSession(false);
         }
      } catch (error) {
         // Session check failed/timed out - force purge any corrupt state
         console.warn("Session check failed, purging state...", error);
         try {
           // Quick signOut attempt (don't wait long)
           await withTimeout(supabase.auth.signOut(), 1000);
         } catch {
           // If even signOut hangs, just continue - hard deadline will save us
         }
         setCheckingSession(false);
      }
    };
    checkSession();
  }, []);

  const forceReset = async () => {
    try {
      await supabase.auth.signOut();
    } catch {}
    localStorage.clear();
    sessionStorage.clear();
    window.location.reload();
  };

  const clearMessage = () => setMessage(null);

  const getPasswordStrength = (pass: string) => {
    if (!pass) return { level: 0, text: "", color: "" };
    let score = 0;
    if (pass.length >= 8) score++;
    if (pass.length >= 12) score++;
    if (/[a-z]/.test(pass) && /[A-Z]/.test(pass)) score++;
    if (/\d/.test(pass)) score++;
    if (/[^a-zA-Z0-9]/.test(pass)) score++;
    
    if (score <= 1) return { level: 1, text: "Weak", color: "bg-[var(--f1-red)]" };
    if (score <= 2) return { level: 2, text: "Fair", color: "bg-[var(--status-warning)]" };
    if (score <= 3) return { level: 3, text: "Good", color: "bg-[var(--accent-cyan)]" };
    return { level: 4, text: "Strong", color: "bg-[var(--status-success)]" };
  };

  const passwordStrength = getPasswordStrength(password);

  const handleSignUp = async () => {
    if (!email || !password || (authMode === "signup" && !username)) {
      setMessage({ type: "error", text: "Please fill in all fields" });
      return;
    }
    if (password.length < 6) {
      setMessage({ type: "error", text: "Password must be at least 6 characters" });
      return;
    }
    
    setLoading(true);
    clearMessage();
    
    try {
        const { error } = await withTimeout(supabase.auth.signUp({
          email,
          password,
          options: { 
            emailRedirectTo: `${location.origin}/auth/callback`,
            data: { 
              username,
              favorite_team: favTeam,
              favorite_driver: favDriver
            } 
          },
        }));

        if (!error) {
           // Send welcome email (fire and forget)
           fetch('/api/auth/welcome', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email, username })
           }).catch(console.error);
           
           setMessage({ type: "success", text: "🏁 Check your email for the confirmation link! Not in inbox? Check your spam folder and add us to contacts." });
        } else {
           setMessage({ type: "error", text: error.message });
        }
    } catch (err: any) {
        setMessage({ type: "error", text: err.message || "An error occurred" });
    } finally {
        setLoading(false);
    }
  };

  const handleSignIn = async () => {
    if (!email || !password) {
      setMessage({ type: "error", text: "Please fill in all fields" });
      return;
    }
    
    setLoading(true);
    clearMessage();
    
    try {
        const { error } = await withTimeout(supabase.auth.signInWithPassword({ email, password }));
        
        if (error) {
          setMessage({ type: "error", text: error.message });
          setLoading(false);
        } else {
          router.push("/");
          router.refresh();
          // Keep loading true during redirect for seamless transition
        }
    } catch (err: any) {
        setMessage({ type: "error", text: err.message || "Login timed out" });
        setLoading(false);
    }
  };

  const handleMagicLink = async () => {
    if (!email) {
      setMessage({ type: "error", text: "Please enter your email address" });
      return;
    }
    
    setLoading(true);
    clearMessage();
    
    try {
        const { error } = await withTimeout(supabase.auth.signInWithOtp({
          email,
          options: { emailRedirectTo: `${location.origin}/auth/callback` },
        }));
        
        if (error) {
          setMessage({ type: "error", text: error.message });
        } else {
          setMessage({ type: "success", text: "Magic link sent! Check your email." });
        }
    } catch (err: any) {
        setMessage({ type: "error", text: err.message });
    } finally {
        setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setMessage({ type: "error", text: "Please enter your email address" });
      return;
    }
    
    setLoading(true);
    clearMessage();
    
    try {
        const { error } = await withTimeout(supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${location.origin}/auth/callback?next=/reset-password`,
        }));
        
        if (error) {
          setMessage({ type: "error", text: error.message });
        } else {
          setMessage({ type: "success", text: "Password reset link sent!" });
        }
    } catch (err: any) {
        setMessage({ type: "error", text: err.message });
    } finally {
        setLoading(false);
    }
  };
  
  // State for showing force reset option
  const [showForceReset, setShowForceReset] = useState(false);

  // Show "Force Reset" option after 3 seconds
  useEffect(() => {
    if (checkingSession) {
      const timer = setTimeout(() => setShowForceReset(true), 3000);
      return () => clearTimeout(timer);
    }
  }, [checkingSession]);
  
  if (checkingSession) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--bg-void)]">
           <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-[var(--f1-red)] border-t-transparent rounded-full animate-spin"></div>
              <div className="text-[var(--text-muted)] text-sm font-mono tracking-widest animate-pulse">AUTHENTICATING...</div>
              
              {/* Force Reset - appears after 3s */}
              {showForceReset && (
                <div className="mt-6 text-center animate-fade-in">
                  <p className="text-xs text-[var(--text-subtle)] mb-2">Stuck? Clear your session and try again.</p>
                  <button 
                    onClick={forceReset} 
                    className="px-4 py-2 text-xs bg-[var(--f1-red)] hover:bg-[var(--f1-red-bright)] text-white rounded-lg transition font-bold uppercase tracking-wider"
                  >
                    Force Reset
                  </button>
                </div>
              )}
           </div>
        </div>
      );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-void)] p-4 relative overflow-hidden font-mono selection:bg-[var(--accent-cyan)] selection:text-black">
      {/* Ambient Number Background - F1 Branding */}
      <AmbientNumberBg number="F1" color="#FF1801" opacity={12} />
      
      {/* Background Elements (Wind Tunnel Visibility) */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[var(--f1-red)] opacity-[0.04] blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[var(--accent-cyan)] opacity-[0.03] blur-[100px] rounded-full -translate-x-1/3 translate-y-1/3 pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-md">
        {/* Security Gate Card */}
        {/* Dynamic Border Color based on Team */}
        <div 
           className="relative backdrop-blur-xl bg-[rgba(15,17,21,0.6)] border p-8 md:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden transition-colors duration-500 glass-card-auth"
           style={{ 
             borderColor: favTeam && TEAM_COLORS[favTeam as keyof typeof TEAM_COLORS] 
               ? TEAM_COLORS[favTeam as keyof typeof TEAM_COLORS] 
               : 'rgba(255,255,255,0.1)'
           }}
        >
          
          {/* Chamfered Corners (CSS mask or clip-path is tricky with border, so using pseudo-elements or specific border-radius) */}
          {/* We'll use specific border radius to simulate the cut: Top-Right & Bottom-Left */}
          <div className="absolute inset-0 pointer-events-none border border-white/5 rounded-tr-[30px] rounded-bl-[30px]"></div>
          {/* Override the main container radius effectively */}

          
          {/* Corner Brackets (Decorators) */}
          <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[var(--accent-cyan)] opacity-50"></div>
          <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[var(--f1-red)] opacity-50 rounded-tr-[28px]"></div>
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[var(--f1-red)] opacity-50 rounded-bl-[28px]"></div>
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[var(--accent-cyan)] opacity-50"></div>

          {/* Logo Block */}
          <div className="text-center mb-10 relative z-10">
            <Link href="/" className="inline-block group">
              <h2 className="text-2xl font-black text-white font-orbitron tracking-tight group-hover:tracking-widest transition-all duration-300">
                F1 <span className="text-[var(--f1-red)]">APEX</span>
              </h2>
              <div className="h-0.5 w-0 group-hover:w-full bg-[var(--accent-gold)] transition-all duration-300 mx-auto mt-1"></div>
            </Link>
          </div>

          {/* Message */}
          {message && (
            <div className={`mb-8 p-4 text-xs font-mono uppercase tracking-wide border-l-2 ${
              message.type === "success"
                ? "bg-[rgba(16,185,129,0.1)] border-[var(--status-success)] text-[var(--status-success)]"
                : "bg-[rgba(255,24,1,0.1)] border-[var(--f1-red)] text-[var(--f1-red)]"
            }`}>
              <span className="mr-2 font-bold">{message.type === "success" ? "[SUCCESS]" : "[ERROR]"}</span>
              {message.text}
            </div>
          )}

          {/* Form Content */}
          <div className="relative z-10">
          {authMode === "magic-link" ? (
            <>
              <h1 className="text-3xl font-black text-white mb-2 italic uppercase font-display tracking-tighter">SECURE UPLINK</h1>
              <p className="text-[var(--text-muted)] text-xs font-mono mb-8 uppercase tracking-widest">// Passkey Verification</p>
              
              <div className="mb-6">
                 <label className="block text-[10px] text-[var(--text-muted)] uppercase tracking-[0.15em] mb-2 font-bold">CONTACT_CHANNEL</label>
                 <input
                  type="email"
                  placeholder="USER_ID / EMAIL"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); clearMessage(); }}
                  className="w-full bg-[#1A1D21] border border-[#333] text-white p-4 text-sm font-mono focus:outline-none focus:border-[var(--accent-cyan)] focus:shadow-[0_0_15px_rgba(0,212,255,0.2)] transition-all placeholder:text-white/20 rounded-none"
                />
              </div>
              
              <button onClick={handleMagicLink} disabled={loading} className="w-full bg-[var(--accent-cyan)] hover:bg-[#33ddff] text-black font-bold py-4 text-sm font-mono uppercase tracking-widest transition-all hover:translate-x-1 hover:-translate-y-1 shadow-[4px_4px_0px_rgba(255,255,255,0.1)] active:shadow-none active:translate-x-0 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed mb-4 flex items-center justify-center gap-2">
                 <span className="text-lg">⚡</span> {loading ? "TRANSMITTING..." : "TRANSMIT ACCESS CODE"}
              </button>
              
              <button onClick={() => { setAuthMode("signin"); clearMessage(); }} className="w-full text-xs text-[var(--text-muted)] hover:text-[var(--accent-cyan)] font-mono uppercase tracking-wider transition-colors text-center block mt-4">
                [ ABORT SEQUENCE ]
              </button>
            </>
          ) : authMode === "forgot-password" ? (
            <>
              <h1 className="text-3xl font-black text-white mb-2 italic uppercase font-display tracking-tighter">CREDENTIAL RESET</h1>
              <p className="text-[var(--text-muted)] text-xs font-mono mb-8 uppercase tracking-widest">// RECOVER ACCESS</p>
              
              <div className="mb-6">
                 <label className="block text-[10px] text-[var(--text-muted)] uppercase tracking-[0.15em] mb-2 font-bold">RECOVERY_EMAIL</label>
                 <input
                  type="email"
                  placeholder="USER_ID / EMAIL"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); clearMessage(); }}
                  className="w-full bg-[#1A1D21] border border-[#333] text-white p-4 text-sm font-mono focus:outline-none focus:border-[var(--accent-cyan)] focus:shadow-[0_0_15px_rgba(0,212,255,0.2)] transition-all placeholder:text-white/20 rounded-none"
                />
              </div>
              
              <button onClick={handleForgotPassword} disabled={loading} className="w-full bg-[var(--f1-red)] hover:bg-[var(--f1-red-bright)] text-white font-bold py-4 text-sm font-mono uppercase tracking-widest transition-all hover:shadow-[0_0_20px_rgba(255,24,1,0.4)] disabled:opacity-50 disabled:cursor-not-allowed mb-4">
                {loading ? "TRANSMITTING..." : "SEND RECOVERY PACKET"}
              </button>
              
              <button onClick={() => { setAuthMode("signin"); clearMessage(); }} className="w-full text-xs text-[var(--text-muted)] hover:text-white font-mono uppercase tracking-wider transition-colors text-center block mt-4">
                [ CANCEL OPERATION ]
              </button>
            </>
          ) : (
            <>
              <h1 className="text-3xl font-black text-white mb-2 italic uppercase font-display tracking-tighter leading-none">
                {authMode === "signup" ? "NEW LICENSE APPLICATION" : "AUTHENTICATION REQUIRED"}
              </h1>
              <p className="text-[var(--text-muted)] text-xs font-mono mb-8 uppercase tracking-widest">
                {authMode === "signup" ? "// REGISTER NEW DRIVER PROFILE" : "// ESTABLISH SECURE UPLINK"}
              </p>
              
              {authMode === "signup" && (
                <>
                  <div className="mb-4">
                    <label className="block text-[10px] text-[var(--text-muted)] uppercase tracking-[0.15em] mb-2 font-bold">CALLSIGN</label>
                    <input
                      type="text"
                      placeholder="SELECT USERNAME"
                      value={username}
                      onChange={(e) => { setUsername(e.target.value); clearMessage(); }}
                      className="w-full bg-[#1A1D21] border border-[#333] text-white p-4 text-sm font-mono focus:outline-none focus:border-[var(--accent-cyan)] focus:shadow-[0_0_15px_rgba(0,212,255,0.2)] transition-all placeholder:text-white/20 rounded-none"
                    />
                  </div>
                  
                  {/* Personalization Fields */}
                  <div className="flex flex-col md:flex-row gap-4 mb-4">
                    <div className="flex-1">
                        <label className="block text-[10px] text-[var(--text-muted)] uppercase tracking-[0.15em] mb-2 font-bold">CONSTRUCTOR</label>
                        <select
                          value={favTeam}
                          onChange={(e) => { setFavTeam(e.target.value); clearMessage(); }}
                          className="w-full bg-[#1A1D21] border border-[#333] text-white p-4 text-sm font-mono focus:outline-none focus:border-[var(--accent-gold)] appearance-none rounded-none uppercase cursor-pointer hover:bg-[#222]"
                        >
                          <option value="">SELECT TEAM...</option>
                          {Object.keys(TEAM_COLORS).map(team => (
                            <option key={team} value={team}>{team.toUpperCase()}</option>
                          ))}
                        </select>
                    </div>
                    
                    <div className="flex-1">
                        <label className="block text-[10px] text-[var(--text-muted)] uppercase tracking-[0.15em] mb-2 font-bold">DRIVER_ID</label>
                        <select
                          value={favDriver}
                          onChange={(e) => setFavDriver(e.target.value)}
                          className="w-full bg-[#1A1D21] border border-[#333] text-white p-4 text-sm font-mono focus:outline-none focus:border-[var(--accent-gold)] appearance-none rounded-none uppercase cursor-pointer hover:bg-[#222]"
                        >
                          <option value="">SELECT DRIVER...</option>
                          {DRIVERS_DATA_2026.map(d => (
                            <option key={d.name} value={d.name}>{d.name.toUpperCase()} #{d.number}</option>
                          ))}
                        </select>
                    </div>
                  </div>
                </>
              )}
              
              <div className="mb-4">
                 <label className="block text-[10px] text-[var(--text-muted)] uppercase tracking-[0.15em] mb-2 font-bold">USER_ID / EMAIL</label>
                 <input
                  type="email"
                  placeholder="ENTER CREDENTIALS"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); clearMessage(); }}
                  className="w-full bg-[#1A1D21] border border-[#333] text-white p-4 text-sm font-mono focus:outline-none focus:border-[var(--accent-cyan)] focus:shadow-[0_0_15px_rgba(0,212,255,0.2)] transition-all placeholder:text-white/20 rounded-none"
                />
              </div>
              
              <div className="relative mb-6">
                <label className="block text-[10px] text-[var(--text-muted)] uppercase tracking-[0.15em] mb-2 font-bold">ACCESS_KEY</label>
                <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); clearMessage(); }}
                      className="w-full bg-[#1A1D21] border border-[#333] text-white p-4 text-sm font-mono focus:outline-none focus:border-[var(--accent-cyan)] focus:shadow-[0_0_15px_rgba(0,212,255,0.2)] transition-all placeholder:text-white/20 rounded-none pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--accent-cyan)] text-xs uppercase font-bold tracking-wider"
                    >
                      {showPassword ? "HIDE" : "SHOW"}
                    </button>
                </div>
              </div>
              
              {/* Password Strength */}
              {authMode === "signup" && password && (
                <div className="mb-6">
                  <div className="flex gap-1 mb-2 h-1 bg-[#111]">
                    {[1, 2, 3, 4].map((level) => (
                      <div key={level} className={`flex-1 transition-all duration-300 ${level <= passwordStrength.level ? passwordStrength.color : "bg-transparent"}`} />
                    ))}
                  </div>
                  <div className="flex justify-between text-[10px] uppercase font-mono tracking-wider">
                      <span className="text-[var(--text-muted)]">SECURITY_LEVEL:</span>
                      <span style={{ color: passwordStrength.level >= 3 ? 'var(--status-success)' : 'var(--text-muted)' }}>{passwordStrength.text}</span>
                  </div>
                </div>
              )}
              
              {authMode === "signin" && (
                <div className="text-right mb-6">
                  <button onClick={() => { setAuthMode("forgot-password"); clearMessage(); }} className="text-[10px] md:text-xs text-[var(--text-subtle)] hover:text-[var(--accent-cyan)] uppercase tracking-widest font-mono transition-colors">
                    [ LOST CREDENTIALS? ]
                  </button>
                </div>
              )}
              
              <button
                onClick={authMode === "signup" ? handleSignUp : handleSignIn}
                disabled={loading}
                className={`w-full font-bold py-4 text-sm font-mono uppercase tracking-[0.2em] transition-all hover:translate-x-1 hover:-translate-y-1 shadow-[4px_4px_0px_rgba(255,255,255,0.1)] active:shadow-none active:translate-x-0 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed mb-6 border border-transparent ${
                   authMode === "signup" 
                     ? "bg-[var(--accent-gold)] hover:bg-[#ffdb70] text-black" 
                     : "bg-[var(--f1-red)] hover:bg-[#ff3333] text-white"
                }`}
              >
                {loading ? "PROCESSING..." : authMode === "signup" ? "APPLY FOR LICENSE" : "INITIATE SESSION"}
              </button>
              
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/5" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase font-mono">
                  <span className="bg-[#131518] px-2 text-[var(--text-subtle)] tracking-widest">ALTERNATE ACCESS</span>
                </div>
              </div>
              
              <button onClick={() => { setAuthMode("magic-link"); clearMessage(); }} className="w-full btn-ghost py-3 border border-white/10 hover:border-[var(--accent-cyan)] hover:text-[var(--accent-cyan)] mb-4 text-xs font-mono uppercase tracking-widest transition-all">
                KEYLESS ENTRY (MAGIC LINK)
              </button>

              <div className="text-center mb-4">
                 <Link href="/guide" className="text-[10px] text-[var(--accent-gold)] hover:text-white font-mono uppercase tracking-[0.2em] border-b border-[var(--accent-gold)]/30 hover:border-white transition-all pb-0.5">
                    [ REVIEW SYSTEM PROTOCOLS ]
                 </Link>
              </div>
              
              <div className="text-center mt-8 pt-6 border-t border-white/5">
                <button 
                  onClick={() => { setAuthMode(authMode === "signup" ? "signin" : "signup"); clearMessage(); }}
                  className="text-xs font-mono uppercase tracking-wider text-[var(--text-muted)] hover:text-white transition-colors group"
                >
                  {authMode === "signup" ? "Already have clearance? " : "Need a license? "}
                  <span className="text-[var(--accent-gold)] group-hover:underline ml-2">
                    {authMode === "signup" ? "LOGIN" : "REGISTER"}
                  </span>
                </button>
              </div>
            </>
          )}
          </div>
        </div>

        {/* Back to Home */}
        <div className="mt-8 text-center opacity-50 hover:opacity-100 transition-opacity">
          <Link href="/" className="text-[10px] text-[var(--text-subtle)] hover:text-white font-mono uppercase tracking-[0.3em]">
            [ ABORT TO HOME ]
          </Link>
        </div>
      </div>
      
      {/* CSS for Chamfered Card */}
      <style jsx global>{`
        .glass-card-auth {
          border-top-right-radius: 30px;
          border-bottom-left-radius: 30px;
        }
        .chamfered-card {
           clip-path: polygon(
             0 0, 
             100% 0, 
             100% calc(100% - 30px), 
             calc(100% - 30px) 100%, 
             0 100%
           );
        }
      `}</style>
    </div>
  );
}