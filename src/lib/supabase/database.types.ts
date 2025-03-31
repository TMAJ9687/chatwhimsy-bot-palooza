
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
      user_profiles: {
        Row: {
          id: string
          created_at: string
          nickname: string
          email: string | null
          gender: string
          age: number
          country: string
          interests: string[]
          is_vip: boolean
          is_admin: boolean
          subscription_tier: string
          images_remaining: number
          voice_messages_remaining: number
          auth_provider: string
          is_online: boolean
          last_active: string
        }
        Insert: {
          id: string
          created_at?: string
          nickname: string
          email?: string | null
          gender?: string
          age?: number
          country?: string
          interests?: string[]
          is_vip?: boolean
          is_admin?: boolean
          subscription_tier?: string
          images_remaining?: number
          voice_messages_remaining?: number
          auth_provider?: string
          is_online?: boolean
          last_active?: string
        }
        Update: {
          id?: string
          created_at?: string
          nickname?: string
          email?: string | null
          gender?: string
          age?: number
          country?: string
          interests?: string[]
          is_vip?: boolean
          is_admin?: boolean
          subscription_tier?: string
          images_remaining?: number
          voice_messages_remaining?: number
          auth_provider?: string
          is_online?: boolean
          last_active?: string
        }
      }
      temporary_users: {
        Row: {
          id: string
          created_at: string
          nickname: string
          gender: string
          age: number
          country: string
          interests: string[]
          images_remaining: number
          last_active: string
          session_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          nickname: string
          gender?: string
          age?: number
          country?: string
          interests?: string[]
          images_remaining?: number
          last_active?: string
          session_id: string
        }
        Update: {
          id?: string
          created_at?: string
          nickname?: string
          gender?: string
          age?: number
          country?: string
          interests?: string[]
          images_remaining?: number
          last_active?: string
          session_id?: string
        }
      }
      messages: {
        Row: {
          id: string
          created_at: string
          sender_id: string
          recipient_id: string
          content: string
          message_type: string
          read: boolean
          image_url: string | null
          voice_url: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          sender_id: string
          recipient_id: string
          content: string
          message_type?: string
          read?: boolean
          image_url?: string | null
          voice_url?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          sender_id?: string
          recipient_id?: string
          content?: string
          message_type?: string
          read?: boolean
          image_url?: string | null
          voice_url?: string | null
        }
      }
      session_tokens: {
        Row: {
          id: string
          created_at: string
          user_id: string
          token: string
          expires_at: string
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          token: string
          expires_at: string
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          token?: string
          expires_at?: string
        }
      }
      nicknames: {
        Row: {
          nickname: string
          created_at: string
          is_temporary: boolean
          user_id: string | null
        }
        Insert: {
          nickname: string
          created_at?: string
          is_temporary?: boolean
          user_id?: string | null
        }
        Update: {
          nickname?: string
          created_at?: string
          is_temporary?: boolean
          user_id?: string | null
        }
      }
    }
    Views: {
      online_users: {
        Row: {
          id: string
          nickname: string
          gender: string
          age: number
          country: string
          is_vip: boolean
          last_active: string
        }
      }
    }
    Functions: {
      check_nickname_availability: {
        Args: {
          nickname_to_check: string
        }
        Returns: boolean
      }
      get_random_nickname: {
        Args: {
          gender_preference: string
        }
        Returns: string
      }
    }
    Enums: {
      subscription_tier: 'none' | 'monthly' | 'semiannual' | 'annual'
      message_type: 'text' | 'image' | 'voice'
      gender_type: 'male' | 'female'
    }
  }
}
