import Link from "next/link";
import Image from "next/image";
import { fallbackBusinessSettings } from "@/config/site";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-vrind-black px-6 text-center">
      <Image
        src={fallbackBusinessSettings.logoMarkUrl}
        alt=""
        width={480}
        height={584}
        className="h-12 w-auto opacity-90"
      />
      <p className="font-heading mt-8 text-2xl text-vrind-text-primary">Page not found</p>
      <p className="mt-2 max-w-sm text-sm text-vrind-text-secondary">
        The page you&apos;re looking for doesn&apos;t exist or may have moved.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/"
          className="flex min-h-12 items-center justify-center bg-vrind-gold px-6 text-sm font-semibold text-vrind-black hover:bg-vrind-gold-bright"
        >
          Back to Home
        </Link>
        <Link
          href="/restaurant"
          className="flex min-h-12 items-center justify-center border border-vrind-gold px-6 text-sm font-semibold text-vrind-gold hover:bg-vrind-gold/10"
        >
          View Restaurant
        </Link>
      </div>
    </div>
  );
}
