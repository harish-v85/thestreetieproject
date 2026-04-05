import "server-only";
import { v2 as cloudinary } from "cloudinary";

const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

/**
 * Dashboard “API environment variable” format:
 * cloudinary://<api_key>:<api_secret>@<cloud_name>
 */
function parseCloudinaryUrl(raw: string): {
  cloud_name: string;
  api_key: string;
  api_secret: string;
} | null {
  const trimmed = raw.trim().replace(/^["']|["']$/g, "");
  if (!trimmed.startsWith("cloudinary://")) return null;
  const rest = trimmed.slice("cloudinary://".length);
  const at = rest.lastIndexOf("@");
  if (at === -1) return null;
  const cloud_name = rest.slice(at + 1);
  const creds = rest.slice(0, at);
  const colon = creds.indexOf(":");
  if (colon === -1) return null;
  const api_key = creds.slice(0, colon);
  let api_secret = creds.slice(colon + 1);
  try {
    api_secret = decodeURIComponent(api_secret);
  } catch {
    /* use raw */
  }
  if (!cloud_name || !api_key || !api_secret) return null;
  return { cloud_name, api_key, api_secret };
}

function tryGetCloudinaryConfig(): {
  cloud_name: string;
  api_key: string;
  api_secret: string;
} | null {
  const fromUrl = process.env.CLOUDINARY_URL?.trim();
  if (fromUrl) {
    const parsed = parseCloudinaryUrl(fromUrl);
    if (parsed) return parsed;
  }
  const cloud_name = process.env.CLOUDINARY_CLOUD_NAME;
  const api_key = process.env.CLOUDINARY_API_KEY;
  const api_secret = process.env.CLOUDINARY_API_SECRET;
  if (cloud_name && api_key && api_secret) {
    return { cloud_name, api_key, api_secret };
  }
  return null;
}

export function isCloudinaryConfigured(): boolean {
  return tryGetCloudinaryConfig() !== null;
}

function ensureConfig() {
  const cfg = tryGetCloudinaryConfig();
  if (!cfg) {
    throw new Error(
      "Missing Cloudinary config. Set CLOUDINARY_URL (from the dashboard) or CLOUDINARY_CLOUD_NAME + CLOUDINARY_API_KEY + CLOUDINARY_API_SECRET.",
    );
  }
  cloudinary.config(cfg);
}

export async function uploadDogImageFromBuffer(
  buffer: Buffer,
  mimeType: string,
): Promise<{ secureUrl: string; publicId: string }> {
  if (!ALLOWED_MIME.has(mimeType)) {
    throw new Error("Only JPEG, PNG, WebP, and GIF images are allowed.");
  }
  ensureConfig();
  const dataUri = `data:${mimeType};base64,${buffer.toString("base64")}`;
  const result = await cloudinary.uploader.upload(dataUri, {
    folder: "streetie/dogs",
    resource_type: "image",
    unique_filename: true,
  });
  return { secureUrl: result.secure_url, publicId: result.public_id };
}

export async function deleteCloudinaryImage(publicId: string): Promise<void> {
  const id = publicId.trim();
  if (!id) return;
  ensureConfig();
  await cloudinary.uploader.destroy(id);
}
