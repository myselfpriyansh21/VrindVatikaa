"use client";

import { type ReactNode, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard,
  MessagesSquare,
  UtensilsCrossed,
  Soup,
  Images,
  Star,
  HelpCircle,
  Building2,
  Settings,
  Video,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { signOut } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase/client";
import { useSettings } from "@/lib/firebase/settings-context";
import type { AdminRole } from "@/lib/firebase/session";

const navGroups = [
  {
    items: [{ label: "Dashboard", href: "/admin", icon: LayoutDashboard }],
  },
  {
    heading: "Leads",
    items: [{ label: "Inquiries", href: "/admin/inquiries", icon: MessagesSquare }],
  },
  {
    heading: "Restaurant",
    items: [
      { label: "Menu Items", href: "/admin/restaurant/menu", icon: UtensilsCrossed },
      { label: "Categories", href: "/admin/restaurant/categories", icon: UtensilsCrossed },
    ],
  },
  {
    heading: "Catering",
    items: [
      { label: "Menu Items", href: "/admin/catering/menu", icon: Soup },
      { label: "Categories", href: "/admin/catering/categories", icon: Soup },
    ],
  },
  {
    heading: "Content",
    items: [
      { label: "Gallery", href: "/admin/gallery", icon: Images },
      { label: "Gallery Categories", href: "/admin/gallery/categories", icon: Images },
      { label: "Reviews", href: "/admin/reviews", icon: Star },
      { label: "FAQs", href: "/admin/faqs", icon: HelpCircle },
      { label: "Venue & Services", href: "/admin/venue", icon: Building2 },
      { label: "Virtual Tour", href: "/admin/virtual-tour", icon: Video },
    ],
  },
  {
    heading: "Settings",
    items: [{ label: "Business Settings", href: "/admin/settings", icon: Settings }],
  },
];

export function AdminShell({
  children,
  adminEmail,
  role,
}: {
  children: ReactNode;
  adminEmail?: string;
  role: AdminRole;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const settings = useSettings();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  async function handleSignOut() {
    await fetch("/api/admin/session", { method: "DELETE" });
    await signOut(getFirebaseAuth()).catch(() => {});
    router.push("/admin/login");
    router.refresh();
  }

  const sidebarContent = (
    <>
      <div className="flex items-center gap-2.5 px-5 py-5">
        <Image
          src={settings.logoMarkUrl}
          alt=""
          width={480}
          height={584}
          className="h-7 w-auto"
        />
        <span className="font-heading text-sm text-vrind-text-primary">
          {settings.businessName} Admin
        </span>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pb-4">
        {navGroups.map((group, i) => (
          <div key={i} className="mb-5">
            {group.heading && (
              <p className="mb-1.5 px-2 text-[10px] font-medium tracking-widest text-vrind-text-muted uppercase">
                {group.heading}
              </p>
            )}
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setMobileNavOpen(false)}
                      className={`flex min-h-11 items-center gap-2.5 rounded-md px-2.5 text-sm transition-colors ${
                        active
                          ? "bg-vrind-gold/10 text-vrind-gold"
                          : "text-vrind-text-secondary hover:bg-vrind-surface hover:text-vrind-text-primary"
                      }`}
                    >
                      <item.icon className="size-4 shrink-0" strokeWidth={1.75} aria-hidden="true" />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-vrind-white-border px-4 py-4">
        <p className="truncate text-xs text-vrind-text-muted">{adminEmail}</p>
        <p className="text-[10px] uppercase tracking-wide text-vrind-text-muted">{role}</p>
        <button
          onClick={handleSignOut}
          className="mt-3 flex min-h-10 w-full items-center gap-2 rounded-md px-2.5 text-sm text-vrind-text-secondary hover:bg-vrind-surface hover:text-vrind-error"
        >
          <LogOut className="size-4" strokeWidth={1.75} /> Sign out
        </button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-vrind-black">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 flex-col border-r border-vrind-white-border bg-vrind-black-secondary md:flex">
        {sidebarContent}
      </aside>

      {/* Mobile topbar + drawer */}
      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-vrind-white-border bg-vrind-black-secondary px-4 py-3 md:hidden">
          <span className="font-heading text-sm text-vrind-text-primary">
            {settings.businessName} Admin
          </span>
          <button
            onClick={() => setMobileNavOpen((v) => !v)}
            aria-label="Toggle menu"
            className="flex size-11 items-center justify-center text-vrind-text-primary"
          >
            {mobileNavOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </header>
        {mobileNavOpen && (
          <div className="flex flex-col border-b border-vrind-white-border bg-vrind-black-secondary md:hidden">
            {sidebarContent}
          </div>
        )}

        <main className="flex-1 p-6 sm:p-8">{children}</main>
      </div>
    </div>
  );
}
