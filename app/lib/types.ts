export interface Profile {
  id: string;
  username: string;
  full_name?: string;
  avatar_url?: string;
  website?: string;
  favorite_team?: string;
  favorite_driver?: string;
  total_score: number;
  current_streak?: number;
  created_at: string;
  is_admin?: boolean;
}

export interface Achievement {
  id: string;
  code: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  points_required: number;
}

export interface UserAchievement {
  user_id: string;
  achievement_id: string;
  unlocked_at: string;
  achievements: Achievement;
}

export interface Race {
  id: number;
  name: string;
  date: string;
  status: string;
  location?: string;
  circuit?: string;
  race_time?: string;
  quali_time?: string;
  fp1_time?: string;
  fp2_time?: string;
  fp3_time?: string;
  sprint_time?: string;
  sprint_quali_time?: string;
}

export interface Prediction {
  id: number;
  user_id: string;
  race_id: number;
  quali_p1_driver?: string;
  quali_p2_driver?: string;
  quali_p3_driver?: string;
  race_p1_driver?: string;
  race_p2_driver?: string;
  race_p3_driver?: string;
  p1_driver?: string;
  p2_driver?: string;
  p3_driver?: string;
  wild_prediction?: string;
  biggest_flop?: string;
  biggest_surprise?: string;
  points_total?: number;
  manual_score?: number;
  created_at?: string;
  races?: Race;
}

export interface League {
  id: number;
  name: string;
  code: string;
  owner_id: string;
  created_at: string;
  members_count?: number;
  description?: string;
  is_public?: boolean;
  max_members?: number;
}

export interface LeagueMember {
  league_id: number;
  user_id: string;
  role: 'owner' | 'admin' | 'member';
  joined_at: string;
  leagues: League;
  profiles?: Profile;
}

export interface FriendRequest {
  user_id: string;
  friend_id: string;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
  friend?: Profile; 
}

// === Additional Types for Components ===

export interface User {
  id: string;
  email?: string;
  app_metadata?: Record<string, unknown>;
  user_metadata?: Record<string, unknown>;
  aud?: string;
  created_at?: string;
}

export interface RaceResult {
  race_id: number;
  quali_p1_driver: string;
  quali_p2_driver: string;
  quali_p3_driver: string;
  race_p1_driver: string;
  race_p2_driver: string;
  race_p3_driver: string;
}

export interface LeaderboardEntry {
  id: string;
  username: string;
  avatar_url?: string;
  total_score: number;
  rank?: number;
  current_streak?: number;
  favorite_team?: string;
}

export interface ActivityItem {
  id: number;
  type: string;
  user_id: string;
  data: Record<string, unknown>;
  created_at: string;
  profiles?: Profile;
}

export interface DriverStanding {
  position: number;
  driver: string;
  team: string;
  points: number;
  wins?: number;
}

export interface TeamStanding {
  position: number;
  team: string;
  points: number;
  wins?: number;
}

export interface ChatMessage {
  id: number;
  league_id: number;
  user_id: string;
  content: string;
  message_type: string;
  race_id?: number;
  reply_to_id?: number;
  created_at: string;
  profiles?: Profile;
}

