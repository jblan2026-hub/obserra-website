"use client";

import { createBrowserClient } from "@supabase/ssr";
import { supabaseAuthCookieOptions } from "../auth/cookie-contract";
import type { SupabaseAuthRuntimeStatus } from "../auth/runtime-config";

type ApprovedBrowserAuthRuntime = Pick<
  SupabaseAuthRuntimeStatus,
  "ready" | "url" | "projectRef" | "publishableKey"
> & { production: boolean };

export function createSupabaseBrowserClient(runtime: ApprovedBrowserAuthRuntime) {
  if (!runtime.ready || !runtime.url || !runtime.publishableKey || !runtime.projectRef) {
    throw new Error("Supabase Auth browser runtime is unavailable.");
  }
  return createBrowserClient(runtime.url, runtime.publishableKey, {
    cookieOptions: supabaseAuthCookieOptions({
      projectRef: runtime.projectRef,
      production: runtime.production,
    }),
  });
}
