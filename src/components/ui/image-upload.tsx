"use client";

import { useState, useRef } from "react";
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react";
import { uploadImageToIPFS } from "@/lib/ipfs";
import Image from "next/image";

interface ImageUploadProps {
  onUpload: (ipfsHash: string, imageUrl: string) => void;
  onRemove?: () => void;
  currentImage?: string;
  disabled?: boolean;
}

export function ImageUpload({ onUpload, onRemove, currentImage, disabled }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to IPFS
    try {
      setIsUploading(true);
      const result = await uploadImageToIPFS(file);
      onUpload(result.hash, result.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
      setPreview(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onRemove?.();
  };

  return (
    <div className="space-y-2">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/jpg,image/webp,image/gif"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || isUploading}
      />

      {!preview ? (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || isUploading}
          className="w-full h-48 rounded-2xl border-2 border-dashed border-white/10 hover:border-blue-500/30 transition-all bg-white/5 hover:bg-white/10 flex flex-col items-center justify-center gap-3 group disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isUploading ? (
            <>
              <Loader2 className="h-8 w-8 text-blue-400 animate-spin" />
              <p className="text-sm text-muted-foreground">Uploading to IPFS...</p>
            </>
          ) : (
            <>
              <div className="p-4 rounded-full bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors">
                <Upload className="h-8 w-8 text-blue-400" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium">Click to upload project image</p>
                <p className="text-xs text-muted-foreground mt-1">
                  JPG, PNG, WebP or GIF (max 5MB)
                </p>
              </div>
            </>
          )}
        </button>
      ) : (
        <div className="relative w-full h-48 rounded-2xl overflow-hidden border border-white/10 group">
          {preview.startsWith("data:") || preview.startsWith("http") ? (
            <Image
              src={preview}
              alt="Project preview"
              fill
              className="object-cover"
              unoptimized
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-white/5">
              <ImageIcon className="h-12 w-12 text-muted-foreground" />
            </div>
          )}

          {isUploading && (
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
              <Loader2 className="h-8 w-8 text-white animate-spin" />
            </div>
          )}

          {!isUploading && (
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-2 right-2 p-2 rounded-full bg-red-500/80 hover:bg-red-500 transition-colors opacity-0 group-hover:opacity-100"
            >
              <X className="h-4 w-4 text-white" />
            </button>
          )}
        </div>
      )}

      {error && (
        <p className="text-xs text-red-400 mt-2">{error}</p>
      )}

      <p className="text-[10px] text-muted-foreground">
        Images are stored on IPFS for decentralized access
      </p>
    </div>
  );
}
