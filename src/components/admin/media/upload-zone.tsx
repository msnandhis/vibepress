'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Upload,
  X,
  CheckCircle,
  AlertCircle,
  FileImage,
  FileVideo,
  FileAudio,
  FileText,
  File
} from 'lucide-react';

interface UploadFile {
  file: File;
  id: string;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

interface UploadZoneProps {
  onUpload: (files: File[]) => Promise<void>;
  onClose?: () => void;
  maxFiles?: number;
  maxFileSize?: number; // in bytes
  acceptedFileTypes?: string[];
  className?: string;
  folderId?: string;
}

const acceptedTypes = {
  'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp', '.svg'],
  'video/*': ['.mp4', '.webm', '.ogg', '.avi', '.mov'],
  'audio/*': ['.mp3', '.wav', '.ogg', '.m4a'],
  'application/pdf': ['.pdf'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'text/plain': ['.txt'],
};

const getFileIcon = (mimeType: string) => {
  if (mimeType.startsWith('image/')) return <FileImage className="h-8 w-8" />;
  if (mimeType.startsWith('video/')) return <FileVideo className="h-8 w-8" />;
  if (mimeType.startsWith('audio/')) return <FileAudio className="h-8 w-8" />;
  if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('text')) {
    return <FileText className="h-8 w-8" />;
  }
  return <File className="h-8 w-8" />;
};

const formatFileSize = (bytes: number): string => {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`;
};

export function UploadZone({
  onUpload,
  onClose,
  maxFiles = 10,
  maxFileSize = 10 * 1024 * 1024, // 10MB
  acceptedFileTypes,
  className,
  folderId
}: UploadZoneProps) {
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    // Handle rejected files
    rejectedFiles.forEach(({ file, errors }) => {
      console.error(`File ${file.name} rejected:`, errors);
    });

    // Add accepted files to upload queue
    const newFiles = acceptedFiles.map(file => ({
      file,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      progress: 0,
      status: 'pending' as const
    }));

    setUploadFiles(prev => [...prev, ...newFiles]);
  }, []);

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject
  } = useDropzone({
    onDrop,
    accept: acceptedFileTypes ?
      Object.fromEntries(acceptedFileTypes.map(type => [type, []])) :
      acceptedTypes,
    maxFiles,
    maxSize: maxFileSize,
    multiple: true
  });

  const removeFile = (id: string) => {
    setUploadFiles(prev => prev.filter(f => f.id !== id));
  };

  const uploadAll = async () => {
    if (uploadFiles.length === 0) return;

    setIsUploading(true);

    try {
      // Simulate upload progress for each file
      const uploadPromises = uploadFiles.map(async (uploadFile) => {
        setUploadFiles(prev => prev.map(f =>
          f.id === uploadFile.id ? { ...f, status: 'uploading' } : f
        ));

        // Simulate progress updates
        for (let progress = 0; progress <= 100; progress += 10) {
          await new Promise(resolve => setTimeout(resolve, 100));
          setUploadFiles(prev => prev.map(f =>
            f.id === uploadFile.id ? { ...f, progress } : f
          ));
        }

        setUploadFiles(prev => prev.map(f =>
          f.id === uploadFile.id ? { ...f, status: 'success' } : f
        ));
      });

      await Promise.all(uploadPromises);

      // Call the actual upload function
      await onUpload(uploadFiles.map(f => f.file));

      // Clear the upload queue after successful upload
      setTimeout(() => {
        setUploadFiles([]);
        onClose?.();
      }, 1000);
    } catch (error) {
      console.error('Upload failed:', error);
      setUploadFiles(prev => prev.map(f => ({
        ...f,
        status: 'error',
        error: 'Upload failed'
      })));
    } finally {
      setIsUploading(false);
    }
  };

  const dropzoneClassName = cn(
    "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200",
    "hover:border-primary/50 hover:bg-primary/5",
    isDragAccept && "border-success bg-success/10",
    isDragReject && "border-destructive bg-destructive/10",
    isDragActive && "border-primary bg-primary/10",
    className
  );

  const pendingFiles = uploadFiles.filter(f => f.status === 'pending');
  const uploadingFiles = uploadFiles.filter(f => f.status === 'uploading');
  const successFiles = uploadFiles.filter(f => f.status === 'success');
  const errorFiles = uploadFiles.filter(f => f.status === 'error');

  return (
    <div className="space-y-6">
      {/* Drop Zone */}
      <div {...getRootProps()} className={dropzoneClassName}>
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-4">
          <Upload className="h-12 w-12 text-muted-foreground" />
          {isDragActive ? (
            <div>
              <p className="text-lg font-medium">Drop files here...</p>
              <p className="text-sm text-muted-foreground">
                {isDragAccept && "These files will be uploaded"}
                {isDragReject && "Some files cannot be uploaded"}
              </p>
            </div>
          ) : (
            <div>
              <p className="text-lg font-medium mb-2">
                Drop files here or click to browse
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                Upload images, videos, audio files, and documents
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                <Badge variant="outline">Images (JPG, PNG, GIF, WebP)</Badge>
                <Badge variant="outline">Videos (MP4, WebM)</Badge>
                <Badge variant="outline">Audio (MP3, WAV)</Badge>
                <Badge variant="outline">Documents (PDF, DOC)</Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Max {maxFiles} files, {formatFileSize(maxFileSize)} each
              </p>
            </div>
          )}
        </div>
      </div>

      {/* File List */}
      {uploadFiles.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">
              Files to Upload ({uploadFiles.length})
            </h3>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setUploadFiles([])}
                disabled={isUploading}
              >
                Clear All
              </Button>
              <Button
                onClick={uploadAll}
                disabled={isUploading || uploadFiles.length === 0}
                size="sm"
              >
                {isUploading ? 'Uploading...' : 'Upload All'}
              </Button>
            </div>
          </div>

          <div className="grid gap-3 max-h-60 overflow-y-auto">
            {uploadFiles.map((uploadFile) => (
              <div
                key={uploadFile.id}
                className="flex items-center gap-3 p-3 border rounded-lg bg-card"
              >
                <div className="text-muted-foreground">
                  {getFileIcon(uploadFile.file.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate" title={uploadFile.file.name}>
                    {uploadFile.file.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatFileSize(uploadFile.file.size)}
                  </p>

                  {uploadFile.status === 'uploading' && (
                    <Progress value={uploadFile.progress} className="mt-2" />
                  )}

                  {uploadFile.error && (
                    <p className="text-sm text-destructive mt-1">
                      {uploadFile.error}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {uploadFile.status === 'success' && (
                    <CheckCircle className="h-5 w-5 text-success" />
                  )}
                  {uploadFile.status === 'error' && (
                    <AlertCircle className="h-5 w-5 text-destructive" />
                  )}
                  {uploadFile.status === 'pending' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(uploadFile.id)}
                      disabled={isUploading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Upload Summary */}
          {uploadFiles.length > 0 && (
            <div className="flex gap-4 text-sm text-muted-foreground">
              {pendingFiles.length > 0 && (
                <span>{pendingFiles.length} pending</span>
              )}
              {uploadingFiles.length > 0 && (
                <span>{uploadingFiles.length} uploading</span>
              )}
              {successFiles.length > 0 && (
                <span className="text-success">{successFiles.length} completed</span>
              )}
              {errorFiles.length > 0 && (
                <span className="text-destructive">{errorFiles.length} failed</span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}