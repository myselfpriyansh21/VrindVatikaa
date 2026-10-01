"use client";

import Link from "next/link";
import Image from "next/image";
import { useSettings } from "@/lib/firebase/settings-context";

export function SiteFooter() {
  const settings = useSettings();
  return (
    <footer className="border-t border-vrind-white-border bg-vrind-black-secondary">
      <div className="mx-auto max-w-7xl px-6 py-14 sm:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-3">
          <div>
            <Image
              src={settings.logoMarkUrl}
              alt={settings.businessName}
              width={480}
              height={584}
              className="h-10 w-auto"
            />
            <p className="mt-4 text-sm leading-relaxed text-vrind-text-secondary">
              {settings.address}
            </p>
          </div>
          <div>
            <p className="mb-3 text-xs font-medium tracking-widest text-vrind-text-muted uppercase">
              Explore
            </p>
            <ul className="space-y-2 text-sm text-vrind-text-secondary">
              <li><Link href="/#banquet" className="hover:text-vrind-gold">Banquet</Link></li>
              <li><Link href="/#lawn" className="hover:text-vrind-gold">Lawn</Link></li>
              <li><Link href="/restaurant" className="hover:text-vrind-gold">Restaurant &amp; Catering</Link></li>
              <li><Link href="/#services" className="hover:text-vrind-gold">Services &amp; Facilities</Link></li>
            </ul>
          </div>
          <div>
            <p className="mb-3 text-xs font-medium tracking-widest text-vrind-text-muted uppercase">
              Contact
            </p>
            <ul className="space-y-2 text-sm text-vrind-text-secondary">
              <li>{settings.phone}</li>
              <li>{settings.email}</li>
              <li className="pt-1">
                <a
                  href={`https://instagram.com/${settings.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-vrind-gold"
                >
                  @{settings.instagram}
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-vrind-white-border pt-6 text-xs text-vrind-text-muted sm:flex-row">
          <p>© {new Date().getFullYear()} {settings.businessName}. All rights reserved.</p>
          <Link href="/privacy" className="hover:text-vrind-gold">Privacy Policy</Link>
        </div>
      </div>
    </footer>
  );
}
