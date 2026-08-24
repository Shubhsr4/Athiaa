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
      adoption_requests: {
        Row: {
          animal_id: string
          created_at: string
          full_name: string
          id: string
          message: string | null
          phone: string
          requester_id: string | null
          status: 'pending' | 'approved' | 'rejected' | 'completed'
        }
        Insert: {
          animal_id: string
          created_at?: string
          full_name: string
          id?: string
          message?: string | null
          phone: string
          requester_id?: string | null
          status?: 'pending' | 'approved' | 'rejected' | 'completed'
        }
        Update: {
          animal_id?: string
          created_at?: string
          full_name?: string
          id?: string
          message?: string | null
          phone?: string
          requester_id?: string | null
          status?: 'pending' | 'approved' | 'rejected' | 'completed'
        }
        Relationships: [
          {
            foreignKeyName: "adoption_requests_animal_id_fkey"
            columns: ["animal_id"]
            isOneToOne: false
            referencedRelation: "animals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "adoption_requests_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      animal_updates: {
        Row: {
          animal_id: string
          created_at: string
          id: string
          image_url: string | null
          note: string
          posted_by: string | null
        }
        Insert: {
          animal_id: string
          created_at?: string
          id?: string
          image_url?: string | null
          note: string
          posted_by?: string | null
        }
        Update: {
          animal_id?: string
          created_at?: string
          id?: string
          image_url?: string | null
          note?: string
          posted_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "animal_updates_animal_id_fkey"
            columns: ["animal_id"]
            isOneToOne: false
            referencedRelation: "animals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "animal_updates_posted_by_fkey"
            columns: ["posted_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      animals: {
        Row: {
          cover_image_url: string | null
          created_at: string
          created_by: string | null
          id: string
          location: string | null
          name: string
          rescued_at: string | null
          species: string
          status: 'rescued' | 'under_treatment' | 'fostered' | 'adopted' | 'deceased'
          story: string | null
        }
        Insert: {
          cover_image_url?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          location?: string | null
          name: string
          rescued_at?: string | null
          species: string
          status?: 'rescued' | 'under_treatment' | 'fostered' | 'adopted' | 'deceased'
          story?: string | null
        }
        Update: {
          cover_image_url?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          location?: string | null
          name?: string
          rescued_at?: string | null
          species?: string
          status?: 'rescued' | 'under_treatment' | 'fostered' | 'adopted' | 'deceased'
          story?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "animals_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          details: Json | null
          id: string
          record_id: string | null
          table_name: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          details?: Json | null
          id?: string
          record_id?: string | null
          table_name?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          details?: Json | null
          id?: string
          record_id?: string | null
          table_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      campaigns: {
        Row: {
          cover_image_url: string | null
          created_at: string
          description: string | null
          ends_at: string | null
          goal_amount: number | null
          id: string
          is_active: boolean
          raised_amount: number
          slug: string
          starts_at: string | null
          title: string
        }
        Insert: {
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          ends_at?: string | null
          goal_amount?: number | null
          id?: string
          is_active?: boolean
          raised_amount?: number
          slug: string
          starts_at?: string | null
          title: string
        }
        Update: {
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          ends_at?: string | null
          goal_amount?: number | null
          id?: string
          is_active?: boolean
          raised_amount?: number
          slug?: string
          starts_at?: string | null
          title?: string
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string | null
          id: string
          is_read: boolean
          message: string
          name: string
          phone: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          is_read?: boolean
          message: string
          name: string
          phone?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          is_read?: boolean
          message?: string
          name?: string
          phone?: string | null
        }
        Relationships: []
      }
      donations: {
        Row: {
          amount: number
          animal_id: string | null
          campaign_id: string | null
          created_at: string
          donor_email: string | null
          donor_id: string | null
          donor_name: string | null
          donor_pan: string | null
          donor_phone: string | null
          id: string
          is_recurring: boolean
          razorpay_order_id: string | null
          razorpay_payment_id: string | null
          receipt_number: string | null
          receipt_sent: boolean
          receipt_sent_at: string | null
          receipt_url: string | null
          status: 'created' | 'paid' | 'failed' | 'refunded'
        }
        Insert: {
          amount: number
          animal_id?: string | null
          campaign_id?: string | null
          created_at?: string
          donor_email?: string | null
          donor_id?: string | null
          donor_name?: string | null
          donor_pan?: string | null
          donor_phone?: string | null
          id?: string
          is_recurring?: boolean
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          receipt_number?: string | null
          receipt_sent?: boolean
          receipt_sent_at?: string | null
          receipt_url?: string | null
          status?: 'created' | 'paid' | 'failed' | 'refunded'
        }
        Update: {
          amount?: number
          animal_id?: string | null
          campaign_id?: string | null
          created_at?: string
          donor_email?: string | null
          donor_id?: string | null
          donor_name?: string | null
          donor_pan?: string | null
          donor_phone?: string | null
          id?: string
          is_recurring?: boolean
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          receipt_number?: string | null
          receipt_sent?: boolean
          receipt_sent_at?: string | null
          receipt_url?: string | null
          status?: 'created' | 'paid' | 'failed' | 'refunded'
        }
        Relationships: [
          {
            foreignKeyName: "donations_animal_id_fkey"
            columns: ["animal_id"]
            isOneToOne: false
            referencedRelation: "animals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "donations_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "donations_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      otp_codes: {
        Row: {
          attempts: number
          created_at: string
          expires_at: string
          id: string
          otp_hash: string
          phone: string
          verified: boolean
        }
        Insert: {
          attempts?: number
          created_at?: string
          expires_at: string
          id?: string
          otp_hash: string
          phone: string
          verified?: boolean
        }
        Update: {
          attempts?: number
          created_at?: string
          expires_at?: string
          id?: string
          otp_hash?: string
          phone?: string
          verified?: boolean
        }
        Relationships: []
      }
      otp_rate_limits: {
        Row: {
          id: string
          last_requested_at: string
          phone: string
        }
        Insert: {
          id?: string
          last_requested_at?: string
          phone: string
        }
        Update: {
          id?: string
          last_requested_at?: string
          phone?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          city: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          city?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          city?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      testimonials: {
        Row: {
          author_name: string
          avatar_url: string | null
          content: string
          created_at: string
          id: string
          is_published: boolean
        }
        Insert: {
          author_name: string
          avatar_url?: string | null
          content: string
          created_at?: string
          id?: string
          is_published?: boolean
        }
        Update: {
          author_name?: string
          avatar_url?: string | null
          content?: string
          created_at?: string
          id?: string
          is_published?: boolean
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          granted_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          granted_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          granted_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_granted_by_fkey"
            columns: ["granted_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      volunteer_event_signups: {
        Row: {
          created_at: string
          event_id: string
          id: string
          volunteer_id: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          volunteer_id: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          volunteer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "volunteer_event_signups_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "volunteer_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "volunteer_event_signups_volunteer_id_fkey"
            columns: ["volunteer_id"]
            isOneToOne: false
            referencedRelation: "volunteers"
            referencedColumns: ["id"]
          }
        ]
      }
      volunteer_events: {
        Row: {
          capacity: number | null
          created_at: string
          description: string | null
          ends_at: string | null
          id: string
          location: string | null
          starts_at: string
          title: string
        }
        Insert: {
          capacity?: number | null
          created_at?: string
          description?: string | null
          ends_at?: string | null
          id?: string
          location?: string | null
          starts_at: string
          title: string
        }
        Update: {
          capacity?: number | null
          created_at?: string
          description?: string | null
          ends_at?: string | null
          id?: string
          location?: string | null
          starts_at?: string
          title?: string
        }
        Relationships: []
      }
      volunteers: {
        Row: {
          availability: string | null
          created_at: string
          full_name: string
          id: string
          phone: string
          reviewed_by: string | null
          skills: string[] | null
          status: 'pending' | 'approved' | 'rejected'
          user_id: string | null
        }
        Insert: {
          availability?: string | null
          created_at?: string
          full_name: string
          id?: string
          phone: string
          reviewed_by?: string | null
          skills?: string[] | null
          status?: 'pending' | 'approved' | 'rejected'
          user_id?: string | null
        }
        Update: {
          availability?: string | null
          created_at?: string
          full_name?: string
          id?: string
          phone?: string
          reviewed_by?: string | null
          skills?: string[] | null
          status?: 'pending' | 'approved' | 'rejected'
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "volunteers_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "volunteers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      is_admin: {
        Args: {
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: 'donor' | 'volunteer' | 'ngo_staff' | 'admin' | 'super_admin'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
