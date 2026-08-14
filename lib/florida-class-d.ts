export type FloridaClassDModule = {
  id: number;
  title: string;
  hours: number;
  assessment: string;
};

export type FloridaClassDModuleSegment = {
  moduleId: number;
  hours: number;
};

export type FloridaClassDLiveLesson = {
  id: string;
  day: 1 | 2 | 3 | 4 | 5;
  lesson: 1 | 2 | 3 | 4;
  title: string;
  instructionalMinutes: 120;
  moduleSegments: FloridaClassDModuleSegment[];
  breakAfterMinutes: 0 | 15;
};

export const FLORIDA_CLASS_D_COURSE = {
  id: "florida-class-d-40-hour",
  title: "Florida Class D Security Officer Training",
  provider: "Obserra Executive Protection & Intelligence LLC",
  instructionalHours: 40,
  instructionalDays: 5,
  hoursPerDay: 8,
  liveLessonsPerDay: 4,
  instructionalMinutesPerLiveLesson: 120,
  breakMinutesAfterLiveLesson: 15,
  scheduledBreaksPerDay: 3,
  trackedBreakMinutesPerDay: 45,
  examQuestions: 170,
  passingCorrectAnswers: 128,
  status: "coming-soon" as const,
};

export const floridaClassDModules: FloridaClassDModule[] = [
  { id: 1, title: "Legal Aspects of Private Security", hours: 6, assessment: "Knowledge check + legal scenario" },
  { id: 2, title: "Role of Private Security Officers", hours: 2, assessment: "Role and authority check" },
  { id: 3, title: "Security Officer Conduct", hours: 3, assessment: "Professional conduct scenario" },
  { id: 4, title: "Principles of Communications", hours: 2, assessment: "Communication skills check" },
  { id: 5, title: "Observation and Incident Reporting", hours: 4, assessment: "Observation + report-writing exercise" },
  { id: 6, title: "Principles of Access Control", hours: 1, assessment: "Access-control decision check" },
  { id: 7, title: "Patrols", hours: 1, assessment: "Patrol scenario" },
  { id: 8, title: "Principles of Safeguarding Information", hours: 1, assessment: "Information-protection check" },
  { id: 9, title: "Physical Security", hours: 1, assessment: "Physical-security observation" },
  { id: 10, title: "Interviewing Techniques", hours: 1, assessment: "Interview scenario" },
  { id: 11, title: "Emergency Preparedness", hours: 1.5, assessment: "Emergency-priority exercise" },
  { id: 12, title: "Safety Awareness", hours: 2.5, assessment: "Safety hazard check" },
  { id: 13, title: "Medical Emergencies", hours: 4.5, assessment: "Medical-emergency knowledge check" },
  { id: 14, title: "Terrorism", hours: 2.5, assessment: "Threat-recognition scenario" },
  { id: 15, title: "Event Security and Special Assignments", hours: 1, assessment: "Event-security scenario" },
  { id: 16, title: "Communications Systems", hours: 1, assessment: "Radio communications check" },
  { id: 17, title: "Special Issues", hours: 4, assessment: "Integrated special-issues scenario" },
  { id: 18, title: "Introduction to Weapons", hours: 1, assessment: "Weapons-awareness knowledge check" },
];

