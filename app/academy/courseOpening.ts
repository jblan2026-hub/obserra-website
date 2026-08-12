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
    purpose: "owner-course-welcome";
    requiredBeforeFirstLesson: true;
    script: string;
    transcript: string[];
    spokenPronunciation: {
      cybersecurity: "cyber security";
    };
    ownerSignature: {
      name: "Dr. Jody Blanchard";
      title: "Founder and Cybersecurity Executive";
      company: "OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC";
      placement: "bottom-of-course-welcome-script";
      spoken: false;
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
const presenterName = "Dr. Jody Blanchard" as const;
const presenterTitle = "Founder and Cybersecurity Executive" as const;

function cybersecurityFoundationsWelcomeScript() {
  return [
    "Welcome to Obserra EPI Academy and to Cybersecurity Foundations for New Professionals.",
    "I created this course to help you build the judgment, discipline, and practical habits needed to recognize cyber security risk, make accountable decisions, and act safely within your role.",
    "Cyber security is not only a technical responsibility. It is a business, mission, and leadership responsibility shared by every professional who handles information, systems, identities, operations, or trust.",
    "As you progress through the course, you will work through realistic scenarios, guided practice, knowledge checks, workbook activities, and a final assessment.",
    "Keep three principles in view. Evaluate evidence before acting. Understand who owns the decision and when to escalate. Document a defensible next step that another professional can review.",
    "The examples in this course may be fictional or composite. Apply the instruction in accordance with applicable law, organizational policy, privacy requirements, and approved escalation procedures.",
    "Thank you for investing in your professional development. Welcome to the course. Let us begin.",
  ];
}

function defaultCourseWelcomeScript(course: Course) {
  const primaryOutcome = course.outcomes[0]?.replace(/^Frame\s+/i, "frame ") ?? "apply the course subject in business context";
  return [
    `Welcome to Obserra EPI Academy and to ${course.title}.`,
    `I created this course to help you ${primaryOutcome}, evaluate evidence and uncertainty before acting, apply decision authority and proportionate escalation, and document a defensible next action.`,
    "Throughout the course, you will use realistic scenarios, guided practice, knowledge checks, course materials, and a final assessment to apply what you learn.",
    "Keep three principles in view. Evaluate evidence before acting. Understand who owns the decision and when to escalate. Define how the result will be verified.",
    "The examples in this course may be fictional or composite. Apply the instruction in accordance with applicable law, organizational policy, privacy requirements, and approved escalation procedures.",
    "Thank you for investing in your professional development. Welcome to the course. Let us begin.",
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
    ? cybersecurityFoundationsWelcomeScript()
    : defaultCourseWelcomeScript(course);

  return {
    standardId: "obserra-course-opening-v1",
    academyName,
    legalName,
    officialLogoPath,
    presenter: {
      name: presenterName,
      title: presenterTitle,
    },
    titlePage: {
      courseTitle: course.title,
      trackAndLevel: `${course.track} · ${course.level}`,
      versionLabel: "Governed review build · release version assigned at approval",
    },
    introduction: {
      purpose: "owner-course-welcome",
      requiredBeforeFirstLesson: true,
      script: transcript.join(" "),
      transcript,
      spokenPronunciation: {
        cybersecurity: "cyber security",
      },
      ownerSignature: {
        name: presenterName,
        title: presenterTitle,
        company: legalName,
        placement: "bottom-of-course-welcome-script",
        spoken: false,
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
