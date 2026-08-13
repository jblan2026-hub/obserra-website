export type FloridaClassDModule = {
  id: number;
  title: string;
  hours: number;
  day: 1 | 2 | 3 | 4 | 5;
  assessment: string;
};

export const FLORIDA_CLASS_D_COURSE = {
  id: "florida-class-d-40-hour",
  title: "Florida Class D Security Officer Training",
  provider: "Obserra Executive Protection & Intelligence LLC",
  instructionalHours: 40,
  instructionalDays: 5,
  hoursPerDay: 8,
  examQuestions: 170,
  passingCorrectAnswers: 128,
  status: "coming-soon" as const,
};

export const floridaClassDModules: FloridaClassDModule[] = [
  { id: 1, title: "Legal Aspects of Private Security", hours: 6, day: 1, assessment: "Knowledge check + legal scenario" },
  { id: 2, title: "Role of Private Security Officers", hours: 2, day: 1, assessment: "Role and authority check" },
  { id: 3, title: "Security Officer Conduct", hours: 3, day: 2, assessment: "Professional conduct scenario" },
  { id: 4, title: "Principles of Communications", hours: 2, day: 2, assessment: "Communication skills check" },
  { id: 5, title: "Observation and Incident Reporting", hours: 4, day: 2, assessment: "Observation + report-writing exercise" },
  { id: 6, title: "Principles of Access Control", hours: 1, day: 3, assessment: "Access-control decision check" },
  { id: 7, title: "Patrols", hours: 1, day: 3, assessment: "Patrol scenario" },
  { id: 8, title: "Principles of Safeguarding Information", hours: 1, day: 3, assessment: "Information-protection check" },
  { id: 9, title: "Physical Security", hours: 1, day: 3, assessment: "Physical-security observation" },
  { id: 10, title: "Interviewing Techniques", hours: 1, day: 3, assessment: "Interview scenario" },
  { id: 11, title: "Emergency Preparedness", hours: 1.5, day: 3, assessment: "Emergency-priority exercise" },
  { id: 12, title: "Safety Awareness", hours: 2.5, day: 4, assessment: "Safety hazard check" },
  { id: 13, title: "Medical Emergencies", hours: 4.5, day: 4, assessment: "Medical-emergency knowledge check" },
  { id: 14, title: "Terrorism", hours: 2.5, day: 4, assessment: "Threat-recognition scenario" },
  { id: 15, title: "Event Security and Special Assignments", hours: 1, day: 5, assessment: "Event-security scenario" },
  { id: 16, title: "Communications Systems", hours: 1, day: 5, assessment: "Radio communications check" },
  { id: 17, title: "Special Issues", hours: 4, day: 5, assessment: "Integrated special-issues scenario" },
  { id: 18, title: "Introduction to Weapons", hours: 1, day: 5, assessment: "Weapons-awareness knowledge check" },
];

export const floridaClassDDays = [1, 2, 3, 4, 5].map((day) => ({
  day,
  modules: floridaClassDModules.filter((module) => module.day === day),
}));

export const floridaClassDLmsAutomation = [
  "Secure account creation and identity-verification workflow",
  "Online purchase and automatic course entitlement",
  "Five-day, 40-hour regulated learning path with sequential progression",
  "Instructional-time and attendance evidence captured to the student record",
  "Module learning checks with automatic remediation routing",
  "Controlled 170-question certification examination after instructional completion",
  "Pass/fail, retest, and instructor-review workflow",
  "FDACS/LIAS reporting queue and completion-document workflow",
  "Inspection-ready student records and immutable administrative audit history",
  "Quality analytics for assessments, remediation, examinations, instructors, and cohorts",
];
