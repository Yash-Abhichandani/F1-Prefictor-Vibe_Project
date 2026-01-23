"use client";
import { createBrowserClient } from "@supabase/ssr";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const router = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Check if user has a valid session from the reset link
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsValidSession(!!session);
      setCheckingSession(false);
    };
    checkSession();

    // Listen for auth changes (when user clicks the reset link)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        setIsValidSession(true);
        setCheckingSession(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Password strength checker
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { level: 0, text: "", color: "" };
    let score = 0;
    if (pass.length >= 8) score++;
    if (pass.length >= 12) score++;
    if (/[a-z]/.test(pass) && /[A-Z]/.test(pass)) score++;
    if (/\d/.test(pass)) score++;
    if (/[^a-zA-Z0-9]/.test(pass)) score++;
    
    if (score <= 1) return { level: 1, text: "Weak", color: "bg-red-500" };
    if (score <= 2) return { level: 2, text: "Fair", color: "bg-orange-500" };
    if (score <= 3) return { level: 3, text: "Good", color: "bg-yellow-500" };
    return { level: 4, text: "Strong", color: "bg-green-500" };
  };

  const passwordStrength = getPasswordStrength(password);

  const handleResetPassword = async () => {
    if (!password || !confirmPassword) {
      setMessage({ type: "error", text: "Please fill in all fields" });
      return;
    }
    if (password.length < 6) {
      setMessage({ type: "error", text: "Password must be at least 6 characters" });
      return;
    }
    if (password !== confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match" });
      return;
    }

    setLoading(true);
    setMessage(null);

    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    setLoading(false);

    if (error) {
      setMessage({ type: "error", text: error.message });
    } else {
      setMessage({ type: "success", text: "Password updated successfully! Redirecting..." });
      setTimeout(() => {
        router.push("/");
        router.refresh();
      }, 2000);
    }
  };

  // Loading state while checking session
  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-void)] font-mono">
        <div className="flex flex-col items-center gap-4">
             <div className="w-12 h-12 border-4 border-[var(--f1-red)] border-t-transparent rounded-full animate-spin"></div>
             <div className="text-[var(--text-muted)] text-sm font-mono tracking-widest animate-pulse">VERIFYING SECURTY TOKEN...</div>
        </div>
      </div>
    );
  }

  // No valid session - show error
  if (!isValidSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-void)] font-mono p-4">
        <div className="relative backdrop-blur-xl bg-[rgba(15,17,21,0.6)] border border-[var(--f1-red)] p-8 md:p-12 shadow-[0_20px_50px_rgba(255,24,1,0.1)] overflow-hidden max-w-md w-full">
            <div className="absolute inset-0 pointer-events-none border border-white/5 rounded-tr-[30px] rounded-bl-[30px]"></div>
            
            <div className="text-6xl mb-6 text-center">🚫</div>
            <h1 className="text-2xl font-black mb-4 text-white font-display uppercase tracking-tight text-center">
              ACCESS DENIED
            </h1>
            <p className="text-[var(--text-muted)] mb-8 text-center text-xs uppercase tracking-widest">
              INVALID_TOKEN // SESSION_EXPIRED
            </p>
            <Link
              href="/login"
              className="block w-full text-center bg-[var(--f1-red)] text-white py-4 text-sm font-mono uppercase tracking-widest hover:bg-[var(--f1-red-bright)] transition-all font-bold"
            >
              RETURN TO GATE
            </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-void)] font-mono p-4 relative overflow-hidden selection:bg-[var(--accent-cyan)] selection:text-black">
      {/* Background Elements */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[var(--f1-red)] opacity-[0.04] blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[var(--accent-cyan)] opacity-[0.03] blur-[100px] rounded-full -translate-x-1/3 translate-y-1/3 pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-md">
        
        <div className="relative backdrop-blur-xl bg-[rgba(15,17,21,0.6)] border border-white/10 p-8 md:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden">
             
            {/* Chamfered Styling */}
            <div className="absolute inset-0 pointer-events-none border border-white/5 rounded-tr-[30px] rounded-bl-[30px]"></div>

            
            {/* Corner Brackets */}
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[var(--accent-cyan)] opacity-50"></div>
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[var(--f1-red)] opacity-50 rounded-tr-[28px]"></div>
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[var(--f1-red)] opacity-50 rounded-bl-[28px]"></div>
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[var(--accent-cyan)] opacity-50"></div>

            <h1 className="text-3xl font-black mb-2 text-white font-display uppercase tracking-tighter leading-none">
              NEW PASSWORD
            </h1>
            <p className="text-[var(--text-muted)] text-center w-full md:text-left mb-8 text-xs font-mono uppercase tracking-widest">
              // CREDENTIAL_UPDATE_SEQUENCE
            </p>
            
            {/* Message Display */}
            {message && (
              <div
                className={`mb-6 p-4 text-xs font-mono uppercase tracking-wide border-l-2 flex items-start gap-3 ${
                  message.type === "success"
                    ? "bg-[rgba(16,185,129,0.1)] border-[var(--status-success)] text-[var(--status-success)]"
                    : "bg-[rgba(255,24,1,0.1)] border-[var(--f1-red)] text-[var(--f1-red)]"
                }`}
              >
                <span className="font-bold">{message.type === "success" ? "[SUCCESS]" : "[ERROR]"}</span>
                <span>{message.text}</span>
              </div>
            )}
            
            {/* New Password Field */}
            <div className="mb-4">
              <label className="block text-[10px] text-[var(--text-muted)] uppercase tracking-[0.15em] mb-2 font-bold">NEW_CREDENTIAL</label>
              <div className="relative">
                <input
                    className="w-full bg-[#1A1D21] border border-[#333] text-white p-4 text-sm font-mono focus:outline-none focus:border-[var(--accent-cyan)] focus:shadow-[0_0_15px_rgba(0,212,255,0.2)] transition-all placeholder:text-white/20 rounded-none pr-12"
                    type={showPassword ? "text" : "password"}
                    placeholder="ENTER NEW PASSWORD"
                    onChange={(e) => { setPassword(e.target.value); setMessage(null); }}
                    value={password}
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
            
            {/* Password Strength Indicator */}
            {password && (
              <div className="mb-6">
                <div className="flex gap-1 mb-2 h-1 bg-[#111]">
                  {[1, 2, 3, 4].map((level) => (
                    <div
                      key={level}
                      className={`flex-1 transition-all duration-300 ${
                        level <= passwordStrength.level ? passwordStrength.color : "bg-transparent"
                      }`}
                    />
                  ))}
                </div>
                <div className="flex justify-between text-[10px] uppercase font-mono tracking-wider">
                    <span className="text-[var(--text-muted)]">SECURITY_LEVEL:</span>
                    <span style={{ color: passwordStrength.level >= 3 ? 'var(--status-success)' : 'var(--text-muted)' }}>{passwordStrength.text}</span>
                </div>
              </div>
            )}
            
            {/* Confirm Password Field */}
            <div className="mb-6">
               <label className="block text-[10px] text-[var(--text-muted)] uppercase tracking-[0.15em] mb-2 font-bold">CONFIRM_CREDENTIAL</label>
               <input
                className="w-full bg-[#1A1D21] border border-[#333] text-white p-4 text-sm font-mono focus:outline-none focus:border-[var(--accent-cyan)] focus:shadow-[0_0_15px_rgba(0,212,255,0.2)] transition-all placeholder:text-white/20 rounded-none"
                type={showPassword ? "text" : "password"}
                placeholder="REPEAT NEW PASSWORD"
                onChange={(e) => { setConfirmPassword(e.target.value); setMessage(null); }}
                value={confirmPassword}
              />
            </div>
            
            {/* Password Match Indicator */}
            {confirmPassword && (
              <div className={`-mt-2 mb-6 text-[10px] uppercase tracking-wider font-mono ${password === confirmPassword ? "text-[var(--status-success)]" : "text-[var(--f1-red)]"}`}>
                {password === confirmPassword ? "[ ✓ MATCH CONFIRMED ]" : "[ ✕ MISMATCH DETECTED ]"}
              </div>
            )}
            
            {/* Submit Button */}
            <button
              onClick={handleResetPassword}
              disabled={loading}
              className="w-full bg-[var(--accent-cyan)] hover:bg-[#33ddff] text-black font-bold py-4 text-sm font-mono uppercase tracking-widest transition-all hover:translate-x-1 hover:-translate-y-1 shadow-[4px_4px_0px_rgba(255,255,255,0.1)] active:shadow-none active:translate-x-0 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mb-6"
            >
              {loading ? (
                <>PROCESSING...</>
              ) : (
                <>UPDATE SECURITY KEY</>
              )}
            </button>
            
            {/* Back to Login Link */}
            <div className="text-center">
              <Link href="/login" className="text-[10px] text-[var(--text-subtle)] hover:text-white transition uppercase tracking-[0.2em] font-mono">
                [ ABORT TO LOGIN ]
              </Link>
            </div>
            
        </div>
      </div>
      <style jsx global>{`
        .glass-card-auth {
          border-top-right-radius: 30px;
          border-bottom-left-radius: 30px;
        }
      `}</style>
    </div>
  );
}
