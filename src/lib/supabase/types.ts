export type MatchStatus = "scheduled" | "live" | "finished";
export type MatchPhase = "group" | "round_of_32" | "round_of_16" | "quarter" | "semi" | "third_place" | "final";

export type Team = {
  id: string;
  name: string;
  country_code: string;
  flag_emoji: string | null;
  group_name: string | null;
};

export type Match = {
  id: string;
  phase: MatchPhase | string;
  group_name: string | null;
  home_team_id: string | null;
  away_team_id: string | null;
  match_date: string;
  status: MatchStatus | string;
  home_score: number | null;
  away_score: number | null;
  external_api_id: string | null;
  created_at: string;
  updated_at: string;
};

export type MatchWithTeams = Match & {
  home_team: Team | null;
  away_team: Team | null;
};

export type Participant = {
  id: string;
  auth_user_id: string | null;
  username: string;
  display_name: string;
  is_admin: boolean;
  created_at: string;
};

export type Prediction = {
  id: string;
  user_id: string;
  match_id: string;
  predicted_home_score: number;
  predicted_away_score: number;
  points: number | null;
  created_at: string;
  updated_at: string;
};

export type RankingRow = {
  user_id: string;
  display_name: string;
  total_points: number;
  exact_results: number;
  correct_outcomes: number;
  predictions_count: number;
};

export interface Database {
  public: {
    Tables: {
      participants: {
        Row: Participant;
        Insert: Partial<Participant> & { username: string; display_name: string };
        Update: Partial<Participant>;
        Relationships: [];
      };
      teams: {
        Row: Team;
        Insert: Partial<Team> & { name: string; country_code: string };
        Update: Partial<Team>;
        Relationships: [];
      };
      matches: {
        Row: Match;
        Insert: Partial<Match> & { match_date: string };
        Update: Partial<Match>;
        Relationships: [
          {
            foreignKeyName: "matches_home_team_id_fkey";
            columns: ["home_team_id"];
            isOneToOne: false;
            referencedRelation: "teams";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "matches_away_team_id_fkey";
            columns: ["away_team_id"];
            isOneToOne: false;
            referencedRelation: "teams";
            referencedColumns: ["id"];
          },
        ];
      };
      predictions: {
        Row: Prediction;
        Insert: Partial<Prediction> & {
          user_id: string;
          match_id: string;
          predicted_home_score: number;
          predicted_away_score: number;
        };
        Update: Partial<Prediction>;
        Relationships: [
          {
            foreignKeyName: "predictions_match_id_fkey";
            columns: ["match_id"];
            isOneToOne: false;
            referencedRelation: "matches";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "predictions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "participants";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      ranking: {
        Row: RankingRow;
        Relationships: [];
      };
    };
    Functions: Record<string, never>;
  };
}
