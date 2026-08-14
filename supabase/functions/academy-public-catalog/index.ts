import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  throw new Error("Supabase runtime credentials are unavailable.");
}

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const COURSE_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function responseHeaders(requestId: string) {
  return {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "private, no-store, max-age=0, must-revalidate",
    "pragma": "no-cache",
    "x-content-type-options": "nosniff",
    "x-frame-options": "DENY",
    "referrer-policy": "no-referrer",
    "content-security-policy": "default-src 'none'; frame-ancestors 'none'",
    "x-robots-tag": "noindex, nofollow, noarchive, nosnippet, noimageindex",
    "x-obserra-request-id": requestId,
  };
}

function json(requestId: string, status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: responseHeaders(requestId),
  });
}

function defaultControl(courseId: string) {
  return {
    courseId,
    lifecycle: "unpublished",
    publicVisible: false,
    purchaseEnabled: false,
    preserveExistingEntitlements: true,
    revision: 0,
    updatedAt: null,
  };
}

function mapControl(row: Record<string, unknown>) {
  return {
    courseId: row.course_id,
    lifecycle: row.lifecycle,
    publicVisible: row.public_visible,
    purchaseEnabled: row.purchase_enabled,
    preserveExistingEntitlements: row.preserve_existing_entitlements,
    revision: row.revision,
    updatedAt: row.updated_at,
  };
}

function mapOverride(row: Record<string, unknown>) {
  return {
    courseId: row.course_id,
    course: row.course_summary,
    revision: row.revision,
    contentHash: row.content_hash,
    updatedAt: row.updated_at,
  };
}

Deno.serve(async (request: Request) => {
  const requestId = request.headers.get("x-obserra-request-id")?.slice(0, 100) || crypto.randomUUID();

  if (request.method !== "GET") {
    return json(requestId, 405, { error: "Method not allowed", requestId });
  }

  try {
    const courseId = new URL(request.url).searchParams.get("courseId")?.trim() ?? "";
    if (courseId) {
      if (!COURSE_ID_PATTERN.test(courseId)) {
        return json(requestId, 400, { error: "Invalid course identifier", requestId });
      }

      const controlResult = await admin
        .from("academy_course_controls")
        .select("course_id, lifecycle, public_visible, purchase_enabled, preserve_existing_entitlements, revision, updated_at")
        .eq("course_id", courseId)
        .eq("public_visible", true)
        .maybeSingle();

      if (controlResult.error) throw controlResult.error;

      const control = controlResult.data ? mapControl(controlResult.data) : defaultControl(courseId);
      if (!control.publicVisible) {
        return json(requestId, 200, {
          schemaVersion: "1.0",
          control,
          courseOverride: null,
          requestId,
        });
      }

      const overrideResult = await admin
        .from("academy_course_content_overrides")
        .select("course_id, course_summary, content_hash, revision, updated_at")
        .eq("course_id", courseId)
        .maybeSingle();

      if (overrideResult.error) throw overrideResult.error;

      return json(requestId, 200, {
        schemaVersion: "1.0",
        control,
        courseOverride: overrideResult.data ? mapOverride(overrideResult.data) : null,
        requestId,
      });
    }

    const controlsResult = await admin
      .from("academy_course_controls")
      .select("course_id, lifecycle, public_visible, purchase_enabled, preserve_existing_entitlements, revision, updated_at")
      .eq("public_visible", true)
      .order("course_id");

    if (controlsResult.error) throw controlsResult.error;

    const controlByCourse = new Map(
      (controlsResult.data ?? []).map((row) => [row.course_id, mapControl(row)]),
    );
    const publicCourseIds = Array.from(controlByCourse.keys());

    let courseOverrides: ReturnType<typeof mapOverride>[] = [];
    if (publicCourseIds.length > 0) {
      const overridesResult = await admin
        .from("academy_course_content_overrides")
        .select("course_id, course_summary, content_hash, revision, updated_at")
        .in("course_id", publicCourseIds)
        .order("course_id");

      if (overridesResult.error) throw overridesResult.error;
      courseOverrides = (overridesResult.data ?? []).map((row) => mapOverride(row));
    }

    return json(requestId, 200, {
      schemaVersion: "1.0",
      controls: Array.from(controlByCourse.values()),
      courseOverrides,
      requestId,
    });
  } catch (error) {
    console.error("academy catalog control failure", error);
    return json(requestId, 503, {
      error: "Academy catalog control service is temporarily unavailable.",
      code: "ACADEMY_CONTROL_UNAVAILABLE",
      requestId,
    });
  }
});
