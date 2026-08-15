import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { supabaseAuthCookieOptions } from "../auth/cookie-contract";
import { prepareSupabaseAuthRuntime } from "../auth/runtime-config";

export class SupabaseAuthConfigurationError extends Error {
  constructor(readonly reasonCodes: string[]) {
    super("Supabase Auth server runtime is unavailable.");
    this.name = "SupabaseAuthConfigurationError";
  }
}

export async function createSupabaseServerClient() {
  const runtime = prepareSupabaseAuthRuntime();
  if (!runtime.ready || !runtime.url || !runtime.projectRef || !runtime.publishableKey) {
    throw new SupabaseAuthConfigurationError(runtime.reasonCodes);
  }

  const cookieStore = await cookies();
  return createServerClient(runtime.url, runtime.publishableKey, {
    cookieOptions: supabaseAuthCookieOptions({
      projectRef: runtime.projectRef,
      production: process.env.VERCEL_ENV === "production",
    }),
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Components cannot write cookies. The request proxy owns refresh writes.
        }
      },
    },
  });
}
