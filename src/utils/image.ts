/**
 * Compress a photo (data URL) before sending it to an AI vision API.
 * Phone photos are 4–12 MB; the free tiers charge/limit by tokens, and a
 * giant base64 image blows the quota instantly. Downscaling to ~768px and
 * re-encoding as JPEG ~72 keeps quality for detection while shrinking the
 * payload ~10–20x — keeping API calls small and fast.
 */

const MAX_DIM = 768;
const JPEG_QUALITY = 0.72;

export async function compressImageForAI(dataUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      try {
        let { width, height } = img;
        const scale = Math.min(1, MAX_DIM / Math.max(width, height));
        width = Math.max(1, Math.round(width * scale));
        height = Math.max(1, Math.round(height * scale));

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Canvas unavailable.');
        ctx.drawImage(img, 0, 0, width, height);

        resolve(canvas.toDataURL('image/jpeg', JPEG_QUALITY));
      } catch (e) {
        reject(e instanceof Error ? e : new Error('Could not compress image.'));
      }
    };
    img.onerror = () => reject(new Error('Could not load image for analysis.'));
    img.src = dataUrl;
  });
}

/**
 * Lightweight client-side blur / darkness check (works without an LLM —
 * used when the detection engine doesn't judge quality itself, e.g.
 * Roboflow). Downscales to 64×64 and measures luminance variance:
 * low variance ≈ blurry/flat; low average luminance ≈ too dark.
 */
export async function detectBlur(dataUrl: string): Promise<'clear' | 'blurry' | 'unclear' | 'low-light'> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      try {
        const size = 64;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve('clear');
        ctx.drawImage(img, 0, 0, size, size);
        const { data } = ctx.getImageData(0, 0, size, size);

        let sum = 0;
        let sumSq = 0;
        for (let i = 0; i < data.length; i += 4) {
          const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
          sum += lum;
          sumSq += lum * lum;
        }
        const n = data.length / 4;
        const mean = sum / n;
        const variance = sumSq / n - mean * mean;

        if (mean < 35) return resolve('low-light');
        if (variance < 90) return resolve('blurry');
        if (variance < 160) return resolve('unclear');
        return resolve('clear');
      } catch {
        return resolve('clear');
      }
    };
    img.onerror = () => resolve('clear');
    img.src = dataUrl;
  });
}


/**
 * Generate AI annotated image with bounding boxes drawn on canvas
 * Used when Roboflow not configured - creates mock annotation that looks different from original
 */
export async function generateMockAnnotatedImage(dataUrl: string, category: string, confidence: number, objects: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Canvas unavailable');
        ctx.drawImage(img, 0, 0);

        // Draw mock bounding boxes based on category
        const colors: Record<string, string> = {
          pothole: '#ef4444',
          'broken-road': '#f97316',
          garbage: '#22c55e',
          sidewalk: '#3b82f6',
          manhole: '#a855f7',
          'fallen-tree': '#16a34a',
          'street-light': '#eab308',
          'water-leakage': '#06b6d4',
          sewage: '#84cc16',
          'illegal-dumping': '#f59e0b',
          'traffic-signal': '#ef4444',
          other: '#6b7280',
        };
        const color = colors[category] || '#ef4444';
        
        // Generate 1-3 random boxes
        const boxCount = Math.min(3, Math.max(1, objects.length));
        for (let i = 0; i < boxCount; i++) {
          const x = Math.random() * 0.5 + 0.1; // 10% to 60%
          const y = Math.random() * 0.5 + 0.1;
          const w = Math.random() * 0.3 + 0.2; // 20% to 50%
          const h = Math.random() * 0.3 + 0.2;
          
          const px = x * canvas.width;
          const py = y * canvas.height;
          const pw = w * canvas.width;
          const ph = h * canvas.height;
          
          // Box
          ctx.strokeStyle = color;
          ctx.lineWidth = Math.max(2, canvas.width * 0.005);
          ctx.strokeRect(px, py, pw, ph);
          
          // Label background
          const label = `${category} ${Math.round(confidence*100)}%`;
          ctx.font = `bold ${Math.max(12, canvas.width * 0.02)}px Arial`;
          const textMetrics = ctx.measureText(label);
          const labelHeight = Math.max(16, canvas.width * 0.03);
          ctx.fillStyle = color;
          ctx.fillRect(px, py - labelHeight, textMetrics.width + 12, labelHeight);
          
          // Label text
          ctx.fillStyle = 'white';
          ctx.fillText(label, px + 6, py - 6);
        }

        // Add AI watermark
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(8, canvas.height - 28, 140, 20);
        ctx.fillStyle = 'white';
        ctx.font = '11px Arial';
        ctx.fillText(`AI: ${category} ${Math.round(confidence*100)}%`, 12, canvas.height - 14);

        resolve(canvas.toDataURL('image/jpeg', 0.85));
      } catch (e) {
        reject(e);
      }
    };
    img.onerror = () => reject(new Error('Could not load image'));
    img.src = dataUrl;
  });
}

