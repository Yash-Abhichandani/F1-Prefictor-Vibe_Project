"use client";
import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import RivalryCard from "../components/RivalryCard";
import GauntletModal from "../components/GauntletModal";
import { teamRadio } from "../components/TeamRadioToast";
import { DRIVERS_2026, getDriverTeam, TEAM_COLORS } from "../lib/drivers";

// Safe initialization of Supabase client in component
function useSupabase() {
  const [supabase] = useState(() => 
    createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  );
  return supabase;
}

interface Rivalry {
  id: number;
  challenger_id: string;
  challenger_name: string;
  opponent_id: string;
  opponent_name: string;
  challenger_driver: string;
  opponent_driver: string;
  race_duration: number;
  races_completed: number;
  challenger_points: number;
  opponent_points: number;
  status: 'pending' | 'active' | 'completed' | 'declined';
  created_at: string;
}

interface LeaderboardUser {
  id: string;
  username: string;
  total_score: number;
}

export default function RivalriesPage() {
  const [rivalries, setRivalries] = useState<Rivalry[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedOpponent, setSelectedOpponent] = useState<LeaderboardUser | null>(null);
  
  // Accept challenge state
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState<Rivalry | null>(null);
  const [acceptDriver, setAcceptDriver] = useState("");
  const [acceptLoading, setAcceptLoading] = useState(false);

  const supabase = useSupabase();

  const fetchRivalries = async () => {
    const { data, error } = await supabase
      .from("rivalries")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (!error && data) {
      setRivalries(data);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get current user
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser) {
          setUser({ id: authUser.id, email: authUser.email || "" });
        }

        // Fetch rivalries
        await fetchRivalries();

        // Fetch leaderboard for potential opponents
        const { data: profilesData, error: profilesError } = await supabase
          .from("profiles")
          .select("id, username, total_score")
          .order("total_score", { ascending: false })
          .limit(20);
        
        if (profilesError) console.error("Profiles Error:", profilesError);
        if (profilesData) setLeaderboard(profilesData);

      } catch (err) {
        console.error("Critical Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const myRivalries = rivalries.filter(
    r => r.challenger_id === user?.id || r.opponent_id === user?.id
  );

  const pendingChallenges = myRivalries.filter(
    r => r.status === 'pending' && r.opponent_id === user?.id
  );

  const sentChallenges = myRivalries.filter(
    r => r.status === 'pending' && r.challenger_id === user?.id
  );

  const activeRivalries = myRivalries.filter(r => r.status === 'active');
  const completedRivalries = myRivalries.filter(r => r.status === 'completed');

  const handleDeclineChallenge = async (rivalryId: number) => {
    const { error } = await supabase
      .from("rivalries")
      .update({ status: 'declined' })
      .eq("id", rivalryId);

    if (error) {
      teamRadio.error("Failed to decline challenge");
    } else {
      teamRadio.info("Challenge declined");
      await fetchRivalries();
    }
  };

  const handleAcceptChallenge = async () => {
    if (!acceptDriver) {
      teamRadio.error("Select your champion driver first!");
      return;
    }
    if (!selectedChallenge) return;

    setAcceptLoading(true);

    try {
      const { error } = await supabase
        .from("rivalries")
        .update({
          opponent_driver: acceptDriver,
          status: 'active',
          started_at: new Date().toISOString()
        })
        .eq("id", selectedChallenge.id);

      if (error) {
        teamRadio.error("Failed to accept challenge: " + error.message);
      } else {
        teamRadio.success(`Rivalry accepted! Game on! 🏁`);
        setShowAcceptModal(false);
        setSelectedChallenge(null);
        setAcceptDriver("");
        await fetchRivalries();
      }
    } catch (err) {
      console.error("Accept error:", err);
      teamRadio.error("Something went wrong");
    } finally {
      setAcceptLoading(false);
    }
  };

  const handleChallengeUser = (opponent: LeaderboardUser) => {
    if (!user) {
      teamRadio.error("Please log in to challenge opponents");
      return;
    }
    setSelectedOpponent(opponent);
    setShowModal(true);
  };

  const openAcceptModal = (challenge: Rivalry) => {
    setSelectedChallenge(challenge);
    setAcceptDriver("");
    setShowAcceptModal(true);
  };

  if (loading) {
    return (
       <div className="min-h-screen flex items-center justify-center bg-[#0B0C10] text-white font-orbitron">
          <span className="animate-pulse text-xl tracking-widest">LOADING RIVALRIES...</span>
       </div>
    );
  }

  const selectedTeam = acceptDriver ? getDriverTeam(acceptDriver) : null;
  const teamColor = selectedTeam ? TEAM_COLORS[selectedTeam] : "#66FCF1";

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B0C10] via-[#0d1117] to-[#1a1f2e]">
      
      {/* Header */}
      <section className="py-12 md:py-16 px-4 border-b border-[var(--glass-border)]">
        <div className="max-w-7xl mx-auto text-center">
          <span className="text-5xl mb-4 block">⚔️</span>
          <h1 className="font-orbitron text-4xl md:text-6xl font-black text-white mb-4">
            <span className="text-[var(--alert-red)]">RIVALRIES</span>
          </h1>
          <p className="font-mono text-[var(--text-muted)] max-w-2xl mx-auto">
            Challenge opponents to head-to-head duels. Pick your champion driver and battle for supremacy!
          </p>
        </div>
      </section>

      {/* Pending Challenges (Incoming) */}
      {pendingChallenges.length > 0 && (
        <section className="py-8 px-4 bg-[var(--alert-red)]/5">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-orbitron text-xl font-bold text-[var(--alert-red)] mb-6 flex items-center gap-3">
              <span className="w-1.5 h-8 bg-[var(--alert-red)] rounded-full animate-pulse" />
              INCOMING CHALLENGES ({pendingChallenges.length})
            </h2>
            
            <div className="space-y-4">
              {pendingChallenges.map(challenge => (
                <div 
                  key={challenge.id} 
                  className="glass-card p-6 rounded-xl border-2 border-[var(--alert-red)]/50 bg-[#1F2833]/80"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-xl bg-[var(--alert-red)]/20 flex items-center justify-center">
                        <span className="text-3xl">🔥</span>
                      </div>
                      <div>
                        <p className="font-orbitron text-xl font-bold text-white">
                          {challenge.challenger_name}
                        </p>
                        <p className="font-mono text-sm text-gray-400">
                          Champion: <span className="text-white">{challenge.challenger_driver}</span>
                        </p>
                        <p className="font-mono text-xs text-gray-500 mt-1">
                          {challenge.race_duration} race rivalry
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleDeclineChallenge(challenge.id)}
                        className="px-5 py-3 bg-gray-800 text-gray-300 font-bold rounded-xl hover:bg-gray-700 transition"
                      >
                        Decline
                      </button>
                      <button
                        onClick={() => openAcceptModal(challenge)}
                        className="px-6 py-3 bg-[var(--success-green)] text-black font-orbitron font-bold rounded-xl hover:brightness-110 transition flex items-center gap-2"
                      >
                        ⚔️ Accept
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Sent Challenges (Pending) */}
      {sentChallenges.length > 0 && (
        <section className="py-6 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-orbitron text-lg font-bold text-[var(--alert-amber)] mb-4 flex items-center gap-3">
              <span className="w-1.5 h-6 bg-[var(--alert-amber)] rounded-full" />
              AWAITING RESPONSE ({sentChallenges.length})
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {sentChallenges.map(challenge => (
                <div 
                  key={challenge.id} 
                  className="p-4 rounded-xl border border-[var(--alert-amber)]/30 bg-[#1F2833]/50 flex items-center gap-4"
                >
                  <div className="w-10 h-10 rounded-full bg-[var(--alert-amber)]/20 flex items-center justify-center">
                    <span>⏳</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-mono text-sm text-white">{challenge.opponent_name}</p>
                    <p className="font-mono text-xs text-gray-500">Waiting for response...</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Active Rivalries */}
      <section className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-orbitron text-xl font-bold text-[var(--success-green)] mb-6 flex items-center gap-3">
            <span className="w-1.5 h-8 bg-[var(--success-green)] rounded-full" />
            ACTIVE BATTLES ({activeRivalries.length})
          </h2>
          
          {activeRivalries.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeRivalries.map(rivalry => (
                <RivalryCard
                  key={rivalry.id}
                  player1={{
                    name: rivalry.challenger_name,
                    driver: rivalry.challenger_driver,
                    points: rivalry.challenger_points
                  }}
                  player2={{
                    name: rivalry.opponent_name,
                    driver: rivalry.opponent_driver || "",
                    points: rivalry.opponent_points
                  }}
                  races={rivalry.race_duration}
                />
              ))}
            </div>
          ) : (
            <div className="glass-card p-12 text-center border border-white/10 rounded-xl">
              <span className="text-5xl mb-4 block">🏁</span>
              <p className="font-orbitron text-xl text-[var(--text-silver)] mb-2">
                No Active Rivalries
              </p>
              <p className="font-mono text-sm text-gray-500">
                Challenge someone below to start a rivalry!
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Challenge New Opponent */}
      <section className="py-8 px-4 border-t border-[var(--glass-border)]">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-orbitron text-xl font-bold text-white mb-6 flex items-center gap-3">
            <span className="w-1.5 h-8 bg-[var(--accent-cyan)] rounded-full" />
            THROW THE GAUNTLET
          </h2>
          
          {leaderboard.filter(u => u.id !== user?.id).length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {leaderboard
                .filter(u => u.id !== user?.id)
                .slice(0, 10)
                .map((opponent, index) => (
                  <div 
                    key={opponent.id}
                    className="glass-card p-4 flex items-center justify-between hover:border-[var(--accent-cyan)] transition-all cursor-pointer group rounded-xl border border-white/10 bg-white/5"
                    onClick={() => handleChallengeUser(opponent)}
                  >
                    <div className="flex items-center gap-4">
                      <span className="font-orbitron text-2xl font-black text-gray-500">#{index + 1}</span>
                      <div>
                        <p className="font-orbitron font-bold text-white">{opponent.username}</p>
                        <p className="font-mono text-xs text-[var(--text-muted)]">{opponent.total_score} pts</p>
                      </div>
                    </div>
                    <button className="px-4 py-2 bg-red-600 text-white font-bold rounded hover:bg-red-700 transition">
                      ⚔️ VS
                    </button>
                  </div>
                ))}
            </div>
          ) : (
            <div className="glass-card p-8 text-center border border-white/10 rounded-xl">
              <p className="font-mono text-gray-400">No other users to challenge yet!</p>
            </div>
          )}
        </div>
      </section>

      {/* Gauntlet Modal (Create Challenge) */}
      <GauntletModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedOpponent(null);
        }}
        currentUser={{
          id: user?.id || "",
          name: user?.email?.split("@")[0] || "You"
        }}
        opponent={selectedOpponent ? {
          id: selectedOpponent.id,
          name: selectedOpponent.username
        } : undefined}
        onSuccess={fetchRivalries}
      />

      {/* Accept Challenge Modal */}
      {showAcceptModal && selectedChallenge && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.9)' }}
        >
          <div className="absolute inset-0" onClick={() => setShowAcceptModal(false)} />
          
          <div className="relative z-10 w-full max-w-lg bg-[#1F2833] rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
            
            <div 
              className="p-6 border-b border-white/10"
              style={{ 
                background: `linear-gradient(135deg, ${teamColor}20 0%, transparent 100%)`
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-4xl mb-2 block">⚔️</span>
                  <h2 className="font-orbitron text-2xl font-black text-white">
                    ACCEPT CHALLENGE
                  </h2>
                  <p className="font-mono text-sm text-gray-400 mt-1">
                    vs <span className="text-[var(--alert-red)] font-bold">{selectedChallenge.challenger_name}</span>
                  </p>
                </div>
                <button 
                  onClick={() => setShowAcceptModal(false)}
                  className="text-gray-400 hover:text-white text-2xl font-bold transition"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="p-4 bg-black/30 rounded-xl border border-white/5">
                <p className="text-sm text-gray-400">
                  <span className="text-white font-bold">{selectedChallenge.challenger_name}</span> has picked 
                  <span className="text-[var(--accent-cyan)] font-bold"> {selectedChallenge.challenger_driver}</span> 
                  {" "}as their champion. Now pick yours!
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                  🏎️ Select Your Champion Driver
                </label>
                <select
                  value={acceptDriver}
                  onChange={(e) => setAcceptDriver(e.target.value)}
                  className="w-full p-4 bg-[#0B0C10] border border-gray-700 rounded-xl text-white focus:border-[var(--success-green)] outline-none appearance-none text-lg font-mono"
                  style={{ 
                    borderColor: acceptDriver ? teamColor : undefined,
                    boxShadow: acceptDriver ? `0 0 10px ${teamColor}40` : undefined
                  }}
                >
                  <option value="">Choose a driver...</option>
                  {DRIVERS_2026.map(driver => (
                    <option key={driver} value={driver}>{driver}</option>
                  ))}
                </select>
                
                {acceptDriver && (
                  <div 
                    className="mt-2 px-3 py-1.5 rounded-full inline-flex items-center gap-2 text-xs font-bold"
                    style={{ backgroundColor: `${teamColor}30`, color: teamColor }}
                  >
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: teamColor }} />
                    {selectedTeam}
                  </div>
                )}
              </div>

              <div className="p-4 bg-black/30 rounded-xl border border-white/5">
                <p className="text-xs text-gray-400 leading-relaxed">
                  <span className="text-white font-bold">Rivalry Terms:</span> {selectedChallenge.race_duration} races. 
                  Points tallied from prediction scores. May the best predictor win! 🏆
                </p>
              </div>
            </div>

            <div className="p-6 border-t border-white/10 bg-black/20">
              <div className="flex gap-3">
                <button
                  onClick={() => setShowAcceptModal(false)}
                  className="flex-1 py-3 px-6 bg-gray-800 text-white font-bold rounded-xl hover:bg-gray-700 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAcceptChallenge}
                  disabled={acceptLoading || !acceptDriver}
                  className="flex-1 py-3 px-6 bg-[var(--success-green)] text-black font-orbitron font-bold rounded-xl hover:brightness-110 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {acceptLoading ? (
                    <>
                      <span className="animate-spin">⟳</span>
                      Accepting...
                    </>
                  ) : (
                    <>⚔️ Accept & Fight!</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
