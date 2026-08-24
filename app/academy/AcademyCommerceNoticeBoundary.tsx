"use client";

import { useSearchParams } from "next/navigation";
import AcademyCommerceNotice from "./AcademyCommerceNotice";

const MAX_STATUS_LENGTH = 80;

export default function AcademyCommerceNoticeBoundary({ fallbackStatus }: { fallbackStatus?: string }) {
  const searchParams = useSearchParams();
  const enrollmentStatus = searchParams.get("enrollment")?.trim().slice(0, MAX_STATUS_LENGTH);

  return <AcademyCommerceNotice status={enrollmentStatus || fallbackStatus} />;
}
