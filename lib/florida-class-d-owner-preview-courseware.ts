import "server-only";

import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { floridaClassDSupabaseServerConfigAuthorized } from "./florida-class-d-supabase-config";

const BUCKET = "fdacs-owner-review-courseware";
const SHA40 = /^[0-9a-f]{40}$/i;
const MAX_FILE_BYTES = 100 * 1024 * 1024;
const MAX_FILES_PER_RELEASE = 100;

const MEDIA_TYPES = {
  ".pptx": {
    contentTypes: ["application/vnd.openxmlformats-officedocument.presentationml.presentation"],
    kind: "powerpoint",
  },
  ".pdf": { contentTypes: ["application/pdf"], kind: "slides" },
  ".png": { contentTypes: ["image/png"], kind: "image" },
  ".jpg": { contentTypes: ["image/jpeg"], kind: "image" },
  ".jpeg": { contentTypes: ["image/jpeg"], kind: "image" },
  ".webp": { contentTypes: ["image/webp"], kind: "image" },
  ".mp4": { contentTypes: ["video/mp4"], kind: "video" },
  ".webm": { contentTypes: ["video/webm"], kind: "video" },
} as const;

type SupportedExtension = keyof typeof MEDIA_TYPES;
export type FloridaClassDOwnerCoursewareKind = typeof MEDIA_TYPES[SupportedExtension]["kind"];

export type FloridaClassDOwnerCourseware = {
  objectPath: string;
  fileName: string;
  contentType: string;
  sizeBytes: number;
  mediaKind: FloridaClassDOwnerCoursewareKind;
  createdAt: string | null;
};

export class FloridaClassDOwnerCoursewareError extends Error {
  constructor(
    message: string,
    readonly status: 400 | 404 | 409 | 413 | 503,
    readonly code: string,
  ) {
    super(message);
    this.name = "FloridaClassDOwnerCoursewareError";
  }
}

function config() {
  const url = (process.env.OBSERRA_FDACS_SUPABASE_URL?.trim() || "").replace(/\/$/, "");
  const key = process.env.OBSERRA_FDACS_SUPABASE_SERVICE_ROLE_KEY?.trim() || "";
  if (!floridaClassDSupabaseServerConfigAuthorized(url, key)) {
    throw new FloridaClassDOwnerCoursewareError(
      "Protected owner courseware storage is not configured.",
      503,
      "FDACS_OWNER_COURSEWARE_NOT_CONFIGURED",
    );
  }
  return { url, key };
}

function client() {
  const { url, key } = config();
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
  });
}

function releasePrefix(releaseSha: string) {
  const normalized = releaseSha.trim().toLowerCase();
  if (!SHA40.test(normalized)) {
    throw new FloridaClassDOwnerCoursewareError(
      "A valid exact-release SHA is required.",
      400,
      "FDACS_OWNER_COURSEWARE_RELEASE_INVALID",
    );
  }
  return `owner-review/${normalized}`;
}

function extension(fileName: string): SupportedExtension | null {
  const normalized = fileName.trim().toLowerCase();
  return (Object.keys(MEDIA_TYPES) as SupportedExtension[])
    .find((candidate) => normalized.endsWith(candidate)) ?? null;
}

function safeFileName(fileName: string) {
  const ext = extension(fileName);
  if (!ext) {
    throw new FloridaClassDOwnerCoursewareError(
      "Upload a PPTX, PDF, PNG, JPG, WEBP, MP4, or WEBM courseware file.",
      400,
      "FDACS_OWNER_COURSEWARE_TYPE_INVALID",
    );
  }
  const stem = fileName.slice(0, -ext.length)
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100) || "courseware";
  return `${stem}${ext}`;
}

function requireUpload(fileName: string, contentType: string, sizeBytes: number) {
  const safeName = safeFileName(fileName);
  const ext = extension(safeName) as SupportedExtension;
  const media = MEDIA_TYPES[ext];
  if (!media.contentTypes.includes(contentType as never)) {
    throw new FloridaClassDOwnerCoursewareError(
      "The uploaded file type does not match its extension.",
      400,
      "FDACS_OWNER_COURSEWARE_MIME_INVALID",
    );
  }
  if (!Number.isSafeInteger(sizeBytes) || sizeBytes < 1) {
    throw new FloridaClassDOwnerCoursewareError(
      "The courseware file is empty or invalid.",
      400,
      "FDACS_OWNER_COURSEWARE_SIZE_INVALID",
    );
  }
  if (sizeBytes > MAX_FILE_BYTES) {
    throw new FloridaClassDOwnerCoursewareError(
      "The courseware file exceeds the 100 MB owner-review limit.",
      413,
      "FDACS_OWNER_COURSEWARE_TOO_LARGE",
    );
  }
  return { safeName, ext, media };
}

function requireOwnedPath(objectPath: string, releaseSha: string) {
  const prefix = `${releasePrefix(releaseSha)}/`;
  if (
    !objectPath.startsWith(prefix)
    || objectPath.includes("..")
    || objectPath.includes("\\")
    || objectPath.length > 500
    || !extension(objectPath)
  ) {
    throw new FloridaClassDOwnerCoursewareError(
      "The courseware object is not owned by this exact owner-review release.",
      400,
      "FDACS_OWNER_COURSEWARE_PATH_INVALID",
    );
  }
  return objectPath;
}

function fileNameFromPath(path: string) {
  return path.split("/").at(-1)?.replace(/^[0-9a-f-]{36}-/, "") || "courseware";
}

