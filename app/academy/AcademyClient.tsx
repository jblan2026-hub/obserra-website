"use client";

import AcademyControlledClient from "./AcademyControlledClient";
import { courses } from "./courseData";

export default function AcademyClient() {
  return <AcademyControlledClient courses={courses} controlPlane="operational" />;
}
