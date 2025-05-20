export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      appointments: {
        Row: {
          appointment_date: string
          created_at: string | null
          doctor_name: string | null
          id: number
          location: string | null
          notes: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          appointment_date: string
          created_at?: string | null
          doctor_name?: string | null
          id?: never
          location?: string | null
          notes?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          appointment_date?: string
          created_at?: string | null
          doctor_name?: string | null
          id?: never
          location?: string | null
          notes?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
      }
      document_sections: {
        Row: {
          content: string
          document_id: number
          embedding: string | null
          id: number
        }
        Insert: {
          content: string
          document_id: number
          embedding?: string | null
          id?: never
        }
        Update: {
          content?: string
          document_id?: number
          embedding?: string | null
          id?: never
        }
      }
      documents: {
        Row: {
          created_at: string
          created_by: string
          id: number
          name: string
          storage_object_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string
          id?: never
          name: string
          storage_object_id: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: never
          name?: string
          storage_object_id?: string
        }
      }
      medications: {
        Row: {
          created_at: string | null
          document_id: number | null
          dosage: string
          end_date: string | null
          frequency: string
          id: number
          name: string
          notes: string | null
          prescribing_doctor: string | null
          start_date: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          document_id?: number | null
          dosage: string
          end_date?: string | null
          frequency: string
          id?: never
          name: string
          notes?: string | null
          prescribing_doctor?: string | null
          start_date?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          document_id?: number | null
          dosage?: string
          end_date?: string | null
          frequency?: string
          id?: never
          name?: string
          notes?: string | null
          prescribing_doctor?: string | null
          start_date?: string | null
          updated_at?: string | null
          user_id?: string
        }
      }
      user_profiles: {
        Row: {
          allergies: string[] | null
          created_at: string | null
          date_of_birth: string | null
          emergency_contact: string | null
          emergency_contact_phone: string | null
          full_name: string | null
          id: string
          medical_conditions: string[] | null
          phone_number: string | null
          updated_at: string | null
        }
        Insert: {
          allergies?: string[] | null
          created_at?: string | null
          date_of_birth?: string | null
          emergency_contact?: string | null
          emergency_contact_phone?: string | null
          full_name?: string | null
          id: string
          medical_conditions?: string[] | null
          phone_number?: string | null
          updated_at?: string | null
        }
        Update: {
          allergies?: string[] | null
          created_at?: string | null
          date_of_birth?: string | null
          emergency_contact?: string | null
          emergency_contact_phone?: string | null
          full_name?: string | null
          id?: string
          medical_conditions?: string[] | null
          phone_number?: string | null
          updated_at?: string | null
        }
      }
    }
    Views: {
      documents_with_storage_path: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: number | null
          name: string | null
          storage_object_id: string | null
          storage_object_path: string | null
        }
      }
    }
    Functions: {
      link_document_to_medication: {
        Args: {
          document_id: number
          medication_name: string
          user_id: string
        }
        Returns: undefined
      }
      match_document_sections: {
        Args: {
          embedding: string
          match_threshold: number
        }
        Returns: {
          content: string
          document_id: number
          embedding: string | null
          id: number
        }[]
      }
      supabase_url: {
        Args: Record<PropertyKey, never>
        Returns: string
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