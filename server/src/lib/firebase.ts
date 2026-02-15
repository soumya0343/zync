import admin from "firebase-admin";
import type { Firestore, Timestamp } from "firebase-admin/firestore";

function initFirebase() {
  if (admin.apps.length > 0) return admin.app();

  const options: admin.AppOptions = {
    projectId: process.env.FIREBASE_PROJECT_ID,
  };

  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    options.credential = admin.credential.cert(
      JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT) as admin.ServiceAccount,
    );
  } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    options.credential = admin.credential.applicationDefault();
  }

  if (!options.credential) {
    throw new Error(
      "Firebase credential missing. Set FIREBASE_SERVICE_ACCOUNT (JSON string) or GOOGLE_APPLICATION_CREDENTIALS (path to service account JSON) in server/.env",
    );
  }

  return admin.initializeApp(options);
}

initFirebase();

export const db: Firestore = admin.firestore();
export const auth = admin.auth();

export function timestampToDate(
  v: Timestamp | Date | null | undefined,
): Date | null {
  if (!v) return null;
  if (v instanceof Date) return v;
  return (v as Timestamp).toDate?.() ?? null;
}

export function dateToTimestamp(
  v: Date | string | null | undefined,
): Timestamp | null {
  if (!v) return null;
  const d = typeof v === "string" ? new Date(v) : v;
  return admin.firestore.Timestamp.fromDate(d);
}
