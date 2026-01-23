"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import MobileMenu from "./MobileMenu";
import NotificationBell from "./NotificationBell";
import StreakBadge from "./StreakBadge";
import { TEAM_COLORS } from "../lib/drivers";

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    // Non-blocking auth check
    const getUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error || !user) {
           // Silent fail for no session
           setUser(null);
           setProfile(null);
           if (error && !error.message.includes("Auth session missing")) {
              // Only log real errors
              console.debug("Auth check failed:", error.message);
           }
           if (error) {
             supabase.auth.signOut().then(() => {}, () => {});
           }
        } else {
           setUser(user);
           // Profile fetch in background
           supabase.from('profiles').select('*').eq('id', user.id).single()
             .then(({ data }) => setProfile(data), () => {});
        }
      } catch (err) {
        console.error("Auth exception:", err);
        setUser(null);
        setProfile(null);
      }
    };
    
    // Defer auth check to not block initial render
    if (typeof requestIdleCallback !== 'undefined') {
      requestIdleCallback(() => getUser());
    } else {
      setTimeout(getUser, 0);
    }
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          supabase.from('profiles').select('*').eq('id', session.user.id).single()
            .then(({ data }) => setProfile(data), () => {});
        } else {
          setProfile(null);
        }
        if (event === 'SIGNED_OUT') router.refresh();
    });

    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push("/");
    router.refresh();
  };

  const baseNavLinks = [
    { href: '/calendar', label: 'Calendar', icon: '📅' },
    { href: '/leaderboard', label: 'Leaderboard', icon: '🏆' },
    { href: '/standings', label: 'Standings', icon: '📊' },
    { href: '/leagues', label: 'Leagues', icon: '👥' },
    { href: '/rivalries', label: 'Rivalries', icon: '⚔️' },
    { href: '/friends', label: 'Friends', icon: '👋' },
  ];

  const navLinks = profile?.is_admin 
    ? [...baseNavLinks, { href: '/admin', label: 'Admin', icon: '⚡' }]
    : baseNavLinks;

  return (
    <>
      <nav className={`
        fixed top-0 left-0 right-0 z-50
        transition-all duration-500 ease-out border-b
        ${scrolled 
          ? 'bg-[#0a0a0c]/80 backdrop-blur-xl border-white/10 shadow-2xl py-3' 
          : 'bg-transparent border-transparent py-5'
        }
      `}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center">
            
            {/* Left: Logo */}
            <Link href="/" className="flex items-center gap-4 group">
              <div className="relative w-10 h-10 rounded-full overflow-hidden border border-white/20 group-hover:border-[var(--f1-red)] transition-colors duration-300">
                <Image 
                  src="/logo.png" 
                  alt="F1 Apex" 
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              <span className="font-orbitron font-bold text-lg tracking-wider text-white group-hover:text-[var(--f1-red)] transition-colors">
                F1 APEX
              </span>
            </Link>

            {/* Center: Navigation */}
            <div className="hidden lg:flex items-center bg-[#0F1115]/80 rounded-full px-2 py-1 border border-[var(--glass-border)] backdrop-blur-md shadow-lg">
              {navLinks.map((link) => (
                <Link 
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 text-sm font-mono transition-all duration-300 relative group flex items-center ${
                    link.href === '/admin' 
                      ? 'text-[var(--f1-red)] font-bold tracking-wider' 
                      : 'text-[var(--text-secondary)] hover:text-white'
                  }`}
                >
                  <span className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-[var(--accent-cyan)] font-bold mr-1">[</span>
                  <span className="relative z-10 tracking-wide uppercase text-xs">{link.label}</span>
                  <span className="opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-[var(--accent-cyan)] font-bold ml-1">]</span>
                  
                  {/* Active Indicator (optional, sticking to hover brackets for now) */}
                </Link>
              ))}
            </div>

            {/* Right: Auth */}
            <div className="flex items-center gap-4">
              {user ? (
                <div className="flex items-center gap-4">
                  <StreakBadge userId={user.id} />
                  <NotificationBell />
                  
                  <Link href="/profile" className="flex items-center gap-3 pl-4 border-l border-white/10 group">
                    <div className="hidden md:flex flex-col items-end">
                      <span className="text-xs font-bold text-white group-hover:text-[var(--accent-gold)] transition-colors">
                        {profile?.username || "Racer"}
                      </span>
                      <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">
                         {profile?.favorite_team || "Rookie"}
                      </span>
                    </div>
                    <div 
                        className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg ring-2 ring-transparent group-hover:ring-[var(--accent-gold)] transition-all"
                        style={{ background: profile?.favorite_team ? TEAM_COLORS[profile.favorite_team] : '#333' }}
                    >
                      {profile?.username ? profile.username.charAt(0).toUpperCase() : "U"}
                    </div>
                  </Link>

                  {/* Desktop Logout - Discrete */}
                  <button 
                    onClick={handleLogout}
                    className="hidden lg:flex w-8 h-8 items-center justify-center text-[var(--text-muted)] hover:text-[var(--f1-red)] transition-colors rounded-full hover:bg-white/5"
                    title="Log Out"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  </button>
                </div>
              ) : (
                <Link 
                  href="/login" 
                  className="bg-white text-black hover:bg-[var(--accent-gold)] px-4 py-2 md:px-6 md:py-2 rounded-full font-bold text-xs md:text-sm transition-colors whitespace-nowrap mr-2 lg:mr-0"
                >
                  <span className="md:hidden">Login</span>
                  <span className="hidden md:inline">Get Started</span>
                </Link>
              )}

              {/* Mobile Toggle */}
              <button 
                onClick={() => setIsMobileMenuOpen(true)}
                onTouchStart={() => setIsMobileMenuOpen(true)}
                className="lg:hidden text-white p-2 -m-2 touch-manipulation"
                aria-label="Open menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>
      
      <MobileMenu 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)}
        user={user}
        profile={profile}
        onLogout={handleLogout}
      />
    </>
  );
}