/**
 * Client-side upload helper — used by admin CMS screens (gallery, menu
 * item images). Gets a signature from our own server (which verifies the
 * admin session first), then uploads the file directly to Cloudinary.
 * Our server never touches the image bytes.
 */
export async function uploadToCloudinary(file: File, folder: string) {
  const signRes = await fetch("/api/cloudinary-sign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ folder }),
  });

  if (!signRes.ok) {
    throw new Error("Could not authorize upload. Please sign in again.");
  }

  const { signature, timestamp, apiKey, cloudName } = await signRes.json();

  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", apiKey);
  formData.append("timestamp", String(timestamp));
  formData.append("signature", signature);
  formData.append("folder", folder);

  const uploadRes = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: "POST", body: formData }
  );

  if (!uploadRes.ok) {
    throw new Error("Upload to Cloudinary failed.");
  }

  const data = await uploadRes.json();
  return {
    publicId: data.public_id as string,
    secureUrl: data.secure_url as string,
    width: data.width as number,
    height: data.height as number,
  };
}

/**
 * Builds an optimized Cloudinary delivery URL (auto format + quality,
 * responsive width) from a stored public_id — per spec Part 34/37.
 */
export function cloudinaryUrl(publicId: string, width = 800) {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  return `https://res.cloudinary.com/${cloudName}/image/upload/f_auto,q_auto,w_${width}/${publicId}`;
}