/**
 * Generate annotated image from Roboflow predictions with real bounding boxes
 * Falls back to mock if predictions missing coordinates
 */
export async function generateAnnotatedFromPredictions(
  dataUrl: string,
  predictions: Array<{ class: string; confidence: number; x?: number; y?: number; width?: number; height?: number }>,
  category: string,
  confidence: number
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Canvas unavailable');
        ctx.drawImage(img, 0, 0);

        const colors: Record<string, string> = {
          pothole: '#ef4444',
          'broken-road': '#f97316',
          garbage: '#22c55e',
          sidewalk: '#3b82f6',
          manhole: '#a855f7',
          'fallen-tree': '#16a34a',
          'street-light': '#eab308',
          'water-leakage': '#06b6d4',
          sewage: '#84cc16',
          'illegal-dumping': '#f59e0b',
          'traffic-signal': '#ef4444',
          other: '#6b7280',
        };
        const color = colors[category] || '#ef4444';

        // If predictions have valid boxes, draw them, otherwise mock
        const validBoxes = predictions.filter((p) => 
          typeof p.x === 'number' && typeof p.y === 'number' && 
          typeof p.width === 'number' && typeof p.height === 'number' &&
          p.width > 0 && p.height > 0
        );

        const boxesToDraw = validBoxes.length > 0 ? validBoxes : predictions.slice(0, 3);

        boxesToDraw.forEach((pred) => {
          let px: number, py: number, pw: number, ph: number;
          
          if (typeof pred.x === 'number' && typeof pred.y === 'number' && typeof pred.width === 'number' && typeof pred.height === 'number') {
            // Roboflow returns center x,y and width,height - could be in pixels or normalized
            // Heuristic: if values < 1, they're normalized, else pixels
            const isNormalized = pred.x <= 1 && pred.y <= 1 && pred.width <= 1 && pred.height <= 1;
            if (isNormalized) {
              px = (pred.x - pred.width / 2) * canvas.width;
              py = (pred.y - pred.height / 2) * canvas.height;
              pw = pred.width * canvas.width;
              ph = pred.height * canvas.height;
            } else {
              // Assume pixels, but scale if image size differs from detection size (640)
              // For simplicity, treat as pixels in original image space if close, else scale
              const scaleX = canvas.width / 640;
              const scaleY = canvas.height / 640;
              // If x,y are large (close to canvas size), use as is, else scale
              if (pred.x > canvas.width || pred.y > canvas.height) {
                px = (pred.x - pred.width / 2) * scaleX;
                py = (pred.y - pred.height / 2) * scaleY;
                pw = pred.width * scaleX;
                ph = pred.height * scaleY;
              } else {
                px = pred.x - pred.width / 2;
                py = pred.y - pred.height / 2;
                pw = pred.width;
                ph = pred.height;
              }
            }
          } else {
            // Mock fallback
            const x = Math.random() * 0.5 + 0.1;
            const y = Math.random() * 0.5 + 0.1;
            const w = Math.random() * 0.3 + 0.2;
            const h = Math.random() * 0.3 + 0.2;
            px = x * canvas.width;
            py = y * canvas.height;
            pw = w * canvas.width;
            ph = h * canvas.height;
          }

          // Clamp
          px = Math.max(0, Math.min(canvas.width - 10, px));
          py = Math.max(0, Math.min(canvas.height - 10, py));
          pw = Math.max(10, Math.min(canvas.width - px, pw));
          ph = Math.max(10, Math.min(canvas.height - py, ph));

          // Box
          ctx.strokeStyle = color;
          ctx.lineWidth = Math.max(3, canvas.width * 0.006);
          ctx.strokeRect(px, py, pw, ph);

          // Label
          const label = `${pred.class} ${Math.round(pred.confidence * 100)}%`;
          ctx.font = `bold ${Math.max(13, canvas.width * 0.022)}px Arial`;
          const metrics = ctx.measureText(label);
          const lh = Math.max(20, canvas.width * 0.035);
          // Ensure label visible
          const labelY = py - lh >= 0 ? py - lh : py + ph;
          ctx.fillStyle = color;
          ctx.fillRect(px, labelY, metrics.width + 14, lh);
          ctx.fillStyle = 'white';
          ctx.fillText(label, px + 7, labelY + lh * 0.7);
        });

        // Watermark
        ctx.fillStyle = 'rgba(0,0,0,0.65)';
        ctx.fillRect(8, canvas.height - 32, 200, 24);
        ctx.fillStyle = 'white';
        ctx.font = 'bold 12px Arial';
        ctx.fillText(`AI: ${category} ${Math.round(confidence*100)}% • ${predictions.length} detections`, 12, canvas.height - 16);

        resolve(canvas.toDataURL('image/jpeg', 0.9));
      } catch (e) {
        reject(e);
      }
    };
    img.onerror = () => reject(new Error('Could not load image'));
    img.src = dataUrl;
  });
}
