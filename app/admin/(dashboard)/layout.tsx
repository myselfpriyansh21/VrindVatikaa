import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_SESSION_COOKIE, verifyAdminSession } from "@/lib/firebase/session";
import { AdminShell } from "@/components/admin/admin-shell";

/**
 * This layout is the AUTHORITATIVE admin route guard (see middleware.ts
 * for why the fast Edge-layer check there is not sufficient on its own).
 * It runs as a Server Component in the Node.js runtime, so the Firebase
 * Admin SDK's cryptographic session-cookie verification works fully here
 * — signature, expiry, and revocation are all checked before a single
 * byte of dashboard content is sent to the browser.
 *
 * Every route under app/admin/(dashboard)/ is covered by this layout
 * automatically (Next.js route group), so no individual admin page needs
 * to re-implement this check.
 */
export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  const claims = await verifyAdminSession(sessionCookie);

  if (!claims) {
    redirect("/admin/login");
  }

  return <AdminShell adminEmail={claims.email} role={claims.role}>{children}</AdminShell>;
}
