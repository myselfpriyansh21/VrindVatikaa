import "server-only";
import { v2 as cloudinary } from "cloudinary";

/**
 * Cloudinary is configured with the API secret ONLY here, server-side.
 * The browser never sees CLOUDINARY_API_SECRET — it only ever receives a
 * short-lived signature computed by this config (see
 * app/api/cloudinary-sign/route.ts), per spec Part 34 / Part 12.
 */
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export { cloudinary };
