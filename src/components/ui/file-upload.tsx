import React, { useCallback, useRef, useState } from 'react';
import { Upload, X, File, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

interface FileUploadProps {
  onChange: (file: File | null) => void;
  accept?: string;
  maxSizeMB?: number;
  label?: string;
  className?: string;
  value?: File | null;
  error?: string;
  isUploading?: boolean;
  uploadProgress?: number;
}

export function FileUpload({
  onChange,
  accept = "image/jpeg,image/png,application/pdf",
  maxSizeMB = 5,
  label = "Upload file",
  className,
  value,
  error,
  isUploading = false,
  uploadProgress = 0,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const displayError = error || localError;

  const validateFile = (file: File): boolean => {
    setLocalError(null);
    const maxBytes = maxSizeMB * 1024 * 1024;
    
    if (file.size > maxBytes) {
      setLocalError(`File must be under ${maxSizeMB}MB.`);
      return false;
    }
    
    // Partial accept check
    const acceptedTypes = accept.split(',').map(a => a.trim());
    const fileType = file.type;
    if (acceptedTypes.length > 0 && !acceptedTypes.some(type => {
      if (type.endsWith('/*')) return fileType.startsWith(type.replace('/*', ''));
      return type === fileType;
    })) {
      setLocalError(`Only ${accept.replace(/image\/|application\//g, '')} files are accepted.`);
      return false;
    }
    
    return true;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file && validateFile(file)) {
      onChange(file);
    } else if (!file && value) {
      // do not override if cancelled
    } else {
      onChange(null);
    }
    // reset input
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0] || null;
    if (file && validateFile(file)) {
      onChange(file);
    }
  }, [onChange, maxSizeMB, accept]);

  const clearFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
    setLocalError(null);
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{label}</label>}
      
      {!value && !isUploading ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            isDragging ? "border-bizrent-blue bg-[#EFF6FF]" : "border-[#CBD5E1] hover:bg-[#EFF6FF]",
            displayError && "border-destructive text-destructive hover:bg-destructive/10"
          )}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept={accept}
            className="hidden"
          />
          <Upload className={cn("h-8 w-8 mb-3", displayError ? "text-destructive" : "text-muted-foreground")} />
          <p className="text-sm font-medium text-center">
            Click to upload <span className="font-normal text-muted-foreground">or drag and drop</span>
          </p>
          <p className="text-xs text-muted-foreground mt-1 text-center">
            PNG, JPG, PDF up to {maxSizeMB}MB
          </p>
        </div>
      ) : (
        <div className="border rounded-md p-4 bg-muted/20">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded-full shrink-0">
                <File className="h-6 w-6 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">
                  {value?.name || "Uploading..."}
                </p>
                <p className="text-xs text-muted-foreground">
                  {value ? formatBytes(value.size) : ""}
                </p>
              </div>
            </div>
            {!isUploading && (
              <button
                type="button"
                onClick={clearFile}
                className="shrink-0 p-1 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-foreground ml-2"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Remove file</span>
              </button>
            )}
          </div>
          
          {isUploading && (
            <div className="mt-4 space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}
        </div>
      )}
      
      {displayError && (
        <div className="flex items-center text-sm font-medium text-destructive mt-1.5">
          <AlertCircle className="h-4 w-4 mr-1.5 shrink-0" />
          <span>{displayError}</span>
        </div>
      )}
    </div>
  );
}
