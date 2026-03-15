export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      ai_response_cache: {
        Row: {
          cache_key: string
          created_at: string
          expires_at: string
          function_name: string
          hit_count: number
          id: string
          response: Json
        }
        Insert: {
          cache_key: string
          created_at?: string
          expires_at?: string
          function_name: string
          hit_count?: number
          id?: string
          response: Json
        }
        Update: {
          cache_key?: string
          created_at?: string
          expires_at?: string
          function_name?: string
          hit_count?: number
          id?: string
          response?: Json
        }
        Relationships: []
      }
      analytics_events: {
        Row: {
          created_at: string
          event_data: Json | null
          event_type: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          event_data?: Json | null
          event_type: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          event_data?: Json | null
          event_type?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      analytics_queue: {
        Row: {
          book: string | null
          chapter: number | null
          created_at: string
          event_type: string
          id: string
          metadata: Json | null
          user_id: string
          verse: number | null
        }
        Insert: {
          book?: string | null
          chapter?: number | null
          created_at?: string
          event_type: string
          id?: string
          metadata?: Json | null
          user_id: string
          verse?: number | null
        }
        Update: {
          book?: string | null
          chapter?: number | null
          created_at?: string
          event_type?: string
          id?: string
          metadata?: Json | null
          user_id?: string
          verse?: number | null
        }
        Relationships: []
      }
      bible_verses: {
        Row: {
          book: string
          chapter: number
          created_at: string
          id: string
          text: string
          text_search: unknown
          translation: string
          updated_at: string
          verse: number
        }
        Insert: {
          book: string
          chapter: number
          created_at?: string
          id?: string
          text: string
          text_search?: unknown
          translation?: string
          updated_at?: string
          verse: number
        }
        Update: {
          book?: string
          chapter?: number
          created_at?: string
          id?: string
          text?: string
          text_search?: unknown
          translation?: string
          updated_at?: string
          verse?: number
        }
        Relationships: []
      }
      devotional_entries: {
        Row: {
          book: string
          chapter_end: number | null
          chapter_start: number
          christocentric_connection: string
          created_at: string
          era_key: string
          gospel_revelation: string
          id: string
          order_index: number
          reflection_questions: Json
          subtitle: string
          title: string
          verse_end: number | null
          verse_start: number | null
        }
        Insert: {
          book: string
          chapter_end?: number | null
          chapter_start?: number
          christocentric_connection: string
          created_at?: string
          era_key: string
          gospel_revelation: string
          id?: string
          order_index: number
          reflection_questions?: Json
          subtitle: string
          title: string
          verse_end?: number | null
          verse_start?: number | null
        }
        Update: {
          book?: string
          chapter_end?: number | null
          chapter_start?: number
          christocentric_connection?: string
          created_at?: string
          era_key?: string
          gospel_revelation?: string
          id?: string
          order_index?: number
          reflection_questions?: Json
          subtitle?: string
          title?: string
          verse_end?: number | null
          verse_start?: number | null
        }
        Relationships: []
      }
      favorite_tags: {
        Row: {
          color: string
          created_at: string
          id: string
          name: string
          user_id: string
        }
        Insert: {
          color?: string
          created_at?: string
          id?: string
          name: string
          user_id: string
        }
        Update: {
          color?: string
          created_at?: string
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      favorite_verse_tags: {
        Row: {
          created_at: string
          favorite_id: string
          id: string
          tag_id: string
        }
        Insert: {
          created_at?: string
          favorite_id: string
          id?: string
          tag_id: string
        }
        Update: {
          created_at?: string
          favorite_id?: string
          id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorite_verse_tags_favorite_id_fkey"
            columns: ["favorite_id"]
            isOneToOne: false
            referencedRelation: "favorite_verses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorite_verse_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "favorite_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      favorite_verses: {
        Row: {
          book: string
          chapter: number
          created_at: string
          id: string
          translation: string
          user_id: string
          verse: number
        }
        Insert: {
          book: string
          chapter: number
          created_at?: string
          id?: string
          translation?: string
          user_id: string
          verse: number
        }
        Update: {
          book?: string
          chapter?: number
          created_at?: string
          id?: string
          translation?: string
          user_id?: string
          verse?: number
        }
        Relationships: []
      }
      highlights: {
        Row: {
          book: string
          chapter: number
          color_key: Database["public"]["Enums"]["highlight_color"]
          created_at: string
          id: string
          updated_at: string
          user_id: string
          verse: number
        }
        Insert: {
          book: string
          chapter: number
          color_key: Database["public"]["Enums"]["highlight_color"]
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
          verse: number
        }
        Update: {
          book?: string
          chapter?: number
          color_key?: Database["public"]["Enums"]["highlight_color"]
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
          verse?: number
        }
        Relationships: []
      }
      pinned_verses: {
        Row: {
          book: string
          chapter: number
          created_at: string
          id: string
          translation: string
          updated_at: string
          user_id: string
          verse: number
        }
        Insert: {
          book: string
          chapter: number
          created_at?: string
          id?: string
          translation?: string
          updated_at?: string
          user_id: string
          verse: number
        }
        Update: {
          book?: string
          chapter?: number
          created_at?: string
          id?: string
          translation?: string
          updated_at?: string
          user_id?: string
          verse?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          created_at: string
          endpoint: string
          id: string
          subscription: Json
          user_id: string
        }
        Insert: {
          created_at?: string
          endpoint: string
          id?: string
          subscription: Json
          user_id: string
        }
        Update: {
          created_at?: string
          endpoint?: string
          id?: string
          subscription?: Json
          user_id?: string
        }
        Relationships: []
      }
      shared_studies: {
        Row: {
          book: string
          chapter: number
          created_at: string
          id: string
          insight_text: string
          mode: string
          share_text: string
          share_type: string
          title: string
          user_id: string | null
          verse: number | null
        }
        Insert: {
          book: string
          chapter: number
          created_at?: string
          id?: string
          insight_text?: string
          mode?: string
          share_text: string
          share_type?: string
          title?: string
          user_id?: string | null
          verse?: number | null
        }
        Update: {
          book?: string
          chapter?: number
          created_at?: string
          id?: string
          insight_text?: string
          mode?: string
          share_text?: string
          share_type?: string
          title?: string
          user_id?: string | null
          verse?: number | null
        }
        Relationships: []
      }
      shared_verses: {
        Row: {
          book: string
          chapter: number
          created_at: string
          id: string
          insight_text: string
          share_text: string
          translation: string
          user_id: string | null
          verse: number
        }
        Insert: {
          book: string
          chapter: number
          created_at?: string
          id?: string
          insight_text?: string
          share_text: string
          translation?: string
          user_id?: string | null
          verse: number
        }
        Update: {
          book?: string
          chapter?: number
          created_at?: string
          id?: string
          insight_text?: string
          share_text?: string
          translation?: string
          user_id?: string | null
          verse?: number
        }
        Relationships: []
      }
      structured_notes: {
        Row: {
          application: string | null
          book: string | null
          chapter: number | null
          christocentric: string | null
          created_at: string
          id: string
          interpretation: string | null
          observation: string | null
          prayer: string | null
          theme_label: string | null
          type: Database["public"]["Enums"]["note_type"]
          updated_at: string
          user_id: string
          verse: number | null
        }
        Insert: {
          application?: string | null
          book?: string | null
          chapter?: number | null
          christocentric?: string | null
          created_at?: string
          id?: string
          interpretation?: string | null
          observation?: string | null
          prayer?: string | null
          theme_label?: string | null
          type?: Database["public"]["Enums"]["note_type"]
          updated_at?: string
          user_id: string
          verse?: number | null
        }
        Update: {
          application?: string | null
          book?: string | null
          chapter?: number | null
          christocentric?: string | null
          created_at?: string
          id?: string
          interpretation?: string | null
          observation?: string | null
          prayer?: string | null
          theme_label?: string | null
          type?: Database["public"]["Enums"]["note_type"]
          updated_at?: string
          user_id?: string
          verse?: number | null
        }
        Relationships: []
      }
      user_devotional_progress: {
        Row: {
          completed: boolean
          completed_at: string | null
          created_at: string
          devotional_id: string
          favorited: boolean
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          devotional_id: string
          favorited?: boolean
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          devotional_id?: string
          favorited?: boolean
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_devotional_progress_devotional_id_fkey"
            columns: ["devotional_id"]
            isOneToOne: false
            referencedRelation: "devotional_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      user_reading_progress: {
        Row: {
          completed_days: number[]
          created_at: string
          id: string
          plan_id: string
          started_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_days?: number[]
          created_at?: string
          id?: string
          plan_id: string
          started_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_days?: number[]
          created_at?: string
          id?: string
          plan_id?: string
          started_at?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      ai_cache_stats: {
        Row: {
          avg_hits_per_entry: number | null
          expired_entries: number | null
          function_name: string | null
          max_hits: number | null
          newest_entry: string | null
          oldest_entry: string | null
          total_entries: number | null
          total_hits: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      ai_cache_increment_hit: { Args: { row_id: string }; Returns: undefined }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      purge_expired_ai_cache: { Args: never; Returns: number }
      search_bible: {
        Args: {
          result_limit?: number
          search_query: string
          translation_filter?: string
        }
        Returns: {
          book: string
          chapter: number
          rank: number
          text: string
          verse: number
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      highlight_color:
        | "PROMESSA"
        | "RESPOSTA_HUMANA"
        | "ATRIBUTOS_DE_DEUS"
        | "EMOCOES_ORACAO"
        | "VERDADE_DOUTRINARIA"
      note_type: "verse" | "chapter" | "theme"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
      highlight_color: [
        "PROMESSA",
        "RESPOSTA_HUMANA",
        "ATRIBUTOS_DE_DEUS",
        "EMOCOES_ORACAO",
        "VERDADE_DOUTRINARIA",
      ],
      note_type: ["verse", "chapter", "theme"],
    },
  },
} as const
