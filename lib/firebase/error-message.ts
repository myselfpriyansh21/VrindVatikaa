/**
 * Turns a raw Firebase/Firestore error into a specific, accurate message
 * for the admin UI — replacing the old generic "Check Firebase
 * credentials for this environment" string that was shown for every
 * failure regardless of actual cause (the real bug this was hiding: see
 * lib/firebase/client.ts#ensureAuthReady).
 *
 * Always pair this with a console.error of the RAW error at the call
 * site — this function is for the user-facing message only; the console
 * log is what makes the actual Firebase error code/message inspectable.
 */
export function getFirebaseErrorMessage(error: unknown): string {
  const code = (error as { code?: string })?.code;

  switch (code) {
    case "permission-denied":
      return "Permission denied by Firestore Security Rules. Your session may not have fully loaded yet — try refreshing. If this persists, your admin account's role claim may not be set (see scripts/set-admin-role.mjs).";
    case "unauthenticated":
      return "You're not signed in (or your session expired). Please sign in again at /admin/login.";
    case "failed-precondition":
      return "This query needs a Firestore index that doesn't exist yet. Check the browser console for a link Firestore provides to create it automatically.";
    case "unavailable":
      return "Could not reach Firestore right now (network or Firebase service issue). Please try again.";
    case "not-found":
      return "The requested data doesn't exist.";
    default:
      return error instanceof Error
        ? `Unexpected error: ${error.message}`
        : "An unexpected error occurred. Check the browser console for details.";
  }
}