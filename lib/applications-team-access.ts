const APPLICATIONS_TEAM_ENV = "OBSERRA_APPLICATIONS_TEAM_USER_IDS";
const MAX_TEAM_MEMBERS = 100;
const MAX_USER_ID_LENGTH = 128;
const CLERK_USER_ID_PATTERN = /^user_[A-Za-z0-9_-]+$/;

function configuredApplicationsTeamUserIds(): ReadonlySet<string> | null {
  const raw = process.env[APPLICATIONS_TEAM_ENV]?.trim();
  if (!raw) return null;

  const entries = raw
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);

  if (entries.length === 0 || entries.length > MAX_TEAM_MEMBERS) return null;

  const unique = new Set<string>();
  for (const entry of entries) {
    if (
      entry.length > MAX_USER_ID_LENGTH ||
      !CLERK_USER_ID_PATTERN.test(entry) ||
      unique.has(entry)
    ) {
      return null;
    }
    unique.add(entry);
  }

  return unique;
}

export function applicationsTeamUserAuthorized(userId: string | null | undefined): boolean {
  if (!userId || userId.length > MAX_USER_ID_LENGTH || !CLERK_USER_ID_PATTERN.test(userId)) return false;
  const authorizedUserIds = configuredApplicationsTeamUserIds();
  if (!authorizedUserIds) return false;
  return authorizedUserIds.has(userId);
}
