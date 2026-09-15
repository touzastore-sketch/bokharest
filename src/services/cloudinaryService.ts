/**
 * Cloudinary Integration & Image Optimization Service for Bokharest Black
 * Cloud name: ccnaucox
 * Upload preset: bokharestblack_img (unsigned preset)
 * Automatic optimization: f_auto,q_auto applied to all image references
 */

export const CLOUDINARY_CONFIG = {
  cloudName: 'ccnaucox',
  uploadPreset: 'bokharestblack_img',
  uploadUrl: 'https://api.cloudinary.com/v1_1/ccnaucox/image/upload',
  baseUrl: 'https://res.cloudinary.com/ccnaucox/image/upload',
} as const;

/**
 * Migrated Cloudinary URLs with f_auto,q_auto applied
 */
export const CLOUDINARY_ASSETS = {
  logo: 'https://res.cloudinary.com/ccnaucox/image/upload/f_auto,q_auto/v1789476543/xmgtgnwah1rt0lykzv9g.png',
  logoNew: 'https://res.cloudinary.com/ccnaucox/image/upload/f_auto,q_auto/v1789476544/kar4kjk7kemddqelifxa.png',
  cafeHero: 'https://res.cloudinary.com/ccnaucox/image/upload/f_auto,q_auto/v1789476545/pyf2xooyjoo4wimurd2g.png',
  unifiedMenuItem: 'https://res.cloudinary.com/ccnaucox/image/upload/f_auto,q_auto/v1789476558/kr3dnj0ltb9msgtjdfpe.png',
  adsBanner: 'https://res.cloudinary.com/ccnaucox/image/upload/f_auto,q_auto/v1789476558/mecc5eyptfz7cxrrqblo.png',
  logoFallback: 'https://res.cloudinary.com/ccnaucox/image/upload/f_auto,q_auto/v1789476581/ixhqczhn0hauafcolbdk.png',
  gallery: [
    'https://res.cloudinary.com/ccnaucox/image/upload/f_auto,q_auto/v1789476547/tcgeqscofilg03biplfe.png',
    'https://res.cloudinary.com/ccnaucox/image/upload/f_auto,q_auto/v1789476548/glcopyha5jwswjatqikd.png',
    'https://res.cloudinary.com/ccnaucox/image/upload/f_auto,q_auto/v1789476549/aiohakwg2jv2ubtqkxgk.png',
    'https://res.cloudinary.com/ccnaucox/image/upload/f_auto,q_auto/v1789476551/azb8qayusxf4izuzlcvi.png',
    'https://res.cloudinary.com/ccnaucox/image/upload/f_auto,q_auto/v1789476552/leycyk1dtmvq5dvgacoh.png',
    'https://res.cloudinary.com/ccnaucox/image/upload/f_auto,q_auto/v1789476553/hskvg94l7wrqhjxqy7ye.png',
    'https://res.cloudinary.com/ccnaucox/image/upload/f_auto,q_auto/v1789476555/ciu7wakkphzmxx6mburx.png',
    'https://res.cloudinary.com/ccnaucox/image/upload/f_auto,q_auto/v1789476556/dwtfpuo3tvgziapvyxts.png',
    'https://res.cloudinary.com/ccnaucox/image/upload/f_auto,q_auto/v1789476557/dob5tym7zivjxaqj41ma.png',
  ],
} as const;

/**
 * Mapping of legacy URLs & local paths to optimized Cloudinary URLs
 */
export const LEGACY_TO_CLOUDINARY_MAP: Record<string, string> = {
  '/logo.png': CLOUDINARY_ASSETS.logo,
  '/logo_new.png': CLOUDINARY_ASSETS.logoNew,
  '/assets/logo.png': CLOUDINARY_ASSETS.logo,
  '/cafe_hero.png': CLOUDINARY_ASSETS.cafeHero,
  '/assets/cafe_hero.png': CLOUDINARY_ASSETS.cafeHero,
  'https://i.ibb.co/j98T5cJL/Screenshot-2026-09-12-at-3-54-40-AM-1.png': CLOUDINARY_ASSETS.unifiedMenuItem,
  'https://i.ibb.co/Xr1tZhqQ/image.png': CLOUDINARY_ASSETS.adsBanner,
  'https://i.ibb.co/zW3dhGmG/image.png': CLOUDINARY_ASSETS.logoFallback,
  '/gallery/gallery_1.png': CLOUDINARY_ASSETS.gallery[0],
  '/gallery/gallery_2.png': CLOUDINARY_ASSETS.gallery[1],
  '/gallery/gallery_3.png': CLOUDINARY_ASSETS.gallery[2],
  '/gallery/gallery_4.png': CLOUDINARY_ASSETS.gallery[3],
  '/gallery/gallery_5.png': CLOUDINARY_ASSETS.gallery[4],
  '/gallery/gallery_6.png': CLOUDINARY_ASSETS.gallery[5],
  '/gallery/gallery_7.png': CLOUDINARY_ASSETS.gallery[6],
  '/gallery/gallery_8.png': CLOUDINARY_ASSETS.gallery[7],
  '/gallery/gallery_9.png': CLOUDINARY_ASSETS.gallery[8],
  'https://i.ibb.co/LdmZzLjc/image.png': CLOUDINARY_ASSETS.gallery[0],
  'https://i.ibb.co/dJkWccnb/image.png': CLOUDINARY_ASSETS.gallery[1],
  'https://i.ibb.co/GvmLTzSp/image.png': CLOUDINARY_ASSETS.gallery[2],
  'https://i.ibb.co/TDfxtcL6/image.png': CLOUDINARY_ASSETS.gallery[3],
  'https://i.ibb.co/V6HpYkk/image.png': CLOUDINARY_ASSETS.gallery[4],
  'https://i.ibb.co/5W1bW2gY/image.png': CLOUDINARY_ASSETS.gallery[5],
  'https://i.ibb.co/HDWxBYvY/image.png': CLOUDINARY_ASSETS.gallery[6],
  'https://i.ibb.co/3YSghvpf/image.png': CLOUDINARY_ASSETS.gallery[7],
  'https://i.ibb.co/3yVpXKYQ/image.png': CLOUDINARY_ASSETS.gallery[8],
};

