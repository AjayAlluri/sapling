export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      journal_entries: {
        Row: {
          content: string;
          created_at: string;
          entry_date: string;
          id: string;
          mood_tag: string | null;
          title: string | null;
          updated_at: string;
          user_id: string;
          word_count: number | null;
        };
        Insert: {
          content: string;
          created_at?: string;
          entry_date?: string;
          id?: string;
          mood_tag?: string | null;
          title?: string | null;
          updated_at?: string;
          user_id: string;
          word_count?: number | null;
        };
        Update: {
          content?: string;
          created_at?: string;
          entry_date?: string;
          id?: string;
          mood_tag?: string | null;
          title?: string | null;
          updated_at?: string;
          user_id?: string;
          word_count?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "journal_entries_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      sentiment_analysis: {
        Row: {
          created_at: string;
          dominant_emotions: Json | null;
          entry_id: string;
          id: string;
          model: string;
          overall_sentiment: string | null;
          raw_response: Json | null;
          score: number | null;
          tone_summary: string | null;
        };
        Insert: {
          created_at?: string;
          dominant_emotions?: Json | null;
          entry_id: string;
          id?: string;
          model: string;
          overall_sentiment?: string | null;
          raw_response?: Json | null;
          score?: number | null;
          tone_summary?: string | null;
        };
        Update: {
          created_at?: string;
          dominant_emotions?: Json | null;
          entry_id?: string;
          id?: string;
          model?: string;
          overall_sentiment?: string | null;
          raw_response?: Json | null;
          score?: number | null;
          tone_summary?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "sentiment_analysis_entry_id_fkey";
            columns: ["entry_id"];
            referencedRelation: "journal_entries";
            referencedColumns: ["id"];
          }
        ];
      };
      tree_state: {
        Row: {
          branch_count: number;
          last_emotion: string | null;
          leaf_count: number;
          overall_health: number;
          streak_length: number;
          tree_snapshot: Json | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          branch_count?: number;
          last_emotion?: string | null;
          leaf_count?: number;
          overall_health?: number;
          streak_length?: number;
          tree_snapshot?: Json | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          branch_count?: number;
          last_emotion?: string | null;
          leaf_count?: number;
          overall_health?: number;
          streak_length?: number;
          tree_snapshot?: Json | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "tree_state_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      handle_updated_at: {
        Args: Record<PropertyKey, never>;
        Returns: unknown;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
