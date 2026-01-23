import { createClient } from "../lib/supabase-server";
import HomeClient from "./components/HomeClient";
import { getNextRace, getLastRaceResults } from "./services/jolpica";
import { Race } from "./lib/types";

// Force dynamic behavior since we check the date for NEXT race
export const dynamic = 'force-dynamic';

async function getNextRaceData() {
  const race = await getNextRace();
  if (!race) return null;

  // Map Jolpica format to our internal Race type
  return {
    id: Number(race.round), // Use round as ID for now
    name: race.raceName,
    circuit: race.Circuit.circuitName,
    race_time: `${race.date}T${race.time || "14:00:00Z"}`,
    city: race.Circuit.Location.locality,
    country: race.Circuit.Location.country
  };
}

async function getPreviousResults() {
    const { results } = await getLastRaceResults();
    return results.slice(0, 3).map((r: any) => ({
        position: r.position,
        Driver: {
            code: r.Driver.code,
            givenName: r.Driver.givenName,
            familyName: r.Driver.familyName
        },
        Constructor: {
            name: r.Constructor.name
        },
        Time: {
            time: r.Time?.time || r.status // Fallback to status if DNF/Lapped
        }
    }));
}

async function getUserStandings() {
    const supabase = await createClient();
    try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;
        
        // Get all users ordered by score to find rank
        const { data: profiles } = await supabase
            .from('profiles')
            .select('id, total_score')
            .order('total_score', { ascending: false });
        
        if (!profiles) return null;
        
        const userIndex = profiles.findIndex(p => p.id === user.id);
        if (userIndex === -1) return null;
        
        return {
            rank: userIndex + 1,
            total: profiles.length,
            score: profiles[userIndex].total_score || 0
        };
    } catch (e) {
        console.error("Failed to fetch user standings", e);
        return null;
    }
}

export default async function Home() {
  const [nextRace, lastResults, userStandings] = await Promise.all([
      getNextRaceData(),
      getPreviousResults(),
      getUserStandings()
  ]);

  return <HomeClient nextRace={nextRace} lastResults={lastResults} userStandings={userStandings} />;
}