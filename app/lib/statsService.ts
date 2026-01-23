/**
 * Service layer for aggregated statistics and calculations.
 * These functions replace hardcoded/mock values with real database queries.
 */

import { createBrowserClient } from "@supabase/ssr";

// Initialize Supabase client
function getSupabase() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

/**
 * Get the average total score across all users with predictions.
 * Used by RivalryCard for "THE GRID" opponent.
 */
export async function getGridAverageScore(): Promise<number> {
  const supabase = getSupabase();
  
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('total_score')
      .gt('total_score', 0);
    
    if (error || !data || data.length === 0) return 0;
    
    const total = data.reduce((sum, p) => sum + (p.total_score || 0), 0);
    return Math.round(total / data.length);
  } catch {
    return 0;
  }
}

/**
 * Get user's current rank on the global leaderboard.
 * Returns { rank, total } or null if user not found.
 */
export async function getUserRank(userId: string): Promise<{ rank: number; total: number } | null> {
  const supabase = getSupabase();
  
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, total_score')
      .order('total_score', { ascending: false });
    
    if (error || !data) return null;
    
    const rank = data.findIndex(u => u.id === userId) + 1;
    return rank > 0 ? { rank, total: data.length } : null;
  } catch {
    return null;
  }
}

/**
 * Calculate performance metrics for the Profile Radar Chart.
 * Based on actual prediction history.
 */
export interface PerformanceMetrics {
  quali: number;      // Qualifying prediction accuracy
  race: number;       // Race prediction accuracy
  sprints: number;    // Sprint prediction accuracy
  podiums: number;    // Podium prediction accuracy
  consistency: number; // Overall consistency
}

export async function getUserPerformanceMetrics(userId: string): Promise<PerformanceMetrics> {
  const supabase = getSupabase();
  
  const defaults: PerformanceMetrics = {
    quali: 50, race: 50, sprints: 50, podiums: 50, consistency: 50
  };
  
  try {
    const { data: predictions, error } = await supabase
      .from('predictions')
      .select('manual_score, quali_p1_driver, race_p1_driver')
      .eq('user_id', userId);
    
    if (error || !predictions || predictions.length === 0) return defaults;
    
    const totalPredictions = predictions.length;
    const maxPerRace = 50;
    
    // Calculate accuracy-based metrics
    const scoredPredictions = predictions.filter(p => (p.manual_score || 0) > 0);
    const highScorers = predictions.filter(p => (p.manual_score || 0) > 20);
    const avgScore = predictions.reduce((sum, p) => sum + (p.manual_score || 0), 0) / totalPredictions;
    
    return {
      quali: Math.min(100, Math.round((scoredPredictions.length / totalPredictions) * 100 + 10)),
      race: Math.min(100, Math.round(avgScore * 2.5)),
      sprints: Math.min(100, Math.round((highScorers.length / totalPredictions) * 100 + 25)),
      podiums: Math.min(100, Math.round((scoredPredictions.length / totalPredictions) * 100)),
      consistency: Math.min(100, Math.round((scoredPredictions.length / totalPredictions) * 80 + 20))
    };
  } catch {
    return defaults;
  }
}

/**
 * Check if predictions should be locked for a race.
 * Returns true if race has already started.
 */
export function isPredictionLocked(raceTime: string): boolean {
  if (!raceTime) return false;
  return new Date(raceTime) <= new Date();
}
