export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      account_deletion_requests: {
        Row: {
          completed_at: string | null
          id: string
          requested_at: string
          status: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          id?: string
          requested_at?: string
          status?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          id?: string
          requested_at?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      collection_items: {
        Row: {
          collection_id: string
          created_at: string
          position: number
          restaurant_id: string
        }
        Insert: {
          collection_id: string
          created_at?: string
          position?: number
          restaurant_id: string
        }
        Update: {
          collection_id?: string
          created_at?: string
          position?: number
          restaurant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "collection_items_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collection_items_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      collections: {
        Row: {
          cover_restaurant_id: string | null
          created_at: string
          description: string | null
          id: string
          is_public: boolean
          name: string
          slug: string
          updated_at: string
          user_id: string
        }
        Insert: {
          cover_restaurant_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean
          name: string
          slug: string
          updated_at?: string
          user_id: string
        }
        Update: {
          cover_restaurant_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean
          name?: string
          slug?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "collections_cover_restaurant_id_fkey"
            columns: ["cover_restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collections_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          home_city: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          home_city?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          home_city?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      restaurant_reservations: {
        Row: {
          confidence: string | null
          notes: string | null
          provider: string | null
          reservation_url: string | null
          restaurant_id: string
          source_type: string | null
          status: string
          updated_at: string
          verified_at: string | null
        }
        Insert: {
          confidence?: string | null
          notes?: string | null
          provider?: string | null
          reservation_url?: string | null
          restaurant_id: string
          source_type?: string | null
          status: string
          updated_at?: string
          verified_at?: string | null
        }
        Update: {
          confidence?: string | null
          notes?: string | null
          provider?: string | null
          reservation_url?: string | null
          restaurant_id?: string
          source_type?: string | null
          status?: string
          updated_at?: string
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "restaurant_reservations_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: true
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurants: {
        Row: {
          address: string | null
          city: string
          created_at: string
          cuisine: string
          id: string
          is_published: boolean
          latitude: number | null
          longitude: number | null
          michelin_guide_url: string | null
          name: string
          price: string | null
          slug: string
          source_updated_at: string | null
          stars: number
          state: string
          state_code: string
          updated_at: string
          website_url: string | null
        }
        Insert: {
          address?: string | null
          city: string
          created_at?: string
          cuisine: string
          id: string
          is_published?: boolean
          latitude?: number | null
          longitude?: number | null
          michelin_guide_url?: string | null
          name: string
          price?: string | null
          slug: string
          source_updated_at?: string | null
          stars: number
          state: string
          state_code: string
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          address?: string | null
          city?: string
          created_at?: string
          cuisine?: string
          id?: string
          is_published?: boolean
          latitude?: number | null
          longitude?: number | null
          michelin_guide_url?: string | null
          name?: string
          price?: string | null
          slug?: string
          source_updated_at?: string | null
          stars?: number
          state?: string
          state_code?: string
          updated_at?: string
          website_url?: string | null
        }
        Relationships: []
      }
      user_restaurants: {
        Row: {
          created_at: string
          favorite_dishes: string[]
          is_favorite: boolean
          is_planned: boolean
          is_saved: boolean
          is_visited: boolean
          personal_rating: number | null
          planned_for: string | null
          private_notes: string | null
          reservation_confirmation_note: string | null
          reservation_provider: string | null
          restaurant_id: string
          updated_at: string
          user_id: string
          visited_on: string | null
          wants_to_visit: boolean
        }
        Insert: {
          created_at?: string
          favorite_dishes?: string[]
          is_favorite?: boolean
          is_planned?: boolean
          is_saved?: boolean
          is_visited?: boolean
          personal_rating?: number | null
          planned_for?: string | null
          private_notes?: string | null
          reservation_confirmation_note?: string | null
          reservation_provider?: string | null
          restaurant_id: string
          updated_at?: string
          user_id: string
          visited_on?: string | null
          wants_to_visit?: boolean
        }
        Update: {
          created_at?: string
          favorite_dishes?: string[]
          is_favorite?: boolean
          is_planned?: boolean
          is_saved?: boolean
          is_visited?: boolean
          personal_rating?: number | null
          planned_for?: string | null
          private_notes?: string | null
          reservation_confirmation_note?: string | null
          reservation_provider?: string | null
          restaurant_id?: string
          updated_at?: string
          user_id?: string
          visited_on?: string | null
          wants_to_visit?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "user_restaurants_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_restaurants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      user_restaurant_is_meaningful: {
        Args: {
          p_favorite_dishes: string[]
          p_is_favorite: boolean
          p_is_planned: boolean
          p_is_saved: boolean
          p_is_visited: boolean
          p_personal_rating: number
          p_planned_for: string
          p_private_notes: string
          p_reservation_confirmation_note: string
          p_reservation_provider: string
          p_visited_on: string
          p_wants_to_visit: boolean
        }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const

