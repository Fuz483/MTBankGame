import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string;
const key = import.meta.env.VITE_SUPABASE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(url, key);

export interface Profile {
  id: string;
  username: string;
  mt_coins: number;
  owned_cars: number[];
  selected_car: number;
  total_races: number;
  races_won: number;
  total_coins_earned: number;
  created_at: string;
}

export interface RaceResult {
  id: string;
  user_id: string;
  position: number;
  car_id: number;
  coins_earned: number;
  race_room: string;
  created_at: string;
}

export interface LeaderboardEntry {
  id: string;
  username: string;
  mt_coins: number;
  total_coins_earned: number;
  races_won: number;
  total_races: number;
}
