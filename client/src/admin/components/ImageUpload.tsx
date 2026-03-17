import { useRef, useState } from 'react';
import axios from 'axios';
import { Upload, Loader2, X } from 'lucide-react';

interface ImageUploadProps {
  label: string;
  currentUrl?: string | null;
  uploadEndpoint: string;
  fieldName?: string;
  onUploaded: (url: string) => void;
  accept?: string;
}

export default function ImageUpload({
  label,
  currentUrl,
  uploadEndpoint,
  fieldName = 'photo',
  onUploaded,
  accept = 'image/*',
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentUrl ?? null);
  const [error, setError] = useState('');

  const handleFile = async (file: File) => {
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setUploading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append(fieldName, file);
      const { data } = await axios.post<{ url: string }>(uploadEndpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onUploaded(data.url);
    } catch {
      setError('Upload failed. Please try again.');
      setPreview(currentUrl ?? null);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <label className="block text-xs font-medium mb-2" style={{ color: '#9ca3af' }}>
        {label}
      </label>
      <div
        className="relative rounded-lg overflow-hidden cursor-pointer transition-colors"
        style={{ border: '2px dashed #2a2a35', background: '#0a0a0f' }}
        onClick={() => inputRef.current?.click()}
        onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#c9a96e60')}
        onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#2a2a35')}
      >
        {preview ? (
          <div className="relative">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-40 object-cover"
              style={{ filter: 'brightness(0.8)' }}
            />
            <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.5)' }}>
              {uploading ? (
                <Loader2 size={24} className="animate-spin" style={{ color: '#c9a96e' }} />
              ) : (
                <div className="text-center">
                  <Upload size={20} className="mx-auto mb-1" style={{ color: '#c9a96e' }} />
                  <span className="text-xs" style={{ color: '#c9a96e' }}>Click to change</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="h-32 flex flex-col items-center justify-center gap-2">
            {uploading ? (
              <Loader2 size={24} className="animate-spin" style={{ color: '#c9a96e' }} />
            ) : (
              <>
                <Upload size={24} style={{ color: '#6b7280' }} />
                <span className="text-sm" style={{ color: '#6b7280' }}>Click to upload</span>
              </>
            )}
          </div>
        )}
      </div>
      {error && (
        <p className="mt-1 text-xs flex items-center gap-1" style={{ color: '#f87171' }}>
          <X size={12} /> {error}
        </p>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
    </div>
  );
}
