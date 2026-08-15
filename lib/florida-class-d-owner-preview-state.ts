import "server-only";

import { floridaClassDSupabaseServerConfigAuthorized } from "./florida-class-d-supabase-config";
import {
  evaluateFloridaClassDOwnerPreviewState,
  type FloridaClassDOwnerPreviewCountRequest,
} from "./florida-class-d-owner-preview-state-contract";

export type {
  FloridaClassDOwnerPreviewCountKey,
  FloridaClassDOwnerPreviewCountRequest,
  FloridaClassDOwnerPreviewState,
} from "./florida-class-d-owner-preview-state-contract";

function liveCountRequest(): FloridaClassDOwnerPreviewCountRequest {
  const url = (process.env.OBSERRA_FDACS_SUPABASE_URL?.trim() || "").replace(/\/$/, "");
  const serviceRoleKey = process.env.OBSERRA_FDACS_SUPABASE_SERVICE_ROLE_KEY?.trim() || "";
  if (!floridaClassDSupabaseServerConfigAuthorized(url, serviceRoleKey)) {
    throw new Error("The isolated FDACS database is not configured.");
  }
  return (table, init) => fetch(`${url}/rest/v1/${table}?select=id`, {
    ...init,
    cache: "no-store",
    redirect: "error",
    headers: {
      accept: "application/json",
      apikey: serviceRoleKey,
      authorization: `Bearer ${serviceRoleKey}`,
      prefer: "count=exact",
      range: "0-0",
      ...(init.headers ?? {}),
    },
    signal: init.signal ?? AbortSignal.timeout(10_000),
  });
}

export function readFloridaClassDOwnerPreviewState(nowMs = Date.now()) {
  try {
    return evaluateFloridaClassDOwnerPreviewState({ request: liveCountRequest(), nowMs });
  } catch {
    return evaluateFloridaClassDOwnerPreviewState({
      request: async () => new Response(null, { status: 503 }),
      nowMs,
    });
  }
}
