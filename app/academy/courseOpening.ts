import type { Course } from "./courseData";

export type CourseOpeningDisclaimer = {
  id: string;
  title: string;
  body: string;
};

export type CourseOpening = {
  standardId: "obserra-course-opening-v1";
  academyName: "Obserra EPI Academy";
  legalName: "OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC";
  officialLogoPath: "/brand/obserra-logo.png";
  presenter: {
    name: "Dr. Jody Blanchard";
    title: "Founder and Cybersecurity Executive";
  };
  titlePage: {
    courseTitle: string;
    trackAndLevel: string;
    versionLabel: string;
  };
  introduction: {
    requiredBeforeFirstLesson: true;
    script: string;
    transcript: string[];
    spokenPronunciation: {
      cybersecurity: "cyber security";
    };
    video: {
      status: "awaiting-owner-approved-master" | "approved";
      reviewMode: boolean;
      mediaReady: boolean;
      localAssetPath: string | null;
      masterResolution: "3840x2160";
      deliveryResolution: "1920x1080";
      highestSupportedProviderResolutionRequired: true;
      upscaleRequiredWhenSourceBelow4K: true;
      upscaleMustNotAlterIdentity: true;
      speechCleanupRequired: true;
      speechEnhancementMode: "precision";
      cleanupMustNotAlterVoiceIdentity: true;
      captionsRequired: true;
      transcriptRequired: true;
      musicFreeMasterRequired: true;
      ownerApprovalRequired: true;
    };
  };
  disclaimers: CourseOpeningDisclaimer[];
  learnerAcknowledgementRequired: true;
  lessonTransitionLabel: string;
};

const academyName = "Obserra EPI Academy" as const;
const legalName = "OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC" as const;
const officialLogoPath = "/brand/obserra-logo.png" as const;

function cybersecurityFoundationsScript() {
  return [
    "Welcome to Obserra EPI Academy.",
    "I am Dr. Jody Blanchard, founder and cyber security executive at Obserra Executive Protection and Intelligence, L.L.C.",
    "You are beginning Cybersecurity Foundations for New Professionals.",
    "This course is designed to help you understand cyber security as a business and mission responsibility, recognize common indicators of risk, apply identity and control fundamentals, report suspicious activity safely, and build repeatable habits that strengthen resilience.",
    "Three principles will guide your work. Evaluate evidence before acting. Understand who owns the decision and when to escalate. Document a defensible next step so another professional can review it.",
    "Use the scenarios, guided practice, knowledge checks, workbook activities, and final assessment to apply what you learn.",
    "Examples may be fictional or composite. Follow applicable law, organizational policy, privacy requirements, and approved escalation procedures.",
    "Welcome to the course. Let us begin.",
  ];
}

function defaultCourseScript(course: Course) {
  const primaryOutcome = course.outcomes[0]?.replace(/^Frame\s+/i, "frame ") ?? "apply the course subject in business context";
  return [
    "Welcome to Obserra EPI Academy.",
    "I am Dr. Jody Blanchard, founder and cyber security executive at Obserra Executive Protection and Intelligence, L.L.C.",
    `You are beginning ${course.title}.`,
    `This course is designed to help you ${primaryOutcome}, evaluate evidence and uncertainty before acting, apply authority and proportionate escalation, and document a defensible next action.`,
    "Three principles will guide your work. Evaluate evidence before acting. Understand who owns the decision and when to escalate. Define how the result will be verified.",
    "Use the scenarios, guided practice, knowledge checks, course materials, and final assessment to apply what you learn.",
    "Examples may be fictional or composite. Follow applicable law, organizational policy, privacy requirements, and approved escalation procedures.",
    "Welcome to the course. Let us begin.",
  ];
}

function disclaimers(): CourseOpeningDisclaimer[] {
  return [
    {
      id: "general-professional-education",
      title: "Professional education",
      body: "This course provides general professional education and does not constitute legal, regulatory, medical, financial, investigative, incident-response, safety, or organization-specific advice.",
    },
    {
      id: "completion-not-certification",
      title: "Course completion",
      body: "Completion is a course completion record and does not confer professional certification, licensure, accreditation, regulatory approval, employment qualification, or authority to act outside an assigned role.",
    },
    {
      id: "fictional-composite-scenarios",
      title: "Instructional scenarios",
      body: "Examples and scenarios may be fictional, composite, simplified, or adapted for instruction. They must not be interpreted as claims about an unnamed real person or organization.",
    },
    {
      id: "authority-and-safe-action",
      title: "Authority and safe action",
      body: "Follow applicable law, organizational policy, privacy requirements, decision authority, and approved escalation procedures. Do not conduct unauthorized access, investigation, containment, surveillance, attribution, or response.",
    },
    {
      id: "source-boundary",
      title: "Sources and guidance",
      body: "The course distinguishes binding requirements from standards, frameworks, recognized guidance, Obserra teaching methods, and organizational choices. Verify obligations for your jurisdiction and role.",
    },
    {
      id: "authorized-synthetic-media",
      title: "Authorized presenter media",
      body: "The course may use the authorized digital likeness and voice of Dr. Jody Blanchard. Presenter media is subject to identity, voice, facial-motion, speech-cleanup, accessibility, and owner-approval controls.",
    },
    {
      id: "proprietary-material",
      title: "Proprietary material",
      body: "Course content is proprietary to OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC. Unauthorized recording, downloading, copying, redistribution, or commercial reuse is prohibited.",
    },
  ];
}

export function courseOpeningForCourse(course: Course): CourseOpening {
  const transcript = course.id === "cybersecurity-foundations"
    ? cybersecurityFoundationsScript()
    : defaultCourseScript(course);

  return {
    standardId: "obserra-course-opening-v1",
    academyName,
    legalName,
    officialLogoPath,
    presenter: {
      name: "Dr. Jody Blanchard",
      title: "Founder and Cybersecurity Executive",
    },
    titlePage: {
      courseTitle: course.title,
      trackAndLevel: `${course.track} · ${course.level}`,
      versionLabel: "Governed review build · release version assigned at approval",
    },
    introduction: {
      requiredBeforeFirstLesson: true,
      script: transcript.join(" "),
      transcript,
      spokenPronunciation: {
        cybersecurity: "cyber security",
      },
      video: {
        status: "awaiting-owner-approved-master",
        reviewMode: true,
        mediaReady: false,
        localAssetPath: null,
        masterResolution: "3840x2160",
        deliveryResolution: "1920x1080",
        highestSupportedProviderResolutionRequired: true,
        upscaleRequiredWhenSourceBelow4K: true,
        upscaleMustNotAlterIdentity: true,
        speechCleanupRequired: true,
        speechEnhancementMode: "precision",
        cleanupMustNotAlterVoiceIdentity: true,
        captionsRequired: true,
        transcriptRequired: true,
        musicFreeMasterRequired: true,
        ownerApprovalRequired: true,
      },
    },
    disclaimers: disclaimers(),
    learnerAcknowledgementRequired: true,
    lessonTransitionLabel: "Continue to Module 1 review",
  };
}
