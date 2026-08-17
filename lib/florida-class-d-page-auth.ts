import "server-only";

import { redirect } from "next/navigation";
import { connection } from "next/server";
import {
  FloridaClassDAuthorizationError,
  requireFloridaClassDSignedInUser,
} from "./florida-class-d-auth";

function safeReturnPath(value: string) {
  if (!value.startsWith("/") || value.startsWith("//") || /[\u0000-\u001f\u007f]/.test(value)) {
    return "/florida-security-training";
  }
  return value.slice(0, 2_000);
}

export async function requireFloridaClassDPageUser(returnPath: string) {
  // Authentication is request-scoped. Explicitly defer everything below this
  // boundary until an incoming request exists so Next.js never calls the
  // Supabase identity authority while prerendering protected learner pages.
  await connection();

  try {
    return await requireFloridaClassDSignedInUser();
  } catch (error) {
    if (error instanceof FloridaClassDAuthorizationError && error.status === 401) {
      const target = safeReturnPath(returnPath);
      redirect(`/sign-in?redirect_url=${encodeURIComponent(target)}`);
    }
    throw error;
  }
}
