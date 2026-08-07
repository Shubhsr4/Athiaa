
import React, { useRef, useState, useEffect } from 'react';
import { UploadCloud, X, FileText, Video, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { useUpload, UploadResult } from '@/lib/hooks/useUpload';

const BUCKET_DEFAULTS = {
  'dog-media':        { maxMB: 50,  allowedTypes: ['image/jpeg','image/png','image/webp','image/gif','video/mp4','video/webm'] },
  'avatars':          { maxMB: 5,   allowedTypes: ['image/jpeg','image/png','image/webp'] },
  'blog-covers':      { maxMB: 10,  allowedTypes: ['image/jpeg','image/png','image/webp'] },
  'event-covers':     { maxMB: 10,  allowedTypes: ['image/jpeg','image/png','image/webp'] },
  'campaign-covers':  { maxMB: 10,  allowedTypes: ['image/jpeg','image/png','image/webp'] },
  'success-stories':  { maxMB: 10,  allowedTypes: ['image/jpeg','image/png','image/webp'] },
  'documents':        { maxMB: 20,  allowedTypes: ['application/pdf','image/jpeg','image/png'] },
  'receipts':         { maxMB: 5,   allowedTypes: ['application/pdf'] },
} as const;

type BucketKey = keyof typeof BUCKET_DEFAULTS;

interface FileUploadProps {
  bucket: BucketKey;
  path: string;
  accept?: string;
  maxMB?: number;
  onUploadComplete: (result: UploadResult | null) => void;
  onError?: (error: string) => void;
  currentUrl?: string;
  label?: string;
  id?: string;
}

export function FileUpload({
  bucket,
  path,
  accept,
  maxMB,
  onUploadComplete,
  onError,
  currentUrl,
  label,
  id = 'file-upload'
}: FileUploadProps) {
  const { upload, deleteFile, isUploading, progress, error: uploadHookError } = useUpload();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const bucketConfig = BUCKET_DEFAULTS[bucket];
  const finalMaxMB = maxMB ?? bucketConfig.maxMB;
  const finalAccept = accept ?? bucketConfig.allowedTypes.join(',');

  // Clear errors when bucket changes
  useEffect(() => {
    setLocalError(null);
    setSelectedFile(null);
  }, [bucket]);

  const extractStoragePath = (url: string, bucketName: string): string => {
    try {
      const decoded = decodeURIComponent(url);
      const searchString = `/public/${bucketName}/`;
      const idx = decoded.indexOf(searchString);
      if (idx !== -1) {
        return decoded.substring(idx + searchString.length);
      }
    } catch (e) {
      console.error('Error parsing storage path', e);
    }
    return '';
  };

  const handleFile = async (file: File) => {
    setLocalError(null);

    // Size validation
    const maxSizeInBytes = finalMaxMB * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      const msg = `File is too large. Maximum allowed size is ${finalMaxMB}MB.`;
      setLocalError(msg);
      onError?.(msg);
      return;
    }

    // MIME validation
    const allowed = bucketConfig.allowedTypes as readonly string[];
    if (!allowed.includes(file.type)) {
      const msg = `Unsupported file format. Allowed formats: ${allowed.join(', ')}`;
      setLocalError(msg);
      onError?.(msg);
      return;
    }

    setSelectedFile(file);

    try {
      const res = await upload({ file, bucket, path });
      onUploadComplete(res);
    } catch (e: any) {
      const msg = e.message || 'File upload failed';
      setLocalError(msg);
      onError?.(msg);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const onButtonClick = () => {
    if (!isUploading) {
      fileInputRef.current?.click();
    }
  };

  const handleRemove = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isUploading) return;

    if (currentUrl) {
      const storagePath = extractStoragePath(currentUrl, bucket);
      if (storagePath) {
        try {
          await deleteFile({ bucket, storage_path: storagePath });
        } catch (err: any) {
          console.error("Removal warning: Cloud deletion failed or bypassed", err);
        }
      }
    }

    setSelectedFile(null);
    setLocalError(null);
    onUploadComplete(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const isImage = (urlOrType: string) => {
    const lower = urlOrType.toLowerCase();
    return lower.includes('image/') || lower.endsWith('.jpg') || lower.endsWith('.jpeg') || lower.endsWith('.png') || lower.endsWith('.webp') || lower.endsWith('.gif');
  };

  const isVideo = (urlOrType: string) => {
    const lower = urlOrType.toLowerCase();
    return lower.includes('video/') || lower.endsWith('.mp4') || lower.endsWith('.webm');
  };

  const renderPreview = () => {
    const previewUrl = currentUrl || (selectedFile ? URL.createObjectURL(selectedFile) : '');
    const referenceType = selectedFile ? selectedFile.type : (currentUrl || '');

    if (!previewUrl) return null;

    if (isImage(referenceType)) {
      return (
        <div className="relative group w-full max-w-sm rounded-lg overflow-hidden border border-neutral-200/50 dark:border-neutral-800/50 bg-neutral-100 shadow-sm aspect-video flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt="Preview"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button
              onClick={handleRemove}
              className="p-2 bg-rose-600 hover:bg-rose-700 text-white rounded-full shadow-md transition duration-200 transform hover:scale-110"
              title="Remove File"
              type="button"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      );
    }

    if (isVideo(referenceType)) {
      return (
        <div className="relative group w-full max-w-sm rounded-lg overflow-hidden border border-neutral-200/50 bg-neutral-100 shadow-sm aspect-video flex items-center justify-center">
          <video
            src={previewUrl}
            controls
            className="w-full h-full object-cover"
          />
          <div className="absolute top-2 right-2 z-10">
            <button
              onClick={handleRemove}
              className="p-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-full shadow-md transition duration-200"
              title="Remove File"
              type="button"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      );
    }

    // Default File Icon for PDFs and general Documents
    return (
      <div className="flex items-center gap-3 p-3 w-full max-w-md rounded-lg border border-neutral-200/60 dark:border-neutral-800/60 bg-neutral-50/50 dark:bg-neutral-900/50 shadow-sm">
        <div className="p-2.5 bg-neutral-100 dark:bg-neutral-800 rounded-md text-neutral-600 dark:text-neutral-400">
          <FileText className="w-6 h-6" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200 truncate">
            {selectedFile ? selectedFile.name : 'Uploaded Document'}
          </p>
          <p className="text-xs text-neutral-500">
            {selectedFile ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB` : 'Cloud Document'}
          </p>
        </div>
        <button
          onClick={handleRemove}
          className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-full transition duration-150"
          title="Remove File"
          type="button"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    );
  };

  const shownError = localError || uploadHookError;

  return (
    <div className="w-full flex flex-col gap-3" id={id}>
      {label && (
        <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
          {label}
        </label>
      )}

      {/* Render preview of uploaded or locally staged file */}
      {currentUrl || selectedFile ? (
        <div className="flex justify-start">
          {renderPreview()}
        </div>
      ) : (
        /* Drag and Drop Zone */
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={onButtonClick}
          className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 transition-all duration-250 cursor-pointer ${
            isDragActive
              ? 'border-indigo-500 bg-indigo-50/30 dark:bg-indigo-950/10'
              : 'border-neutral-300 dark:border-neutral-800 hover:border-indigo-400 dark:hover:border-indigo-800 bg-neutral-50/40 dark:bg-neutral-900/10'
          } ${isUploading ? 'pointer-events-none opacity-60' : ''}`}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept={finalAccept}
            onChange={handleChange}
            disabled={isUploading}
          />

          <div className="p-3 bg-white dark:bg-neutral-900 rounded-full shadow-sm border border-neutral-200/50 dark:border-neutral-800/50 text-neutral-500 mb-3">
            <UploadCloud className="w-6 h-6 animate-pulse text-indigo-500" />
          </div>

          <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 text-center">
            Drag & drop file here, or <span className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">browse</span>
          </p>
          <p className="text-xs text-neutral-500 mt-1.5 text-center">
            Max size: {finalMaxMB}MB | Accepts: {bucketConfig.allowedTypes.map(x => x.split('/')[1]).join(', ')}
          </p>
        </div>
      )}

      {/* Progress Bar Container */}
      {isUploading && (
        <div className="w-full mt-1.5">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 animate-pulse">
              Uploading file...
            </span>
            <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
              {progress}%
            </span>
          </div>
          <div className="w-full bg-neutral-200 dark:bg-neutral-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-indigo-600 h-1.5 rounded-full transition-all duration-150 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Error text */}
      {shownError && (
        <div className="flex items-start gap-1.5 text-rose-600 dark:text-rose-400 text-xs mt-1 bg-rose-50 dark:bg-rose-950/20 p-2 rounded-lg border border-rose-200/50 dark:border-rose-900/30">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{shownError}</span>
        </div>
      )}
    </div>
  );
}
