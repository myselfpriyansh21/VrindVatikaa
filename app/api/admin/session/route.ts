import { NextRequest, NextResponse } from "next/server";
import {
  createAdminSessionCookie,
  ADMIN_SESSION_COOKIE,
  SESSION_MAX_AGE_MS,
} from "@/lib/firebase/session";

/**
 * POST /api/admin/session
 * Body: { idToken: string }
 *
 * Called immediately after a successful Firebase client-side sign-in
 * (Google Sign-In). Verifies the token, confirms the account is an
 * authorized admin (role custom claim), and — only then — sets an
 * httpOnly session cookie the rest of the admin surface trusts.
 */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const idToken = body?.idToken as string | undefined;

  if (!idToken) {
    return NextResponse.json({ error: "Missing idToken." }, { status: 400 });
  }

  try {
    const sessionCookie = await createAdminSessionCookie(idToken);

    const response = NextResponse.json({ ok: true });
    response.cookies.set(ADMIN_SESSION_COOKIE, sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SESSION_MAX_AGE_MS / 1000,
      path: "/",
    });
    return response;
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        {
          error:
            "This account is not authorized to access the Vrind Vatikaa admin dashboard.",
        },
        { status: 403 }
      );
    }
    console.error("Admin session creation failed:", error);
    return NextResponse.json(
      { error: "Sign-in failed. Please try again." },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/session — signs out by clearing the session cookie.
 */
export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_SESSION_COOKIE, "", { maxAge: 0, path: "/" });
  return response;
}
