import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export interface UploadResult {
  public_url: string;
  storage_path: string;
  bucket: string;
  file_name: string;
  file_size: number;
  mime_type: string;
}

interface UploadParams {
  file: File;
  bucket: string;
  path: string;
}

interface DeleteParams {
  bucket: string;
  storage_path: string;
}

export function useUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const upload = ({ file, bucket, path }: UploadParams): Promise<UploadResult> => {
    return new Promise(async (resolve, reject) => {
      setIsUploading(true);
      setProgress(20);
      setError(null);

      try {
        let supabase: any = null;
        try {
          supabase = createClient();
        } catch {}

        if (supabase) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Math.random()}.${fileExt}`;
          const filePath = `${path}/${fileName}`;
          setProgress(50);
          const { error: uploadError } = await supabase.storage.from(bucket).upload(filePath, file);

          if (!uploadError) {
            const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(filePath);
            setIsUploading(false);
            setProgress(100);
            return resolve({
              public_url: publicUrl,
              storage_path: filePath,
              bucket,
              file_name: file.name,
              file_size: file.size,
              mime_type: file.type,
            });
          }
        }

        // Fallback for local preview: Object URL
        const objectUrl = URL.createObjectURL(file);
        setIsUploading(false);
        setProgress(100);
        resolve({
          public_url: objectUrl,
          storage_path: `${path}/${file.name}`,
          bucket,
          file_name: file.name,
          file_size: file.size,
          mime_type: file.type,
        });
      } catch (e: any) {
        setIsUploading(false);
        const errMsg = e.message || 'Upload failed';
        setError(errMsg);
        reject(new Error(errMsg));
      }
    });
  };

  const deleteFile = async ({ bucket, storage_path }: DeleteParams): Promise<{ deleted: string }> => {
    setIsUploading(true);
    setError(null);
    try {
      let supabase: any = null;
      try {
        supabase = createClient();
      } catch {}

      if (supabase) {
        await supabase.storage.from(bucket).remove([storage_path]);
      }

      return { deleted: storage_path };
    } catch (e: any) {
      const errMsg = e.message || 'Unknown error during file deletion';
      setError(errMsg);
      throw new Error(errMsg);
    } finally {
      setIsUploading(false);
    }
  };

  return {
    upload,
    deleteFile,
    isUploading,
    progress,
    error,
  };
}
