"use client";
import { createBrowserClient } from "@supabase/ssr";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type AuthMode = "signin" | "signup" | "magic-link" | "forgot-password";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authMode, setAuthMode] = useState<AuthMode>("signin");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const clearMessage = () => setMessage(null);

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

  // Sign Up with Email/Password
  const handleSignUp = async () => {
    if (!email || !password) {
      setMessage({ type: "error", text: "Please fill in all fields" });
      return;
    }
    if (password.length < 6) {
      setMessage({ type: "error", text: "Password must be at least 6 characters" });
      return;
    }
    
    setLoading(true);
    clearMessage();
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
    });
    
    setLoading(false);
    
    if (error) {
      setMessage({ type: "error", text: error.message });
    } else {
      setMessage({ type: "success", text: "Check your email for the confirmation link!" });
    }
  };

  // Sign In with Email/Password
  const handleSignIn = async () => {
    if (!email || !password) {
      setMessage({ type: "error", text: "Please fill in all fields" });
      return;
    }
    
    setLoading(true);
    clearMessage();
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    setLoading(false);
    
    if (error) {
      setMessage({ type: "error", text: error.message });
    } else {
      router.push("/");
      router.refresh();
    }
  };

  // Magic Link (OTP) Authentication
  const handleMagicLink = async () => {
    if (!email) {
      setMessage({ type: "error", text: "Please enter your email address" });
      return;
    }
    
    setLoading(true);
    clearMessage();
    
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
    });
    
    setLoading(false);
    
    if (error) {
      setMessage({ type: "error", text: error.message });
    } else {
      setMessage({ type: "success", text: "Magic link sent! Check your email to sign in." });
    }
  };

  // Forgot Password
  const handleForgotPassword = async () => {
    if (!email) {
      setMessage({ type: "error", text: "Please enter your email address" });
      return;
    }
    
    setLoading(true);
    clearMessage();
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${location.origin}/reset-password`,
    });
    
    setLoading(false);
    
    if (error) {
      setMessage({ type: "error", text: error.message });
    } else {
      setMessage({ type: "success", text: "Password reset link sent! Check your email." });
    }
  };

  // Render different form based on auth mode
  const renderForm = () => {
    switch (authMode) {
      case "magic-link":
        return (
          <>
            <h1 className="text-3xl font-black mb-2 text-center text-white font-orbitron tracking-wide">
              MAGIC LINK
            </h1>
            <p className="text-gray-400 text-center mb-8 text-sm">
              Sign in without a password
            </p>
            
            <input
              className="w-full bg-[#0B0C10] border border-gray-600 p-3 mb-4 rounded text-white focus:border-red-500 outline-none transition"
              type="email"
              placeholder="Email Address"
              onChange={(e) => { setEmail(e.target.value); clearMessage(); }}
              value={email}
            />
            
            <button
              onClick={handleMagicLink}
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white p-3 rounded font-bold hover:from-purple-700 hover:to-pink-700 transition shadow-[0_0_15px_rgba(147,51,234,0.4)] mb-4 uppercase tracking-widest font-orbitron disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <><span className="animate-spin">⟳</span> Sending...</>
              ) : (
                <>✨ Send Magic Link</>
              )}
            </button>
            
            <div className="text-center text-sm text-gray-400">
              <button 
                onClick={() => { setAuthMode("signin"); clearMessage(); }}
                className="text-red-400 hover:text-white font-bold transition"
              >
                ← Back to Sign In
              </button>
            </div>
          </>
        );
        
      case "forgot-password":
        return (
          <>
            <h1 className="text-3xl font-black mb-2 text-center text-white font-orbitron tracking-wide">
              RESET PASSWORD
            </h1>
            <p className="text-gray-400 text-center mb-8 text-sm">
              We'll send you a reset link
            </p>
            
            <input
              className="w-full bg-[#0B0C10] border border-gray-600 p-3 mb-4 rounded text-white focus:border-red-500 outline-none transition"
              type="email"
              placeholder="Email Address"
              onChange={(e) => { setEmail(e.target.value); clearMessage(); }}
              value={email}
            />
            
            <button
              onClick={handleForgotPassword}
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-3 rounded font-bold hover:from-blue-700 hover:to-cyan-700 transition shadow-[0_0_15px_rgba(37,99,235,0.4)] mb-4 uppercase tracking-widest font-orbitron disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <><span className="animate-spin">⟳</span> Sending...</>
              ) : (
                <>🔐 Send Reset Link</>
              )}
            </button>
            
            <div className="text-center text-sm text-gray-400">
              <button 
                onClick={() => { setAuthMode("signin"); clearMessage(); }}
                className="text-red-400 hover:text-white font-bold transition"
              >
                ← Back to Sign In
              </button>
            </div>
          </>
        );
        
      default: // signin or signup
        return (
          <>
            <h1 className="text-3xl font-black mb-2 text-center text-white font-orbitron tracking-wide">
              {authMode === "signup" ? "JOIN THE GRID" : "WELCOME BACK"}
            </h1>
            <p className="text-gray-400 text-center mb-8 text-sm">
              {authMode === "signup" ? "Create your predictor profile" : "Sign in to continue"}
            </p>
            
            <input
              className="w-full bg-[#0B0C10] border border-gray-600 p-3 mb-4 rounded text-white focus:border-red-500 outline-none transition"
              type="email"
              placeholder="Email Address"
              onChange={(e) => { setEmail(e.target.value); clearMessage(); }}
              value={email}
            />
            
            {/* Password field with show/hide toggle */}
            <div className="relative mb-2">
              <input
                className="w-full bg-[#0B0C10] border border-gray-600 p-3 rounded text-white focus:border-red-500 outline-none transition pr-12"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                onChange={(e) => { setPassword(e.target.value); clearMessage(); }}
                value={password}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition"
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
            
            {/* Password Strength Indicator (only on signup) */}
            {authMode === "signup" && password && (
              <div className="mb-4">
                <div className="flex gap-1 mb-1">
                  {[1, 2, 3, 4].map((level) => (
                    <div
                      key={level}
                      className={`h-1 flex-1 rounded ${
                        level <= passwordStrength.level ? passwordStrength.color : "bg-gray-700"
                      }`}
                    />
                  ))}
                </div>
                <p className={`text-xs ${passwordStrength.level <= 1 ? "text-red-400" : passwordStrength.level <= 2 ? "text-orange-400" : passwordStrength.level <= 3 ? "text-yellow-400" : "text-green-400"}`}>
                  {passwordStrength.text}
                </p>
              </div>
            )}
            
            {/* Forgot Password Link (only on signin) */}
            {authMode === "signin" && (
              <div className="text-right mb-4">
                <button
                  onClick={() => { setAuthMode("forgot-password"); clearMessage(); }}
                  className="text-sm text-gray-500 hover:text-red-400 transition"
                >
                  Forgot Password?
                </button>
              </div>
            )}
            
            {authMode === "signup" && <div className="mb-4" />}
            
            {/* Primary Action Button */}
            <button
              onClick={authMode === "signup" ? handleSignUp : handleSignIn}
              disabled={loading}
              className="w-full bg-red-600 text-white p-3 rounded font-bold hover:bg-red-700 transition shadow-[0_0_15px_rgba(220,38,38,0.4)] mb-4 uppercase tracking-widest font-orbitron disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <><span className="animate-spin">⟳</span> {authMode === "signup" ? "Creating..." : "Signing In..."}</>
              ) : (
                authMode === "signup" ? "Create Account" : "Sign In"
              )}
            </button>
            
            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[#1F2833] px-4 text-gray-500">or continue with</span>
              </div>
            </div>
            
            {/* Magic Link Button */}
            <button
              onClick={() => { setAuthMode("magic-link"); clearMessage(); }}
              className="w-full bg-[#0B0C10] border border-gray-600 text-white p-3 rounded font-bold hover:border-purple-500 hover:text-purple-400 transition mb-4 uppercase tracking-widest text-sm flex items-center justify-center gap-2"
            >
              ✨ Magic Link (No Password)
            </button>
            
            {/* Toggle Sign In / Sign Up */}
            <div className="text-center text-sm text-gray-400">
              {authMode === "signup" ? "Already have an account? " : "Don't have an account? "}
              <button 
                onClick={() => { setAuthMode(authMode === "signup" ? "signin" : "signup"); clearMessage(); }}
                className="text-red-400 hover:text-white font-bold underline transition"
              >
                {authMode === "signup" ? "Sign In" : "Sign Up"}
              </button>
            </div>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B0C10] font-sans p-4">
      <div className="bg-[#1F2833] p-8 rounded-xl shadow-2xl w-full max-w-md border border-gray-700">
        
        {/* Message Display */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg text-sm font-medium flex items-start gap-3 ${
              message.type === "success"
                ? "bg-green-900/30 border border-green-700 text-green-400"
                : "bg-red-900/30 border border-red-700 text-red-400"
            }`}
          >
            <span className="text-lg">{message.type === "success" ? "✓" : "✕"}</span>
            <span>{message.text}</span>
          </div>
        )}
        
        {renderForm()}
        
        {/* Back to Home Link */}
        <div className="mt-6 text-center">
          <Link href="/" className="text-xs text-gray-600 hover:text-gray-400 transition">
            ← Back to Home
          </Link>
        </div>
        
      </div>
    </div>
  );
}