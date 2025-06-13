export enum MarketState {
  OPEN = 0,
  RESOLVED = 1,
  CANCELED = 2
}

export interface Market {
  id: number;
  creator?: string;
  resolver?: string;
  question: string;
  outcomes: string[];
  endTime: number;
  state: number;
  totalShares?: number[];
}

export interface Game {
  game_id: string;
  local_date: string;
  start_time: string;
  league_id: string;
  home_team: {
    team_id: string;
    name: string;
    short_code: string;
    image_path: string;
  };
  away_team: {
    team_id: string;
    name: string;
    short_code: string;
    image_path: string;
  };
} 