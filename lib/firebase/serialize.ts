import "server-only";
import { Timestamp } from "firebase-admin/firestore";

/**
 * React Server Components can only pass PLAIN objects to Client
 * Components — not class instances. The Firebase Admin SDK returns
 * `createdAt`/`updatedAt` as `Timestamp` instances (a class with
 * `.toDate()`), which looks like a plain object in a console.log but
 * isn't one, and crashes with "Only plain objects... can be passed to
 * Client Components" the moment it's handed to a "use client" component.
 *
 * This converts any Timestamp field to a plain ISO string. Every
 * function in services/public-content.service.ts whose return value is
 * ever passed into a Client Component (directly or as a prop a few
 * levels down) MUST run its Firestore doc data through this first.
 *
 * Only handles top-level fields, which matches this project's schema —
 * nothing here nests a Timestamp inside another object/array.
 */
export function serializeFirestoreData<T extends Record<string, unknown>>(data: T): T {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    result[key] = value instanceof Timestamp ? value.toDate().toISOString() : value;
  }
  return result as T;
}