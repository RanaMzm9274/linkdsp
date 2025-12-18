import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Upload, X, FileText } from 'lucide-react';

interface FileUploadFieldProps {
  label: string;
  name: string;
  files: File[];
  onChange: (files: File[]) => void;
  maxFiles: number;
  required?: boolean;
  error?: string;
  accept?: string;
}

const ACCEPTED_TYPES = '.pdf,.doc,.docx,.png,.jpg,.jpeg';
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export function FileUploadField({
  label,
  name,
  files,
  onChange,
  maxFiles,
  required = false,
  error,
  accept = ACCEPTED_TYPES
}: FileUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFiles = (newFiles: FileList | null) => {
    if (!newFiles) return;
    
    const validFiles: File[] = [];
    const currentCount = files.length;
    
    for (let i = 0; i < newFiles.length && currentCount + validFiles.length < maxFiles; i++) {
      const file = newFiles[i];
      if (file.size <= MAX_SIZE) {
        validFiles.push(file);
      }
    }
    
    onChange([...files, ...validFiles]);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    onChange(newFiles);
  };

  return (
    <div className="space-y-2">
      <Label className={error ? 'text-destructive' : ''}>
        {label} {required && <span className="text-destructive">*</span>}
        <span className="text-muted-foreground text-xs ml-2">(max {maxFiles} files, 5MB each)</span>
      </Label>
      
      <div
        className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors cursor-pointer
          ${dragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}
          ${error ? 'border-destructive' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={accept}
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />
        <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">
          Drop files here or click to browse
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          PDF, DOC, DOCX, PNG, JPG, JPEG
        </p>
      </div>

      {files.length > 0 && (
        <div className="space-y-2 mt-2">
          {files.map((file, index) => (
            <div key={index} className="flex items-center justify-between bg-secondary/50 rounded-md px-3 py-2">
              <div className="flex items-center gap-2 overflow-hidden">
                <FileText className="h-4 w-4 text-primary flex-shrink-0" />
                <span className="text-sm truncate">{file.name}</span>
                <span className="text-xs text-muted-foreground flex-shrink-0">
                  ({(file.size / 1024).toFixed(1)} KB)
                </span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(index);
                }}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
      
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