function summary(path: string, value: Record<string, unknown>): FloridaClassDOwnerCourseware {
  const metadata = value.metadata && typeof value.metadata === "object" && !Array.isArray(value.metadata)
    ? value.metadata as Record<string, unknown>
    : {};
  const contentType = typeof metadata.mimetype === "string" ? metadata.mimetype : "application/octet-stream";
  const sizeBytes = Number(metadata.size ?? 0);
  const ext = extension(path);
  if (!ext) {
    throw new FloridaClassDOwnerCoursewareError(
      "Stored courseware has an unsupported type.",
      409,
      "FDACS_OWNER_COURSEWARE_STORED_TYPE_INVALID",
    );
  }
  return {
    objectPath: path,
    fileName: fileNameFromPath(path),
    contentType,
    sizeBytes: Number.isFinite(sizeBytes) ? sizeBytes : 0,
    mediaKind: MEDIA_TYPES[ext].kind,
    createdAt: typeof value.created_at === "string"
      ? value.created_at
      : typeof value.createdAt === "string"
      ? value.createdAt
      : null,
  };
}

export async function createFloridaClassDOwnerCoursewareUpload(input: {
  releaseSha: string;
  fileName: string;
  contentType: string;
  sizeBytes: number;
}) {
  const { safeName } = requireUpload(input.fileName, input.contentType, input.sizeBytes);
  const prefix = releasePrefix(input.releaseSha);
  const objectPath = `${prefix}/${randomUUID()}-${safeName}`;
  const storage = client().storage.from(BUCKET);
  const existing = await storage.list(prefix, { limit: MAX_FILES_PER_RELEASE });
  if (existing.error) {
    throw new FloridaClassDOwnerCoursewareError(
      "Protected courseware inventory is unavailable.",
      503,
      "FDACS_OWNER_COURSEWARE_LIST_FAILED",
    );
  }
  if ((existing.data?.length ?? 0) >= MAX_FILES_PER_RELEASE) {
    throw new FloridaClassDOwnerCoursewareError(
      "The owner-review courseware limit has been reached.",
      409,
      "FDACS_OWNER_COURSEWARE_LIMIT_REACHED",
    );
  }
  const ticket = await storage.createSignedUploadUrl(objectPath, { upsert: false });
  if (ticket.error || !ticket.data?.signedUrl || !ticket.data.token) {
    throw new FloridaClassDOwnerCoursewareError(
      "Protected courseware upload authorization could not be created.",
      503,
      "FDACS_OWNER_COURSEWARE_UPLOAD_AUTH_FAILED",
    );
  }
  return {
    objectPath,
    signedUploadUrl: ticket.data.signedUrl,
    uploadTokenExpiresInSeconds: 2 * 60 * 60,
    contentType: input.contentType,
    sizeBytes: input.sizeBytes,
  };
}

export async function finalizeFloridaClassDOwnerCourseware(input: {
  releaseSha: string;
  objectPath: string;
}) {
  const objectPath = requireOwnedPath(input.objectPath, input.releaseSha);
  const storage = client().storage.from(BUCKET);
  const info = await storage.info(objectPath);
  if (info.error || !info.data) {
    throw new FloridaClassDOwnerCoursewareError(
      "The uploaded courseware file could not be verified.",
      404,
      "FDACS_OWNER_COURSEWARE_UPLOAD_NOT_FOUND",
    );
  }
  const record = info.data as unknown as Record<string, unknown>;
  const value = summary(objectPath, record);
  requireUpload(value.fileName, value.contentType, value.sizeBytes);
  return value;
}

export async function listFloridaClassDOwnerCourseware(releaseSha: string) {
  const prefix = releasePrefix(releaseSha);
  const result = await client().storage.from(BUCKET).list(prefix, {
    limit: MAX_FILES_PER_RELEASE,
    sortBy: { column: "created_at", order: "desc" },
  });
  if (result.error) {
    throw new FloridaClassDOwnerCoursewareError(
      "Protected courseware inventory is unavailable.",
      503,
      "FDACS_OWNER_COURSEWARE_LIST_FAILED",
    );
  }
  return (result.data ?? []).flatMap((item) => {
    try {
      return [summary(`${prefix}/${item.name}`, item as unknown as Record<string, unknown>)];
    } catch {
      return [];
    }
  });
}

export async function createFloridaClassDOwnerCoursewareView(input: {
  releaseSha: string;
  objectPath: string;
}) {
  const objectPath = requireOwnedPath(input.objectPath, input.releaseSha);
  const result = await client().storage.from(BUCKET).createSignedUrl(objectPath, 5 * 60);
  if (result.error || !result.data?.signedUrl) {
    throw new FloridaClassDOwnerCoursewareError(
      "Protected courseware view access could not be created.",
      503,
      "FDACS_OWNER_COURSEWARE_VIEW_FAILED",
    );
  }
  return { objectPath, signedViewUrl: result.data.signedUrl, expiresInSeconds: 5 * 60 };
}

export async function deleteFloridaClassDOwnerCourseware(input: {
  releaseSha: string;
  objectPath: string;
}) {
  const objectPath = requireOwnedPath(input.objectPath, input.releaseSha);
  const result = await client().storage.from(BUCKET).remove([objectPath]);
  if (result.error) {
    throw new FloridaClassDOwnerCoursewareError(
      "Protected courseware deletion failed.",
      503,
      "FDACS_OWNER_COURSEWARE_DELETE_FAILED",
    );
  }
  return { deleted: true as const, objectPath };
}

export const FLORIDA_CLASS_D_OWNER_COURSEWARE_POLICY = {
  bucket: BUCKET,
  maximumFileBytes: MAX_FILE_BYTES,
  maximumFilesPerRelease: MAX_FILES_PER_RELEASE,
  acceptedExtensions: Object.keys(MEDIA_TYPES),
  privateStorage: true,
  exactReleaseBound: true,
  ownerAal2Required: true,
  trainingCreditEligible: false,
  regulatedDatabaseWritesAuthorized: false,
  secretsExposed: false,
} as const;
