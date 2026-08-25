import { supabase } from './supabase';

export interface UploadResult {
  url: string;
  path: string;
}

/**
 * Uploads a file directly to a Supabase Storage bucket and returns its public URL.
 * 
 * @param file File object to upload
 * @param bucket Target storage bucket name (e.g. 'animal-photos', 'avatars', 'campaign-covers')
 * @param folder Optional subfolder path inside bucket
 */
export async function uploadFileToStorage(
  file: File,
  bucket: 'animal-photos' | 'campaign-covers' | 'avatars' | 'legal-docs' | 'volunteer-docs' | 'media-gallery' | 'testimonial-avatars' = 'animal-photos',
  folder: string = 'uploads'
): Promise<UploadResult> {
  if (!file) {
    throw new Error('No file provided for upload.');
  }

  // Validate image file type
  if (!file.type.startsWith('image/') && bucket !== 'legal-docs' && bucket !== 'volunteer-docs') {
    throw new Error('Invalid file format. Please select an image file (JPEG, PNG, WebP).');
  }

  // Enforce 10 MB size limit
  if (file.size > 10 * 1024 * 1024) {
    throw new Error('File size exceeds the 10 MB limit.');
  }

  const fileExt = file.name.split('.').pop();
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
  const filePath = folder ? `${folder}/${fileName}` : fileName;

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true
    });

  if (error) {
    console.error(`Storage upload error [${bucket}]:`, error);
    throw new Error(error.message || 'Failed to upload image to Supabase Storage.');
  }

  const { data: publicUrlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(data.path);

  return {
    url: publicUrlData.publicUrl,
    path: data.path
  };
}
