import { Database } from './supabase';

export type TableRow<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type TableInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type TableUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];

// Table Aliases
export type Profile = TableRow<'profiles'>;
export type Dog = TableRow<'dogs'>;
export type DogMedia = TableRow<'dog_media'>;
export type DogHealthRecord = TableRow<'dog_health_records'>;
export type AdoptionApplication = TableRow<'adoption_applications'> & {
  dog?: { name: string; cover_image_url: string };
};
export type DonationCampaign = TableRow<'donation_campaigns'>;
export type Donation = TableRow<'donations'> & {
  campaign?: { title: string };
};
export type Event = TableRow<'events'>;
export type EventRegistration = TableRow<'event_registrations'>;
export type BlogPost = TableRow<'blog_posts'>;
export type Volunteer = TableRow<'volunteers'>;
export type VolunteerTask = TableRow<'volunteer_tasks'>;
export type ContactMessage = TableRow<'contact_messages'>;
export type SuccessStory = TableRow<'success_stories'>;
export type SiteSettings = TableRow<'site_settings'>;

// Enums and Enumerated Types
export type UserRole = 'super_admin' | 'admin' | 'volunteer' | 'donor' | 'user';
export type DogStatus = 'available' | 'adopted' | 'foster' | 'medical_hold' | 'deceased';
export type DogSize = 'tiny' | 'small' | 'medium' | 'large' | 'giant';
export type DogGender = 'male' | 'female' | 'unknown';
export type AdoptionStatus = 'pending' | 'reviewing' | 'approved' | 'rejected' | 'completed' | 'withdrawn';
export type DonationStatus = 'pending' | 'completed' | 'failed' | 'refunded';
export type DonationMethod = 'stripe' | 'razorpay' | 'paypal' | 'bank_transfer' | 'cash';
export type EventStatus = 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
export type PostStatus = 'draft' | 'published' | 'archived';
export type VolunteerStatus = 'pending' | 'active' | 'inactive' | 'rejected';
export type TaskStatus = 'assigned' | 'in_progress' | 'completed' | 'cancelled';
export type MediaType = 'image' | 'video' | 'document';

// Standard Pagination Metadata
export interface PaginationMeta {
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

// Standard API Response Wrapping
export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: string | null;
  meta?: PaginationMeta;
}

// Certified Authenticated User payload matching auth session requirements
export interface AuthUser {
  id: string;
  email: string | undefined;
  role: UserRole;
  profile: Profile;
}
