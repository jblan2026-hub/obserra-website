import "server-only";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function config() {
  const key = process.env.OBSERRA_SUPABASE_SERVICE_ROLE_KEY?.trim() || process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || "";
  const url = (process.env.OBSERRA_SUPABASE_URL?.trim() || "").replace(/\/$/, "");
  if (!key || !url.startsWith("https://")) throw new Error("Class D live feed persistence is not configured.");
  return { key, url };
}

export async function listFloridaClassDLiveInteractions(liveSessionId: string) {
  if (!UUID_PATTERN.test(liveSessionId)) throw new Error("Invalid Class D live session id.");
  const { key, url } = config();
  const query = new URLSearchParams({
    select: "id,enrollment_id,actor_role,actor_clerk_user_id,interaction_type,content,parent_interaction_id,created_at",
    live_session_id: `eq.${liveSessionId}`,
    order: "created_at.asc",
    limit: "300",
  });
  const response = await fetch(`${url}/rest/v1/fdacs_class_d_live_interactions?${query}`, {
    cache: "no-store",
    headers: { accept: "application/json", apikey: key, authorization: `Bearer ${key}` },
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) throw new Error("Unable to load Class D live interaction feed.");
  return response.json() as Promise<Record<string, unknown>[]>;
}