/**
 * Reusable helper function that automatically appends f_auto,q_auto to any
 * Cloudinary image reference, public_id, or mapped legacy URL.
 */
export function getOptimizedImageUrl(input: string | undefined | null): string {
  if (!input || typeof input !== 'string') {
    return CLOUDINARY_ASSETS.unifiedMenuItem;
  }

  const trimmed = input.trim();
  if (!trimmed) {
    return CLOUDINARY_ASSETS.unifiedMenuItem;
  }

  // 1. Check legacy mapping first
  if (LEGACY_TO_CLOUDINARY_MAP[trimmed]) {
    return LEGACY_TO_CLOUDINARY_MAP[trimmed];
  }

  // 2. Check if it's already a full Cloudinary URL
  if (trimmed.includes('cloudinary.com')) {
    if (trimmed.includes('/upload/f_auto,q_auto/')) {
      return trimmed;
    }
    if (trimmed.includes('/upload/')) {
      return trimmed.replace('/upload/', '/upload/f_auto,q_auto/');
    }
    return trimmed;
  }

  // 3. If it's a Cloudinary public_id (e.g. "xmgtgnwah1rt0lykzv9g" or "bokharestblack_img/xyz")
  if (
    !trimmed.startsWith('http://') &&
    !trimmed.startsWith('https://') &&
    !trimmed.startsWith('/') &&
    !trimmed.startsWith('data:') &&
    !trimmed.startsWith('blob:')
  ) {
    return `${CLOUDINARY_CONFIG.baseUrl}/f_auto,q_auto/${trimmed}`;
  }

  return trimmed;
}

/**
 * Upload an image to Cloudinary using the unsigned preset "bokharestblack_img".
 * Automatically returns the URL WITH f_auto,q_auto applied!
 */
export async function uploadImageToCloudinary(
  file: File | Blob | string,
  options?: {
    folder?: string;
    onProgress?: (percent: number) => void;
  }
): Promise<{
  success: boolean;
  url: string; // Optimized URL with f_auto,q_auto
  publicId: string;
  secureUrl: string;
  optimizedUrl: string;
  width?: number;
  height?: number;
  format?: string;
  error?: string;
}> {
  try {
    const formData = new FormData();
    formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
    if (options?.folder) {
      formData.append('folder', options.folder);
    }

    if (typeof file === 'string') {
      formData.append('file', file);
    } else {
      formData.append('file', file, (file as File).name || 'upload.png');
    }

    const result = await new Promise<any>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', CLOUDINARY_CONFIG.uploadUrl, true);

      if (options?.onProgress && xhr.upload) {
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const percent = Math.round((e.loaded / e.total) * 100);
            options.onProgress?.(percent);
          }
        };
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            resolve(JSON.parse(xhr.responseText));
          } catch (err) {
            reject(new Error('Invalid JSON response from Cloudinary'));
          }
        } else {
          try {
            const errData = JSON.parse(xhr.responseText);
            reject(new Error(errData.error?.message || `Upload failed (${xhr.status})`));
          } catch {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        }
      };

      xhr.onerror = () => reject(new Error('Network error during Cloudinary upload'));
      xhr.send(formData);
    });

    const publicId = result.public_id;
    const secureUrl = result.secure_url;
    const optimizedUrl = getOptimizedImageUrl(secureUrl);

    return {
      success: true,
      url: optimizedUrl,
      publicId,
      secureUrl,
      optimizedUrl,
      width: result.width,
      height: result.height,
      format: result.format,
    };
  } catch (err: any) {
    console.error('[Cloudinary] Upload failed:', err);
    return {
      success: false,
      url: '',
      publicId: '',
      secureUrl: '',
      optimizedUrl: '',
      error: err.message || 'Upload failed',
    };
  }
}
