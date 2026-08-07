import "server-only";

export type AcademyLessonMedia = {
  courseId: string;
  lessonIndex: number;
  videoUrl: string;
  posterUrl?: string;
  captionsUrl?: string;
};

function safeMediaUrl(value: string | undefined): string | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  try {
    const url = new URL(trimmed);
    if (url.protocol !== "https:") return null;
    return url.toString();
  } catch {
    return null;
  }
}

function mediaKey(courseId: string, lessonIndex: number) {
  return `${courseId}:${lessonIndex}`;
}

function parseManifest(): Map<string, AcademyLessonMedia> {
  const raw = process.env.OBSERRA_ACADEMY_MEDIA_MANIFEST?.trim();
  if (!raw) return new Map();

  try {
    const entries = JSON.parse(raw) as Array<Partial<AcademyLessonMedia>>;
    const manifest = new Map<string, AcademyLessonMedia>();
    for (const entry of entries) {
      if (typeof entry.courseId !== "string" || !Number.isInteger(entry.lessonIndex)) continue;
      const videoUrl = safeMediaUrl(entry.videoUrl);
      if (!videoUrl) continue;
      const lessonIndex = Number(entry.lessonIndex);
      manifest.set(mediaKey(entry.courseId, lessonIndex), {
        courseId: entry.courseId,
        lessonIndex,
        videoUrl,
        posterUrl: safeMediaUrl(entry.posterUrl) ?? undefined,
        captionsUrl: safeMediaUrl(entry.captionsUrl) ?? undefined,
      });
    }
    return manifest;
  } catch {
    return new Map();
  }
}

export function lessonMedia(courseId: string, lessonIndex: number): AcademyLessonMedia | null {
  return parseManifest().get(mediaKey(courseId, lessonIndex)) ?? null;
}

export function academyMediaConfigured(): boolean {
  return parseManifest().size > 0;
}
