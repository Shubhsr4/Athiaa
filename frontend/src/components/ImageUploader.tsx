import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { UploadCloud, Image as ImageIcon, Loader2, X, CheckCircle2 } from 'lucide-react';
import { uploadFileToStorage } from '../utils/storage';

interface ImageUploaderProps {
  value?: string;
  onChange?: (url: string) => void;
  bucket?: 'animal-photos' | 'campaign-covers' | 'avatars' | 'legal-docs' | 'volunteer-docs' | 'media-gallery' | 'testimonial-avatars';
  folder?: string;
  label?: string;
  className?: string;
}

export default function ImageUploader({
  value = '',
  onChange,
  bucket = 'animal-photos',
  folder = 'uploads',
  label = 'Upload Image',
  className = ''
}: ImageUploaderProps) {
  const [previewUrl, setPreviewUrl] = useState<string>(value);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (file: File | null) => {
    if (!file) return;
    setErrorMessage('');
    setIsUploading(true);

    try {
      const result = await uploadFileToStorage(file, bucket, folder);
      setPreviewUrl(result.url);
      if (onChange) {
        onChange(result.url);
      }
    } catch (err: any) {
      console.error('Upload error:', err);
      setErrorMessage(err.message || 'Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleRemove = () => {
    setPreviewUrl('');
    setErrorMessage('');
    if (onChange) {
      onChange('');
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`space-y-2 font-sans text-left ${className}`}>
      {label && <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">{label}</label>}

      <input
        type="file"
        ref={fileInputRef}
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFileChange(e.target.files[0]);
          }
        }}
      />

      {previewUrl ? (
        <div className="relative group rounded-2xl overflow-hidden border border-orange-100 bg-cream max-w-sm aspect-video shadow-sm">
          <img
            src={previewUrl}
            alt="Uploaded preview"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="bg-white/90 hover:bg-white text-slate-800 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1 shadow cursor-pointer"
            >
              <UploadCloud size={14} /> Change
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1 shadow cursor-pointer"
            >
              <X size={14} /> Remove
            </button>
          </div>
          <div className="absolute bottom-2 left-2 bg-emerald-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow">
            <CheckCircle2 size={10} /> Saved in Supabase
          </div>
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2 ${
            isDragging ? 'border-primary bg-orange-50/60' : 'border-gray-200 bg-cream/40 hover:bg-orange-50/30'
          }`}
        >
          {isUploading ? (
            <div className="space-y-2 py-2">
              <Loader2 size={28} className="animate-spin text-primary mx-auto" />
              <p className="text-xs font-bold text-slate-700">Uploading image to Supabase Storage...</p>
            </div>
          ) : (
            <>
              <div className="w-10 h-10 rounded-xl bg-orange-100/60 flex items-center justify-center text-primary">
                <UploadCloud size={20} />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-slate-700">Click or drag & drop image here</p>
                <p className="text-[10px] text-gray-400 font-medium">JPEG, PNG, WebP or GIF (Max 10MB)</p>
              </div>
            </>
          )}
        </div>
      )}

      {errorMessage && (
        <p className="text-[11px] font-bold text-rose-600 leading-tight">{errorMessage}</p>
      )}
    </div>
  );
}
