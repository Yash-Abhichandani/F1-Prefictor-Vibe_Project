"use client";
import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter, useParams } from "next/navigation";
import LoadingSpinner from "../../components/LoadingSpinner";
import { TEAM_COLORS, DRIVERS_DATA_2026 } from "../../lib/drivers";
import { GRID_DATA } from "../../lib/gridData";
import DriverRadarChart from "../../components/DriverRadarChart";

// New Components
import ProfileIdentityCard from "../components/ProfileIdentityCard";
import ProfileTelemetry from "../components/ProfileTelemetry";

import { Profile, UserAchievement, Prediction, LeagueMember, FriendRequest } from "../../lib/types";

// Safe initialization of Supabase client
function useSupabase() {
  const [supabase] = useState(() => 
    createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  );
  return supabase;
}

export default function UserProfilePage() {
  const [currentUser, setCurrentUser] = useState<{ id: string } | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [achievements, setAchievements] = useState<UserAchievement[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [leagues, setLeagues] = useState<LeagueMember[]>([]);
  const [friends, setFriends] = useState<FriendRequest[]>([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingSecondary, setLoadingSecondary] = useState(true);
  
  // Edit Mode State (Only if currentUser.id === profile.id)
  const [isEditing, setIsEditing] = useState(false);
  const [editTeam, setEditTeam] = useState("");
  const [editDriver, setEditDriver] = useState("");
  const [editUsername, setEditUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  const router = useRouter();
  const params = useParams();
  const supabase = useSupabase();
  const targetUserId = params.id as string;

  useEffect(() => {
    const fetchData = async () => {
      try {
        // TIER 1: Critical Data (User + Profile)
        const fetchUser = supabase.auth.getUser();
        const fetchProfile = supabase
            .from("profiles")
            .select("*")
            .eq("id", targetUserId)
            .single();

        const [userRes, profileRes] = await Promise.all([fetchUser, fetchProfile]);
        
        const user = userRes.data.user;
        setCurrentUser(user);

        const profileData = profileRes.data;
        if (profileRes.error || !profileData) {
            console.error("Profile not found");
            setLoadingProfile(false);
            return;
        }

        setProfile(profileData);
        setLoadingProfile(false); // Render Shell immediately

        // Init edit state (only if owning)
        if (user && user.id === targetUserId) {
            setEditTeam(profileData.favorite_team || "");
            setEditDriver(profileData.favorite_driver || "");
            setEditUsername(profileData.username || "");
            if (!profileData.favorite_team) setIsEditing(true);
        }

        // TIER 2: Secondary Data (Parallel)
        const fetchAchievements = supabase
            .from("user_achievements")
            .select("*, achievements(*)")
            .eq("user_id", targetUserId);

        const fetchPredictions = supabase
            .from("predictions")
            .select("*, races(*)")
            .eq("user_id", targetUserId)
            .order("curr_created_at", { ascending: false, foreignTable: "races" })
            .limit(5);

        const fetchLeagues = supabase
            .from("league_members")
            .select("*, leagues(*)")
            .eq("user_id", targetUserId);

        const fetchFriends = supabase
            .from("friendships")
            .select("*, friend:profiles!friend_id(*)")
            .eq("user_id", targetUserId)
            .eq("status", "accepted");

        const [achievementsRes, predictionsRes, leaguesRes, friendsRes] = await Promise.all([
            fetchAchievements,
            fetchPredictions,
            fetchLeagues,
            fetchFriends
        ]);

        if (achievementsRes.data) setAchievements(achievementsRes.data);
        if (predictionsRes.data) setPredictions(predictionsRes.data);
        if (leaguesRes.data) setLeagues(leaguesRes.data);
        if (friendsRes.data) setFriends(friendsRes.data);

        // Retroactive Checks
        if (user && user.id === targetUserId && predictionsRes.data && predictionsRes.data.length > 0) {
            const hasFirstBadge = achievementsRes.data?.some((a: any) => a.achievement_id === 'first_prediction');
            if (!hasFirstBadge) {
               await supabase
                    .from('user_achievements')
                    .insert({ user_id: user.id, achievement_id: 'first_prediction' });
            }
        }

        setLoadingSecondary(false);

      } catch (error) {
        console.error("Profile Error:", error);
        setLoadingProfile(false);
      }
    };
    fetchData();
  }, [supabase, router, targetUserId]);

  const handleSaveProfile = async () => {
    if (!currentUser || currentUser.id !== targetUserId) return;
    setSaving(true);
    setMessage(null);

    try {
        const { error: profileError } = await supabase
            .from("profiles")
            .update({ 
                username: editUsername,
                favorite_team: editTeam,
                favorite_driver: editDriver
            })
            .eq("id", currentUser.id);

        if (profileError) throw profileError;

        if (newPassword) {
            if (newPassword.length < 6) throw new Error("Password must be at least 6 characters");
            const { error: authError } = await supabase.auth.updateUser({ password: newPassword });
            if (authError) throw authError;
        }

        setProfile({ 
            ...profile!, 
            username: editUsername, 
            favorite_team: editTeam, 
            favorite_driver: editDriver 
        } as Profile);
        setIsEditing(false);
        setNewPassword("");
        setMessage({ text: "Profile updated successfully!", type: 'success' });
        router.refresh(); 

    } catch (error: any) {
        setMessage({ text: error.message || "Failed to update profile", type: 'error' });
    } finally {
        setSaving(false);
    }
  };

  if (loadingProfile) return <LoadingSpinner variant="f1" message="Loading Dossier..." />;
  if (!profile) return <div className="text-white text-center pt-32 text-xl font-bold font-mono">ERROR: DOSSIER NOT FOUND</div>;

  const isOwner = currentUser?.id === targetUserId;

  // Display Logic
  const displayTeam = isEditing ? editTeam : profile.favorite_team;
  const userTeamKey = displayTeam?.toLowerCase().replace(/\s+/g, "") || "ferrari";
  
  // Resolve Team Config using the shared logic (similar to IdentityCard, but central)
  let teamConfig = GRID_DATA[userTeamKey];
  if (!teamConfig) {
       const foundKey = Object.keys(GRID_DATA).find(k => GRID_DATA[k].name.toLowerCase().includes(userTeamKey) || userTeamKey.includes(k));
       if (foundKey) teamConfig = GRID_DATA[foundKey];
  }
  if (!teamConfig) teamConfig = GRID_DATA["ferrari"];

  // Driver Number Logic
  let driverNumber = "00";
  if (profile.favorite_driver) {
      const dKey = Object.keys(teamConfig.drivers).find(k => teamConfig.drivers[k].name === profile.favorite_driver);
      if (dKey) driverNumber = teamConfig.drivers[dKey].number;
      else driverNumber = Object.values(teamConfig.drivers)[0]?.number || "01";
  } else {
      driverNumber = Object.values(teamConfig.drivers)[0]?.number || "01";
  }

  return (
    <div 
        className="min-h-screen relative w-full overflow-hidden bg-[#0F1115] transition-colors duration-700"
        style={{
            // @ts-ignore
            "--team-color": teamConfig.color,
            "--team-dim": `${teamConfig.color}15`, // 8% opacity
            "--team-glow": `${teamConfig.color}60` // 37% opacity
        }}
    >
        {/* === MEGA-NUMBER (FIXED LAYER) - Enhanced with Team Glow === */}
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
             {/* Team-colored ambient glow */}
             <div 
                 className="absolute -bottom-40 -right-40 w-[800px] h-[800px] rounded-full blur-[150px] opacity-20"
                 style={{ backgroundColor: teamConfig.color }}
             />
             {/* The massive driver number */}
             <span 
                className="absolute -bottom-20 -right-10 font-black italic leading-none select-none"
                style={{
                    fontSize: "clamp(20rem, 50vw, 50rem)",
                    color: "transparent",
                    WebkitTextStroke: `3px ${teamConfig.color}25`,
                    textShadow: `0 0 100px ${teamConfig.color}15`,
                    fontFamily: "var(--font-orbitron), sans-serif"
                }}
             >
                 {driverNumber}
             </span>
        </div>

        <div className="relative z-10 pt-24 pb-16 max-w-7xl mx-auto px-6 h-screen flex flex-col">
            
            {/* === UNIFIED DASHBOARD CONTAINER === */}
            <div className="flex-grow flex flex-col lg:flex-row border rounded-xl overflow-hidden shadow-2xl backdrop-blur-sm"
                 style={{ 
                     borderColor: "var(--team-dim)",
                     backgroundColor: "rgba(15, 17, 21, 0.85)"
                 }}
            >
                
                {/* === LEFT PANEL: IDENTITY (35%) === */}
                <div className="lg:w-[35%] flex flex-col border-b lg:border-b-0 lg:border-r"
                     style={{ borderColor: "var(--team-dim)" }}
                >
                    {!isEditing ? (
                        <div className="h-full p-6">
                           <ProfileIdentityCard 
                              profile={profile} 
                              isOwner={isOwner} 
                              onEdit={() => setIsEditing(true)} 
                              onSettings={() => router.push('/profile/settings')}
                           />
                        </div>
                    ) : (
                        <div className="h-full p-6 flex flex-col justify-center">
                            {/* === EDITOR === */}
                            <div className="bg-[var(--bg-onyx)] p-6 border rounded-xl flex flex-col gap-4 shadow-xl" style={{ borderColor: "var(--team-color)" }}>
                                <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-2">
                                    <h3 className="text-sm font-bold font-mono uppercase" style={{ color: "var(--team-color)" }}>// UPDATE_REGISTRY</h3>
                                    <button onClick={() => setIsEditing(false)} className="text-gray-500 hover:text-white">✕</button>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-[10px] text-gray-500 font-mono uppercase block mb-1">CALLSIGN</label>
                                        <input value={editUsername} onChange={e => setEditUsername(e.target.value)} className="font-mono text-xs w-full bg-black/30 border border-white/10 p-3 text-white focus:border-[var(--team-color)] outline-none" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-gray-500 font-mono uppercase block mb-1">TEAM_ALLEGIANCE</label>
                                        <select value={editTeam} onChange={e => setEditTeam(e.target.value)} className="font-mono text-xs w-full bg-black/30 border border-white/10 p-3 text-white focus:border-[var(--team-color)] outline-none appearance-none">
                                            {Object.keys(TEAM_COLORS).map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-gray-500 font-mono uppercase block mb-1">DRIVER_ID</label>
                                        <select value={editDriver} onChange={e => setEditDriver(e.target.value)} className="font-mono text-xs w-full bg-black/30 border border-white/10 p-3 text-white focus:border-[var(--team-color)] outline-none appearance-none">
                                            {DRIVERS_DATA_2026.map(d => <option key={d.name} value={d.name}>{d.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="pt-4 border-t border-white/10 mt-auto">
                                        <button onClick={handleSaveProfile} className="w-full text-black font-bold font-mono text-xs py-3 uppercase hover:brightness-110 shadow-lg tracking-wider" style={{ backgroundColor: "var(--team-color)" }}>
                                            {saving ? "UPLOADING..." : "COMMIT_CHANGES"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* === RIGHT PANEL: TELEMETRY (65%) === */}
                <div className="lg:w-[65%] p-6 bg-black/20">
                    <ProfileTelemetry 
                        profile={profile}
                        achievements={achievements}
                        predictions={predictions}
                    />
                </div>
                
            </div>
        </div>
    </div>
  );
}
