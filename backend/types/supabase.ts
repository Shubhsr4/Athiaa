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
      profiles: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          email: string
          role: 'super_admin' | 'admin' | 'volunteer' | 'donor' | 'user'
          full_name: string | null
          display_name: string | null
          phone: string | null
          preferred_lang: string | null
          currency: string | null
          avatar_url: string | null
        }
        Insert: {
          id: string
          created_at?: string
          updated_at?: string
          email: string
          role?: 'super_admin' | 'admin' | 'volunteer' | 'donor' | 'user'
          full_name?: string | null
          display_name?: string | null
          phone?: string | null
          preferred_lang?: string | null
          currency?: string | null
          avatar_url?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          email?: string
          role?: 'super_admin' | 'admin' | 'volunteer' | 'donor' | 'user'
          full_name?: string | null
          display_name?: string | null
          phone?: string | null
          preferred_lang?: string | null
          currency?: string | null
          avatar_url?: string | null
        }
      }
      dogs: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          name: string
          slug: string
          breed: string
          status: 'available' | 'adopted' | 'foster' | 'medical_hold' | 'deceased'
          gender: 'male' | 'female' | 'unknown'
          size: 'tiny' | 'small' | 'medium' | 'large' | 'giant'
          age: string
          flags: string[]
          fee: number
          description: string | null
          main_image_url: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          name: string
          slug: string
          breed: string
          status?: 'available' | 'adopted' | 'foster' | 'medical_hold' | 'deceased'
          gender: 'male' | 'female' | 'unknown'
          size: 'tiny' | 'small' | 'medium' | 'large' | 'giant'
          age: string
          flags?: string[]
          fee?: number
          description?: string | null
          main_image_url?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          name?: string
          slug?: string
          breed?: string
          status?: 'available' | 'adopted' | 'foster' | 'medical_hold' | 'deceased'
          gender?: 'male' | 'female' | 'unknown'
          size?: 'tiny' | 'small' | 'medium' | 'large' | 'giant'
          age?: string
          flags?: string[]
          fee?: number
          description?: string | null
          main_image_url?: string | null
        }
      }
      dog_media: {
        Row: {
          id: string
          created_at: string
          dog_id: string
          media_type: 'image' | 'video' | 'document'
          url: string
          storage_path: string | null
          is_featured: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          dog_id: string
          media_type: 'image' | 'video' | 'document'
          url: string
          storage_path?: string | null
          is_featured?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          dog_id?: string
          media_type?: 'image' | 'video' | 'document'
          url?: string
          storage_path?: string | null
          is_featured?: boolean
        }
      }
      dog_health_records: {
        Row: {
          id: string
          created_at: string
          dog_id: string
          record_date: string
          title: string
          description: string | null
          vet_name: string | null
          cost: number | null
          document_url: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          dog_id: string
          record_date: string
          title: string
          description?: string | null
          vet_name?: string | null
          cost?: number | null
          document_url?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          dog_id?: string
          record_date?: string
          title?: string
          description?: string | null
          vet_name?: string | null
          cost?: number | null
          document_url?: string | null
        }
      }
      adoption_applications: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          dog_id: string
          applicant_id: string | null
          applicant_name: string
          applicant_email: string
          applicant_phone: string
          living_situation: string
          experience_level: string
          status: 'pending' | 'reviewing' | 'approved' | 'rejected' | 'completed' | 'withdrawn'
          notes: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          dog_id: string
          applicant_id?: string | null
          applicant_name: string
          applicant_email: string
          applicant_phone: string
          living_situation: string
          experience_level: string
          status?: 'pending' | 'reviewing' | 'approved' | 'rejected' | 'completed' | 'withdrawn'
          notes?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          dog_id?: string
          applicant_id?: string | null
          applicant_name?: string
          applicant_email?: string
          applicant_phone?: string
          living_situation?: string
          experience_level?: string
          status?: 'pending' | 'reviewing' | 'approved' | 'rejected' | 'completed' | 'withdrawn'
          notes?: string | null
        }
      }
      donation_campaigns: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          title: string
          slug: string
          description: string | null
          goal_amount: number
          raised_amount: number
          currency: string
          start_date: string | null
          end_date: string | null
          image_url: string | null
          is_active: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          title: string
          slug: string
          description?: string | null
          goal_amount: number
          raised_amount?: number
          currency?: string
          start_date?: string | null
          end_date?: string | null
          image_url?: string | null
          is_active?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          title?: string
          slug?: string
          description?: string | null
          goal_amount?: number
          raised_amount?: number
          currency?: string
          start_date?: string | null
          end_date?: string | null
          image_url?: string | null
          is_active?: boolean
        }
      }
      donations: {
        Row: {
          id: string
          created_at: string
          campaign_id: string | null
          donor_id: string | null
          donor_name: string | null
          donor_email: string | null
          amount: number
          currency: string
          status: 'pending' | 'completed' | 'failed' | 'refunded'
          method: 'stripe' | 'razorpay' | 'paypal' | 'bank_transfer' | 'cash'
          transaction_id: string | null
          is_anonymous: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          campaign_id?: string | null
          donor_id?: string | null
          donor_name?: string | null
          donor_email?: string | null
          amount: number
          currency?: string
          status?: 'pending' | 'completed' | 'failed' | 'refunded'
          method: 'stripe' | 'razorpay' | 'paypal' | 'bank_transfer' | 'cash'
          transaction_id?: string | null
          is_anonymous?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          campaign_id?: string | null
          donor_id?: string | null
          donor_name?: string | null
          donor_email?: string | null
          amount?: number
          currency?: string
          status?: 'pending' | 'completed' | 'failed' | 'refunded'
          method?: 'stripe' | 'razorpay' | 'paypal' | 'bank_transfer' | 'cash'
          transaction_id?: string | null
          is_anonymous?: boolean
        }
      }
      events: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          title: string
          slug: string
          description: string | null
          location: string
          start_date: string
          end_date: string
          status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled'
          capacity: number | null
          pricing: number
          image_url: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          title: string
          slug: string
          description?: string | null
          location: string
          start_date: string
          end_date: string
          status?: 'upcoming' | 'ongoing' | 'completed' | 'cancelled'
          capacity?: number | null
          pricing?: number
          image_url?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          title?: string
          slug?: string
          description?: string | null
          location?: string
          start_date?: string
          end_date?: string
          status?: 'upcoming' | 'ongoing' | 'completed' | 'cancelled'
          capacity?: number | null
          pricing?: number
          image_url?: string | null
        }
      }
      event_registrations: {
        Row: {
          id: string
          created_at: string
          event_id: string
          user_id: string | null
          attendee_name: string
          attendee_email: string
          ticket_count: number
          amount_paid: number
          payment_status: 'pending' | 'completed' | 'failed'
        }
        Insert: {
          id?: string
          created_at?: string
          event_id: string
          user_id?: string | null
          attendee_name: string
          attendee_email: string
          ticket_count?: number
          amount_paid?: number
          payment_status?: 'pending' | 'completed' | 'failed'
        }
        Update: {
          id?: string
          created_at?: string
          event_id?: string
          user_id?: string | null
          attendee_name?: string
          attendee_email?: string
          ticket_count?: number
          amount_paid?: number
          payment_status?: 'pending' | 'completed' | 'failed'
        }
      }
      blog_posts: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          title: string
          slug: string
          content: string
          summary: string | null
          status: 'draft' | 'published' | 'archived'
          published_at: string | null
          author_id: string | null
          cover_image_url: string | null
          tags: string[]
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          title: string
          slug: string
          content: string
          summary?: string | null
          status?: 'draft' | 'published' | 'archived'
          published_at?: string | null
          author_id?: string | null
          cover_image_url?: string | null
          tags?: string[]
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          title?: string
          slug?: string
          content?: string
          summary?: string | null
          status?: 'draft' | 'published' | 'archived'
          published_at?: string | null
          author_id?: string | null
          cover_image_url?: string | null
          tags?: string[]
        }
      }
      volunteers: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          user_id: string
          skills: string[]
          availability: string
          emergency_contact: string
          status: 'pending' | 'active' | 'inactive' | 'rejected'
          approved_by: string | null
          approved_at: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id: string
          skills?: string[]
          availability: string
          emergency_contact: string
          status?: 'pending' | 'active' | 'inactive' | 'rejected'
          approved_by?: string | null
          approved_at?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id?: string
          skills?: string[]
          availability?: string
          emergency_contact?: string
          status?: 'pending' | 'active' | 'inactive' | 'rejected'
          approved_by?: string | null
          approved_at?: string | null
        }
      }
      volunteer_tasks: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          title: string
          description: string | null
          assigned_to: string | null
          status: 'assigned' | 'in_progress' | 'completed' | 'cancelled'
          due_date: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          title: string
          description?: string | null
          assigned_to?: string | null
          status?: 'assigned' | 'in_progress' | 'completed' | 'cancelled'
          due_date?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          title?: string
          description?: string | null
          assigned_to?: string | null
          status?: 'assigned' | 'in_progress' | 'completed' | 'cancelled'
          due_date?: string | null
        }
      }
      contact_messages: {
        Row: {
          id: string
          created_at: string
          name: string
          email: string
          phone: string | null
          subject: string
          message: string
          category: string
          is_read: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          email: string
          phone?: string | null
          subject: string
          message: string
          category: string
          is_read?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          email?: string
          phone?: string | null
          subject?: string
          message?: string
          category?: string
          is_read?: boolean
        }
      }
      success_stories: {
        Row: {
          id: string
          created_at: string
          dog_id: string | null
          title: string
          content: string
          author_name: string
          image_url: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          dog_id?: string | null
          title: string
          content: string
          author_name: string
          image_url?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          dog_id?: string | null
          title?: string
          content?: string
          author_name?: string
          image_url?: string | null
        }
      }
      site_settings: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          title: string
          description: string | null
          contact_email: string
          contact_phone: string | null
          address: string | null
          stripe_enabled: boolean
          razorpay_enabled: boolean
          paypal_enabled: boolean
        }
        Insert: {
          id: string
          created_at?: string
          updated_at?: string
          title: string
          description?: string | null
          contact_email: string
          contact_phone?: string | null
          address?: string | null
          stripe_enabled?: boolean
          razorpay_enabled?: boolean
          paypal_enabled?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          title?: string
          description?: string | null
          contact_email?: string
          contact_phone?: string | null
          address?: string | null
          stripe_enabled?: boolean
          razorpay_enabled?: boolean
          paypal_enabled?: boolean
        }
      }
    }
  }
}
