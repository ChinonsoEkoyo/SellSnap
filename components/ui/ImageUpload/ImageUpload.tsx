'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Upload, X, Loader } from 'lucide-react';
import styles from './ImageUpload.module.css';

interface ImageUploadProps {
  value?: string | null;
  values?: string[];
  onChange: (url: string | null, urls?: string[]) => void;
}

export function ImageUpload({ value, values = [], onChange }: ImageUploadProps) {
  const [previews, setPreviews] = useState<string[]>(() => {
    if (values.length > 0) return values;
    if (value) return [value];
    return [];
  });
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const maxImages = 6;

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) return;

    const localUrl = URL.createObjectURL(file);
    setPreviews((prev) => [...prev, localUrl]);
    setUploading(true);

    try {
      const fd = new FormData();
      fd.set('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();

      setPreviews((prev) => prev.map((p) => (p === localUrl ? data.url : p)));
    } catch {
      setPreviews((prev) => prev.filter((p) => p !== localUrl));
    } finally {
      setUploading(false);
    }
  }, []);

  const handleFiles = useCallback(async (files: FileList) => {
    const toUpload = Array.from(files);
    for (const file of toUpload) {
      await handleFile(file);
    }
  }, [handleFile]);

  const handleRemove = useCallback((index: number) => {
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  }, []);

  useEffect(() => {
    onChange(previews[0] ?? null, previews);
  }, [previews, onChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) handleFiles(files);
  }, [handleFiles]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
  };

  const handleClick = () => inputRef.current?.click();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) handleFiles(files);
  };

  const remaining = maxImages - previews.length;

  return (
    <div className={styles.container}>
      <div className={styles.labelRow}>
        <label className={styles.label}>Product Images</label>
        <span className={styles.counter}>{previews.length}/{maxImages}</span>
      </div>

      <div className={styles.thumbs}>
        {previews.map((url, i) => (
          <div key={url + i} className={styles.thumb}>
            <img src={url} alt="" className={styles.thumbImg} />
            <button
              type="button"
              className={styles.thumbRemove}
              onClick={() => handleRemove(i)}
              aria-label="Remove image"
            >
              <X size={12} />
            </button>
          </div>
        ))}
        {remaining > 0 && (
          <div
            className={`${styles.addBtn} ${dragging ? styles.dragging : ''}`}
            onClick={handleClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleClick(); }}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              multiple
              className={styles.input}
              onChange={handleInputChange}
            />
            {uploading ? (
              <Loader size={20} className={styles.spinner} />
            ) : (
              <Upload size={20} />
            )}
          </div>
        )}
      </div>

      <p className={styles.hint}>
        Add up to 6 high quality images, GIFs and videos to make this variant more appealing to customers
      </p>
    </div>
  );
}
