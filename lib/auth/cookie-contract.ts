type SupabaseAuthCookieInput = {
  projectRef: string;
  production: boolean;
};

export function supabaseAuthCookieOptions(input: SupabaseAuthCookieInput) {
  const projectRef = input.projectRef.trim().toLowerCase();
  if (!/^[a-z0-9]{20}$/.test(projectRef)) {
    throw new Error("Supabase Auth cookie project reference is invalid.");
  }

  return {
    name: `sb-obserra-auth-${projectRef}`,
    path: "/",
    sameSite: "lax" as const,
    secure: input.production,
    httpOnly: false,
    domain: undefined,
  };
}
