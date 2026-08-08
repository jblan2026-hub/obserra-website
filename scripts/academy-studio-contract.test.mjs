import assert from "node:assert/strict";
import test from "node:test";

import {
  SUPPORTED_SCHEMA_VERSIONS,
  mergeStudioCourseSets,
  parseStudioCatalog,
} from "../app/academy/studioCatalogCore.mjs";

function studioCourse(overrides = {}) {
  return {
    id: "cybersecurity-foundations",
    title: "Cybersecurity Foundations for New Professionals",
    department: "Cyber",
    level: "Foundation",
    track: "Cyber Defense Academy",
    audience: "Security leaders and new professionals",
    description: "A governed professional course with substantive applied instruction.",
    duration: "2.5 hours",
    prerequisites: [],
    outcomes: ["Apply cybersecurity foundations to defensible business decisions"],
    modules: [
      {
        id: "module-1",
        sequence: 1,
        title: "Decision context",
        duration: "24 min",
        format: "Interactive lesson",
        description: "Frame the decision and establish the evidence boundary.",
      },
    ],
    tags: { frameworks: ["NIST CSF 2.0"] },
    commerce: {
      model: "one-time",
      price: 149,
      currency: "USD",
      paymentLink: null,
      stripePriceId: null,
    },
    licensing: {
      entitlementType: "course-enrollment",
      seatScope: "named-learner",
      recurring: false,
    },
    completion: {
      allLessonsRequired: true,
      assessmentRequired: true,
      assessmentDuration: "42 min",
      passingScore: 80,
      certificateIssued: true,
    },
    certificate: {
      issuer: "OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC",
      title: "Certificate of Course Completion",
      isProfessionalCertification: false,
      isComplianceEvidence: false,
    },
    branding: { visualSystem: "Obserra" },
    disclaimer: "Completion is not professional certification or compliance validation.",
    acknowledgementRequired: true,
    version: "1.0.0",
    releaseStatus: "approved",
    ...overrides,
  };
}

function catalog(courses, schemaVersion = "1.4") {
  return {
    schemaVersion,
    generatedAt: "2026-08-07T16:00:00.000Z",
    publisher: "OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC",
    courses,
  };
}

test("Academy Studio parser supports the governed schema range through 1.4", () => {
  assert.deepEqual(SUPPORTED_SCHEMA_VERSIONS, ["1.2", "1.3", "1.4"]);
  for (const version of SUPPORTED_SCHEMA_VERSIONS) {
    const parsed = parseStudioCatalog(catalog([studioCourse()], version));
    assert.equal(parsed.status.supported, true);
    assert.equal(parsed.status.acceptedCourseCount, 1);
    assert.equal(parsed.status.rejectedCourseCount, 0);
  }
});

test("unsupported schemas fail closed without replacing the baseline catalog", () => {
  const parsed = parseStudioCatalog(catalog([studioCourse()], "9.9"));
  assert.equal(parsed.status.supported, false);
  assert.equal(parsed.courses.length, 0);
  assert.equal(parsed.publicationMetadataById.size, 0);
});

test("draft Studio records cannot enter the website runtime", () => {
  const parsed = parseStudioCatalog(catalog([studioCourse({ releaseStatus: "draft" })]));
  assert.equal(parsed.status.acceptedCourseCount, 0);
  assert.equal(parsed.status.rejectedCourseCount, 1);
});

test("approved records missing governed publication metadata fail closed", () => {
  const missingLicensing = studioCourse({ licensing: null });
  const unsafeCertificate = studioCourse({
    id: "unsafe-certificate",
    certificate: {
      issuer: "OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC",
      isProfessionalCertification: true,
      isComplianceEvidence: false,
    },
  });
  const parsed = parseStudioCatalog(catalog([missingLicensing, unsafeCertificate]));
  assert.equal(parsed.status.acceptedCourseCount, 0);
  assert.equal(parsed.status.rejectedCourseCount, 2);
});

test("duplicate approved Studio IDs are rejected after the first accepted record", () => {
  const parsed = parseStudioCatalog(catalog([
    studioCourse(),
    studioCourse({ title: "Duplicate should not override" }),
  ]));
  assert.equal(parsed.status.acceptedCourseCount, 1);
  assert.equal(parsed.status.rejectedCourseCount, 1);
  assert.equal(parsed.courses[0].title, "Cybersecurity Foundations for New Professionals");
});

test("approved Studio records preserve rich publication metadata", () => {
  const parsed = parseStudioCatalog(catalog([studioCourse()]));
  const metadata = parsed.publicationMetadataById.get("cybersecurity-foundations");
  assert.ok(metadata);
  assert.equal(metadata.releaseStatus, "approved");
  assert.equal(metadata.acknowledgementRequired, true);
  assert.equal(metadata.completion.passingScore, 80);
  assert.equal(metadata.certificate.isProfessionalCertification, false);
  assert.deepEqual(metadata.tags.frameworks, ["NIST CSF 2.0"]);
});

test("additive merge replaces matching IDs and appends newly approved courses", () => {
  const fallback = [
    {
      id: "cybersecurity-foundations",
      title: "Reviewed baseline",
      price: 149,
    },
    {
      id: "existing-second-course",
      title: "Existing second course",
      price: 249,
    },
  ];
  const approvedReplacement = {
    id: "cybersecurity-foundations",
    title: "Governed Studio replacement",
    price: 149,
  };
  const approvedNewCourse = {
    id: "new-approved-course",
    title: "New approved course",
    price: 349,
  };

  const merged = mergeStudioCourseSets(fallback, [approvedReplacement, approvedNewCourse]);
  assert.equal(merged.length, 3);
  assert.equal(merged.find((course) => course.id === "cybersecurity-foundations").title, "Governed Studio replacement");
  assert.ok(merged.some((course) => course.id === "existing-second-course"));
  assert.ok(merged.some((course) => course.id === "new-approved-course"));
});

test("empty Studio input returns a copied baseline without mutation", () => {
  const fallback = [{ id: "baseline", title: "Baseline" }];
  const merged = mergeStudioCourseSets(fallback, []);
  assert.deepEqual(merged, fallback);
  assert.notEqual(merged, fallback);
});
