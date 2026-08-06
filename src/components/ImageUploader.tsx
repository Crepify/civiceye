import { useCallback, useRef, useState } from 'react';
import type { ChangeEvent, DragEvent } from 'react';
import { motion } from 'framer-motion';
import { Camera, ImagePlus, RefreshCw, X } from 'lucide-react';
import { cn } from '@/utils/cn';

interface ImageUploaderProps {
  /** Current photo (data URL) or null. */
  value: string | null;
  onChange: (photo: string | null) => void;
  className?: string;
}

const MAX_SIZE_MB = 8;

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Could not read the image file.'));
    reader.readAsDataURL(file);
  });
}

/**
 * Photo capture / upload control.
 * On desktop it offers file pick + drag & drop; on mobile it opens the
 * native camera directly via `capture="environment"`.
 */
export function ImageUploader({ value, onChange, className }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback(
    async (file: File | undefined) => {
      if (!file) return;
      if (!file.type.startsWith('image/')) {
        setError('Please choose an image file.');
        return;
      }
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        setError(`Image is too large (max ${MAX_SIZE_MB} MB).`);
        return;
      }
      setError(null);
      const dataUrl = await fileToDataUrl(file);
      onChange(dataUrl);
    },
    [onChange],
  );

  const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    void handleFile(e.target.files?.[0]);
    e.target.value = '';
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    void handleFile(e.dataTransfer.files?.[0]);
  };

  if (value) {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn(
          'relative overflow-hidden rounded-2xl border border-slate-200 dark:border-white/10',
          className,
        )}
      >
        <img src={value} alt="Report evidence" className="aspect-[16/9] w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />
        <div className="absolute bottom-3 left-3 flex items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/90 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-white" />
            Photo attached
          </span>
        </div>
        <div className="absolute right-3 top-3 flex gap-2">
          <button
            onClick={() => inputRef.current?.click()}
            className="rounded-xl bg-white/90 p-2 text-slate-700 shadow-sm backdrop-blur transition-colors hover:bg-white dark:bg-slate-800/90 dark:text-slate-200"
            aria-label="Replace photo"
            title="Replace photo"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <button
            onClick={() => onChange(null)}
            className="rounded-xl bg-white/90 p-2 text-rose-600 shadow-sm backdrop-blur transition-colors hover:bg-white dark:bg-slate-800/90"
            aria-label="Remove photo"
            title="Remove photo"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onInputChange}
        />
      </motion.div>
    );
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={onDrop}
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-all duration-200',
        dragOver
          ? 'border-primary-500 bg-primary-500/10'
          : 'border-slate-300/80 bg-white/50 hover:border-primary-400/60 hover:bg-primary-500/5 dark:border-white/15 dark:bg-white/[0.03]',
        className,
      )}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl brand-panel text-primary-600 dark:text-primary-400">
        <ImagePlus className="h-7 w-7" />
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
          Drag & drop your photo here
        </p>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          JPG or PNG, up to {MAX_SIZE_MB} MB
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <button onClick={() => cameraRef.current?.click()} className="btn-primary">
          <Camera className="h-4 w-4" />
          Take photo
        </button>
        <button onClick={() => inputRef.current?.click()} className="btn-secondary">
          <ImagePlus className="h-4 w-4" />
          Browse files
        </button>
      </div>
      {error ? (
        <p className="text-xs font-medium text-rose-600 dark:text-rose-400">{error}</p>
      ) : null}
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={onInputChange}
      />
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onInputChange}
      />
    </div>
  );
}
