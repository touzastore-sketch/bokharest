/**
 * Auto F/Q (Auto Format & Auto Quality) Image Processing Engine
 * 
 * Automatically transforms, compresses, and optimizes images:
 * - Auto Format (f_auto): Converts images to modern high-efficiency WebP format (or JPEG fallback)
 * - Auto Quality (q_auto): Uses perceptual smart compression (0.82 quality) to cut file size by up to 80% without visible loss
 * - Auto Dimensions: Scales down oversized camera photos (4K/8K) to optimal display resolution (e.g. 1280px max)
 */

export interface AutoFQOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.1 to 1.0 (default 0.82 = optimal perceptual quality)
  format?: 'image/webp' | 'image/jpeg';
}

export interface OptimizedImageResult {
  blob: Blob;
  file: File;
  dataUrl: string;
  width: number;
  height: number;
  originalSizeBytes: number;
  optimizedSizeBytes: number;
  compressionRatioPercent: number;
  format: string;
}

/**
 * Optimizes an HTML Image element to a WebP blob with auto format and quality
 */
export async function optimizeImageElementAutoFQ(
  img: HTMLImageElement,
  fileName: string = 'optimized_image.webp',
  options: AutoFQOptions = {}
): Promise<OptimizedImageResult> {
  const {
    maxWidth = 1280,
    maxHeight = 1280,
    quality = 0.82,
    format = 'image/webp',
  } = options;

  let width = img.naturalWidth || img.width || 800;
  let height = img.naturalHeight || img.height || 600;

  // Scale down preserving aspect ratio if larger than max
  if (width > maxWidth || height > maxHeight) {
    const ratio = Math.min(maxWidth / width, maxHeight / height);
    width = Math.round(width * ratio);
    height = Math.round(height * ratio);
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) {
    throw new Error('Canvas 2D context unavailable');
  }

  // Smooth resampling
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Draw image
  ctx.drawImage(img, 0, 0, width, height);

  // Check if browser supports WebP canvas export
  let targetFormat = format;
  const isWebpSupported = canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  if (!isWebpSupported && format === 'image/webp') {
    targetFormat = 'image/jpeg';
  }

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => {
        if (b) resolve(b);
        else reject(new Error('Failed to create image blob'));
      },
      targetFormat,
      quality
    );
  });

  const baseName = fileName.replace(/\.[^/.]+$/, '');
  const ext = targetFormat === 'image/webp' ? 'webp' : 'jpg';
  const finalFileName = `${baseName}_autofq.${ext}`;

  const optimizedFile = new File([blob], finalFileName, {
    type: targetFormat,
    lastModified: Date.now(),
  });

  const dataUrl = canvas.toDataURL(targetFormat, quality);
  const originalSize = blob.size; // approximate if original unknown

  return {
    blob,
    file: optimizedFile,
    dataUrl,
    width,
    height,
    originalSizeBytes: originalSize,
    optimizedSizeBytes: blob.size,
    compressionRatioPercent: 0,
    format: targetFormat,
  };
}

/**
 * Automatically optimizes a File object (e.g. from file input or drag-drop)
 * with Auto Format (WebP) & Auto Quality (0.82)
 */
export async function optimizeFileAutoFQ(
  file: File,
  options: AutoFQOptions = {}
): Promise<OptimizedImageResult> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = async () => {
      try {
        const result = await optimizeImageElementAutoFQ(img, file.name, options);
        URL.revokeObjectURL(objectUrl);
        result.originalSizeBytes = file.size;
        const savedBytes = Math.max(0, file.size - result.optimizedSizeBytes);
        result.compressionRatioPercent = Math.round((savedBytes / file.size) * 100);
        resolve(result);
      } catch (err) {
        URL.revokeObjectURL(objectUrl);
        reject(err);
      }
    };

    img.onerror = (err) => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error(`Failed to load image file: ${file.name}`));
    };

    img.src = objectUrl;
  });
}

/**
 * Loads and optimizes an image from a URL with Auto Format & Quality
 */
export async function optimizeRemoteUrlAutoFQ(
  url: string,
  fileName: string = 'remote_image.webp',
  options: AutoFQOptions = {}
): Promise<OptimizedImageResult> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = async () => {
      try {
        const result = await optimizeImageElementAutoFQ(img, fileName, options);
        resolve(result);
      } catch (err) {
        reject(err);
      }
    };

    img.onerror = () => {
      // If CORS blocks anonymous load, try proxying or fetching via fetch
      fetch(url)
        .then((res) => res.blob())
        .then((blob) => {
          const file = new File([blob], fileName, { type: blob.type });
          return optimizeFileAutoFQ(file, options);
        })
        .then(resolve)
        .catch((fetchErr) => {
          reject(new Error(`Unable to fetch and optimize remote image: ${url}`));
        });
    };

    img.src = url;
  });
}

/**
 * Format bytes to readable size
 */
export function formatBytes(bytes: number, decimals: number = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