export const floridaClassDLiveLessons: FloridaClassDLiveLesson[] = [
  { id: "D1-L1", day: 1, lesson: 1, title: "Legal Authority I", instructionalMinutes: 120, moduleSegments: [{ moduleId: 1, hours: 2 }], breakAfterMinutes: 15 },
  { id: "D1-L2", day: 1, lesson: 2, title: "Legal Authority II", instructionalMinutes: 120, moduleSegments: [{ moduleId: 1, hours: 2 }], breakAfterMinutes: 15 },
  { id: "D1-L3", day: 1, lesson: 3, title: "Legal Authority III", instructionalMinutes: 120, moduleSegments: [{ moduleId: 1, hours: 2 }], breakAfterMinutes: 15 },
  { id: "D1-L4", day: 1, lesson: 4, title: "Role of the Security Officer", instructionalMinutes: 120, moduleSegments: [{ moduleId: 2, hours: 2 }], breakAfterMinutes: 0 },

  { id: "D2-L1", day: 2, lesson: 1, title: "Security Officer Conduct I", instructionalMinutes: 120, moduleSegments: [{ moduleId: 3, hours: 2 }], breakAfterMinutes: 15 },
  { id: "D2-L2", day: 2, lesson: 2, title: "Conduct and Communications", instructionalMinutes: 120, moduleSegments: [{ moduleId: 3, hours: 1 }, { moduleId: 4, hours: 1 }], breakAfterMinutes: 15 },
  { id: "D2-L3", day: 2, lesson: 3, title: "Communications and Observation", instructionalMinutes: 120, moduleSegments: [{ moduleId: 4, hours: 1 }, { moduleId: 5, hours: 1 }], breakAfterMinutes: 15 },
  { id: "D2-L4", day: 2, lesson: 4, title: "Observation and Incident Reporting I", instructionalMinutes: 120, moduleSegments: [{ moduleId: 5, hours: 2 }], breakAfterMinutes: 0 },

  { id: "D3-L1", day: 3, lesson: 1, title: "Observation and Access Control", instructionalMinutes: 120, moduleSegments: [{ moduleId: 5, hours: 1 }, { moduleId: 6, hours: 1 }], breakAfterMinutes: 15 },
  { id: "D3-L2", day: 3, lesson: 2, title: "Patrol and Information Safeguarding", instructionalMinutes: 120, moduleSegments: [{ moduleId: 7, hours: 1 }, { moduleId: 8, hours: 1 }], breakAfterMinutes: 15 },
  { id: "D3-L3", day: 3, lesson: 3, title: "Physical Security and Interviewing", instructionalMinutes: 120, moduleSegments: [{ moduleId: 9, hours: 1 }, { moduleId: 10, hours: 1 }], breakAfterMinutes: 15 },
  { id: "D3-L4", day: 3, lesson: 4, title: "Emergency Preparedness and Safety", instructionalMinutes: 120, moduleSegments: [{ moduleId: 11, hours: 1.5 }, { moduleId: 12, hours: 0.5 }], breakAfterMinutes: 0 },

  { id: "D4-L1", day: 4, lesson: 1, title: "Safety Awareness", instructionalMinutes: 120, moduleSegments: [{ moduleId: 12, hours: 2 }], breakAfterMinutes: 15 },
  { id: "D4-L2", day: 4, lesson: 2, title: "Medical Emergencies I", instructionalMinutes: 120, moduleSegments: [{ moduleId: 13, hours: 2 }], breakAfterMinutes: 15 },
  { id: "D4-L3", day: 4, lesson: 3, title: "Medical Emergencies II", instructionalMinutes: 120, moduleSegments: [{ moduleId: 13, hours: 2 }], breakAfterMinutes: 15 },
  { id: "D4-L4", day: 4, lesson: 4, title: "Medical Emergencies and Terrorism", instructionalMinutes: 120, moduleSegments: [{ moduleId: 13, hours: 0.5 }, { moduleId: 14, hours: 1.5 }], breakAfterMinutes: 0 },

  { id: "D5-L1", day: 5, lesson: 1, title: "Terrorism and Event Security", instructionalMinutes: 120, moduleSegments: [{ moduleId: 14, hours: 1 }, { moduleId: 15, hours: 1 }], breakAfterMinutes: 15 },
  { id: "D5-L2", day: 5, lesson: 2, title: "Communications Systems and Special Issues I", instructionalMinutes: 120, moduleSegments: [{ moduleId: 16, hours: 1 }, { moduleId: 17, hours: 1 }], breakAfterMinutes: 15 },
  { id: "D5-L3", day: 5, lesson: 3, title: "Special Issues II", instructionalMinutes: 120, moduleSegments: [{ moduleId: 17, hours: 2 }], breakAfterMinutes: 15 },
  { id: "D5-L4", day: 5, lesson: 4, title: "Special Issues and Introduction to Weapons", instructionalMinutes: 120, moduleSegments: [{ moduleId: 17, hours: 1 }, { moduleId: 18, hours: 1 }], breakAfterMinutes: 0 },
];

export const floridaClassDDays = [1, 2, 3, 4, 5].map((day) => ({
  day: day as 1 | 2 | 3 | 4 | 5,
  lessons: floridaClassDLiveLessons.filter((lesson) => lesson.day === day),
}));

export function moduleTitle(moduleId: number) {
  return floridaClassDModules.find((module) => module.id === moduleId)?.title ?? `Module ${moduleId}`;
}

export const floridaClassDLmsAutomation = [
  "Secure account creation and identity-verification workflow",
  "Online purchase and automatic course entitlement",
  "Five-day, 40-hour regulated live learning path with sequential progression",
  "Single-device live-session control with authenticated student presence",
  "Instructional-time, break-time, and daily attendance evidence captured separately to the student record",
  "Security-question presence challenges at least every two hours with five-minute retry handling",
  "Live instructor questions, student Q&A, hand raise, polls, and participation records",
  "Module learning checks with automatic remediation routing",
  "Controlled 170-question certification examination after instructional completion",
  "Pass/fail, retest, and instructor-review workflow",
  "FDACS/LIAS reporting queue and completion-document workflow",
  "Inspection-ready student records and immutable administrative audit history",
  "Quality analytics for attendance, participation, assessments, remediation, examinations, instructors, and cohorts",
];
