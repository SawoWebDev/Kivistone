// src/Administrator/mediaUpload.js
//
// Client-side counterpart to POST/DELETE /api/admin/media-upload. Images are
// always converted to WebP client-side via an offscreen <canvas> before
// upload (capped at ~1600px on the long edge) so a picked file is always
// reasonably sized regardless of what the admin selects, then uploaded as a
// raw binary body (not FormData/multipart) with the target key/content type
// passed as query params, matching the backend contract.
const WEBP_MAX_DIM = 1600;
const WEBP_QUALITY = 0.82;

export function slugify(str) {
  return String(str || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function convertToWebP(file, maxDim = WEBP_MAX_DIM, quality = WEBP_QUALITY) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      let { width, height } = img;
      if (width > maxDim || height > maxDim) {
        if (width >= height) {
          height = Math.round((height / width) * maxDim);
          width = maxDim;
        } else {
          width = Math.round((width / height) * maxDim);
          height = maxDim;
        }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error('WebP conversion failed'))),
        'image/webp',
        quality,
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Could not read image file'));
    };
    img.src = objectUrl;
  });
}

/**
 * Uploads a File (already converted to WebP whenever possible) to R2 via the
 * media-upload Pages Function.
 *
 * @param {File} file
 * @param {{ prefix?: string, name?: string }} opts `prefix` becomes the R2
 *   key's folder ("products" | "categories"); `name` seeds the filename
 *   (falls back to the original file name).
 * @returns {Promise<{ url: string, key: string }>}
 */
export async function uploadImage(file, { prefix = 'products', name } = {}) {
  let blob = file;
  let contentType = file.type || 'application/octet-stream';

  if (file.type && file.type.startsWith('image/') && file.type !== 'image/svg+xml') {
    try {
      blob = await convertToWebP(file);
      contentType = 'image/webp';
    } catch (err) {
      console.warn('WebP conversion failed, uploading original file:', err);
    }
  }

  const ext = contentType === 'image/webp' ? 'webp' : (file.name.split('.').pop() || 'bin').toLowerCase();
  const base = slugify(name || file.name.replace(/\.[^.]+$/, '')) || 'file';
  const key = `${prefix}/${Date.now()}-${base}.${ext}`;

  const res = await fetch(
    `/api/admin/media-upload?key=${encodeURIComponent(key)}&contentType=${encodeURIComponent(contentType)}`,
    {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': contentType },
      body: blob,
    },
  );

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody.error || `Upload failed (${res.status})`);
  }

  return res.json(); // { url, key }
}

// Best-effort cleanup of a replaced/removed image. Accepts either the raw R2
// key or the public /media/... URL that was stored on the record.
export async function deleteImage(keyOrUrl) {
  if (!keyOrUrl) return;
  const match = String(keyOrUrl).match(/\/media\/(.+)$/);
  const key = match ? match[1] : keyOrUrl;
  try {
    await fetch(`/api/admin/media-upload?key=${encodeURIComponent(key)}`, {
      method: 'DELETE',
      credentials: 'include',
    });
  } catch {
    // fire-and-forget
  }
}
