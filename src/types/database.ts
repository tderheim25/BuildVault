export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = 'admin' | 'manager' | 'staff'
export type UserStatus = 'pending' | 'approved' | 'rejected'

export type Database = {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          role: UserRole
          status: UserStatus
          approved_by: string | null
          approved_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          role?: UserRole
          status?: UserStatus
          approved_by?: string | null
          approved_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          role?: UserRole
          status?: UserStatus
          approved_by?: string | null
          approved_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: any[]
      }
      user_site_access: {
        Row: {
          user_id: string
          site_id: string
          assigned_by: string | null
          created_at: string
        }
        Insert: {
          user_id: string
          site_id: string
          assigned_by?: string | null
          created_at?: string
        }
        Update: {
          user_id?: string
          site_id?: string
          assigned_by?: string | null
          created_at?: string
        }
        Relationships: any[]
      }
      sites: {
        Row: {
          id: string
          name: string
          description: string | null
          address: string | null
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          address?: string | null
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          address?: string | null
          created_by?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: any[]
      }
      photos: {
        Row: {
          id: string
          site_id: string
          url: string
          file_name: string
          file_size: number | null
          mime_type: string | null
          description: string | null
          uploaded_by: string
          created_at: string
        }
        Insert: {
          id?: string
          site_id: string
          url: string
          file_name: string
          file_size?: number | null
          mime_type?: string | null
          description?: string | null
          uploaded_by: string
          created_at?: string
        }
        Update: {
          id?: string
          site_id?: string
          url?: string
          file_name?: string
          file_size?: number | null
          mime_type?: string | null
          description?: string | null
          uploaded_by?: string
          created_at?: string
        }
        Relationships: any[]
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          title: string
          message: string
          site_id: string | null
          photo_id: string | null
          uploaded_by: string | null
          read_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type?: string
          title: string
          message: string
          site_id?: string | null
          photo_id?: string | null
          uploaded_by?: string | null
          read_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          title?: string
          message?: string
          site_id?: string | null
          photo_id?: string | null
          uploaded_by?: string | null
          read_at?: string | null
          created_at?: string
        }
        Relationships: any[]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: UserRole
      user_status: UserStatus
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}




