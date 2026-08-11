/**
 * Compress a photo (data URL) before sending it to an AI vision API.
 * Phone photos are 4–12 MB; the free tiers charge/limit by tokens, and a
 * giant base64 image blows the quota instantly. Downscaling to ~768px and
 * re-encoding as JPEG ~72 keeps quality for detection while shrinking the
 * payload ~10–20x — keeping us under Groq's small free-tier limits.
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
