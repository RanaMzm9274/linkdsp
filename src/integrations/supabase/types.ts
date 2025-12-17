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
      ai_consultations: {
        Row: {
          career_suggestions: string[] | null
          created_at: string
          id: string
          next_steps: string[] | null
          recommendations: Json | null
          recommended_universities: string[] | null
          user_id: string
        }
        Insert: {
          career_suggestions?: string[] | null
          created_at?: string
          id?: string
          next_steps?: string[] | null
          recommendations?: Json | null
          recommended_universities?: string[] | null
          user_id: string
        }
        Update: {
          career_suggestions?: string[] | null
          created_at?: string
          id?: string
          next_steps?: string[] | null
          recommendations?: Json | null
          recommended_universities?: string[] | null
          user_id?: string
        }
        Relationships: []
      }
      applications: {
        Row: {
          academic_history: string | null
          admin_notes: string | null
          created_at: string
          documents_url: string[] | null
          id: string
          interview_date: string | null
          interview_link: string | null
          personal_statement: string | null
          program_id: string
          status: Database["public"]["Enums"]["application_status"]
          university_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          academic_history?: string | null
          admin_notes?: string | null
          created_at?: string
          documents_url?: string[] | null
          id?: string
          interview_date?: string | null
          interview_link?: string | null
          personal_statement?: string | null
          program_id: string
          status?: Database["public"]["Enums"]["application_status"]
          university_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          academic_history?: string | null
          admin_notes?: string | null
          created_at?: string
          documents_url?: string[] | null
          id?: string
          interview_date?: string | null
          interview_link?: string | null
          personal_statement?: string | null
          program_id?: string
          status?: Database["public"]["Enums"]["application_status"]
          university_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_university_id_fkey"
            columns: ["university_id"]
            isOneToOne: false
            referencedRelation: "universities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_applications_program_id"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_applications_university_id"
            columns: ["university_id"]
            isOneToOne: false
            referencedRelation: "universities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_applications_user_id"
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
          budget_range: string | null
          created_at: string
          education_level: string | null
          email: string
          full_name: string | null
          gpa: string | null
          id: string
          interests: string[] | null
          phone: string | null
          preferred_countries: string[] | null
          skills: string[] | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          budget_range?: string | null
          created_at?: string
          education_level?: string | null
          email: string
          full_name?: string | null
          gpa?: string | null
          id: string
          interests?: string[] | null
          phone?: string | null
          preferred_countries?: string[] | null
          skills?: string[] | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          budget_range?: string | null
          created_at?: string
          education_level?: string | null
          email?: string
          full_name?: string | null
          gpa?: string | null
          id?: string
          interests?: string[] | null
          phone?: string | null
          preferred_countries?: string[] | null
          skills?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      programs: {
        Row: {
          created_at: string
          degree_type: string
          department: string | null
          description: string | null
          duration: string | null
          id: string
          name: string
          requirements: string | null
          tuition_fee: string | null
          university_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          degree_type: string
          department?: string | null
          description?: string | null
          duration?: string | null
          id?: string
          name: string
          requirements?: string | null
          tuition_fee?: string | null
          university_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          degree_type?: string
          department?: string | null
          description?: string | null
          duration?: string | null
          id?: string
          name?: string
          requirements?: string | null
          tuition_fee?: string | null
          university_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "programs_university_id_fkey"
            columns: ["university_id"]
            isOneToOne: false
            referencedRelation: "universities"
            referencedColumns: ["id"]
          },
        ]
      }
      universities: {
        Row: {
          city: string
          country: string
          created_at: string
          deadlines: string | null
          description: string | null
          id: string
          logo_url: string | null
          name: string
          requirements: string | null
          status: string
          updated_at: string
        }
        Insert: {
          city: string
          country: string
          created_at?: string
          deadlines?: string | null
          description?: string | null
          id?: string
          logo_url?: string | null
          name: string
          requirements?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          city?: string
          country?: string
          created_at?: string
          deadlines?: string | null
          description?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          requirements?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "student"
      application_status:
        | "pending"
        | "under_review"
        | "interview_scheduled"
        | "accepted"
        | "rejected"
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
      app_role: ["admin", "student"],
      application_status: [
        "pending",
        "under_review",
        "interview_scheduled",
        "accepted",
        "rejected",
      ],
    },
  },
} as const
