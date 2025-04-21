export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      reading_content: {
        Row: {
          id: string
          created_at: string
          title: string
          description: string | null
          content: string
          url: string
          estimated_read_time: number
          priority: 'High' | 'Medium' | 'Low'
          user_id: string
          tags: string[] | null
          is_completed: boolean
          completed_at: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          title: string
          description?: string | null
          content: string
          url: string
          estimated_read_time: number
          priority?: 'High' | 'Medium' | 'Low'
          user_id: string
          tags?: string[] | null
          is_completed?: boolean
          completed_at?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          title?: string
          description?: string | null
          content?: string
          url?: string
          estimated_read_time?: number
          priority?: 'High' | 'Medium' | 'Low'
          user_id?: string
          tags?: string[] | null
          is_completed?: boolean
          completed_at?: string | null
        }
      }
      reading_sessions: {
        Row: {
          id: string
          created_at: string
          user_id: string
          content_id: string
          start_time: string
          end_time: string | null
          duration: number | null
          progress: number
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          content_id: string
          start_time?: string
          end_time?: string | null
          duration?: number | null
          progress?: number
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          content_id?: string
          start_time?: string
          end_time?: string | null
          duration?: number | null
          progress?: number
        }
      }
      highlights: {
        Row: {
          id: string
          created_at: string
          user_id: string
          content_id: string
          text: string
          note: string | null
          color: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          content_id: string
          text: string
          note?: string | null
          color?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          content_id?: string
          text?: string
          note?: string | null
          color?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 