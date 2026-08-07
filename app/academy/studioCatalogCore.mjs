const SUPPORTED_SCHEMA_VERSIONS = Object.freeze(["1.2", "1.3", "1.4"]);
const supportedSchemaVersions = new Set(SUPPORTED_SCHEMA_VERSIONS);
const allowedDepartments = new Set(["Cyber", "Protection", "Intelligence", "Technologies"]);
const allowedLevels = new Set([
  "Foundation",
  "Professional",
  "Advanced",
  "Executive Intensive",
  "CISO Masterclass",
]);

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function toStringArray(value) {
  return Array.isArray(value) ? value.filter(isNonEmptyString).map((entry) => entry.trim()) : [];
}

function toModules(value) {
  if (!Array.isArray(value)) return [];

  return value.flatMap((candidate) => {
    if (!candidate || typeof candidate !== "object") return [];
    const module = candidate;
    if (
      !isNonEmptyString(module.title) ||
      !isNonEmptyString(module.duration) ||
      !isNonEmptyString(module.format) ||
      !isNonEmptyString(module.description)
    ) {
      return [];
    }

    return [{
      title: module.title.trim(),
      duration: module.duration.trim(),
      format: module.format.trim(),
      description: module.description.trim(),
    }];
  });
}

function releaseStatus(value) {
  return value === "approved" || value === "published" ? value : null;
}

function hasGovernedPublicationMetadata(source) {
  return Boolean(
    source.commerce &&
    source.licensing &&
    source.completion &&
    source.certificate &&
    source.branding &&
    source.tags &&
    source.disclaimer &&
    source.acknowledgementRequired === true &&
    source.certificate.isProfessionalCertification === false &&
    source.certificate.isComplianceEvidence === false
  );
}

function normalizeCourse(candidate) {
  if (!candidate || typeof candidate !== "object") return null;
  const source = candidate;
  const department = isNonEmptyString(source.department) && allowedDepartments.has(source.department)
    ? source.department
    : null;
  const level = isNonEmptyString(source.level) && allowedLevels.has(source.level)
    ? source.level
    : null;
  const modules = toModules(source.modules);
  const outcomes = toStringArray(source.outcomes);
  const status = releaseStatus(source.releaseStatus);

  if (
    !isNonEmptyString(source.id) ||
    !isNonEmptyString(source.title) ||
    !department ||
    !level ||
    !isNonEmptyString(source.track) ||
    !isNonEmptyString(source.audience) ||
    !isNonEmptyString(source.description) ||
    !isNonEmptyString(source.duration) ||
    !Number.isFinite(source.commerce?.price) ||
    source.commerce.price <= 0 ||
    source.commerce.currency !== "USD" ||
    !status ||
    outcomes.length === 0 ||
    modules.length === 0 ||
    !hasGovernedPublicationMetadata(source)
  ) {
    return null;
  }

  return {
    course: {
      id: source.id.trim(),
      title: source.title.trim(),
      department,
      level,
      track: source.track.trim(),
      audience: source.audience.trim(),
      description: source.description.trim(),
      duration: source.duration.trim(),
      price: source.commerce.price,
      outcomes,
      modules,
    },
    publication: {
      prerequisites: toStringArray(source.prerequisites),
      tags: source.tags,
      commerce: source.commerce,
      licensing: source.licensing,
      completion: source.completion,
      certificate: source.certificate,
      branding: source.branding,
      disclaimer: source.disclaimer,
      acknowledgementRequired: true,
      version: isNonEmptyString(source.version) ? source.version.trim() : null,
      releaseStatus: status,
    },
  };
}

export function parseStudioCatalog(catalog) {
  const source = catalog && typeof catalog === "object" ? catalog : {};
  const schemaVersion = isNonEmptyString(source.schemaVersion) ? source.schemaVersion.trim() : "unknown";
  const sourceCourses = Array.isArray(source.courses) ? source.courses : [];
  const supported = supportedSchemaVersions.has(schemaVersion);
  const status = {
    schemaVersion,
    generatedAt: isNonEmptyString(source.generatedAt) ? source.generatedAt.trim() : null,
    publisher: isNonEmptyString(source.publisher) ? source.publisher.trim() : null,
    supported,
    sourceCourseCount: sourceCourses.length,
    acceptedCourseCount: 0,
    rejectedCourseCount: 0,
  };

  if (!supported) {
    return {
      status,
      courses: [],
      publicationMetadataById: new Map(),
    };
  }

  const ids = new Set();
  const courses = [];
  const publicationMetadataById = new Map();
  let rejectedCourseCount = 0;

  for (const candidate of sourceCourses) {
    const parsed = normalizeCourse(candidate);
    if (!parsed || ids.has(parsed.course.id)) {
      rejectedCourseCount += 1;
      continue;
    }

    ids.add(parsed.course.id);
    courses.push(parsed.course);
    publicationMetadataById.set(parsed.course.id, parsed.publication);
  }

  status.acceptedCourseCount = courses.length;
  status.rejectedCourseCount = rejectedCourseCount;
  return { status, courses, publicationMetadataById };
}

export function mergeStudioCourseSets(fallbackCourses, studioCourses) {
  if (!Array.isArray(fallbackCourses) || !Array.isArray(studioCourses)) {
    throw new TypeError("fallbackCourses and studioCourses must be arrays.");
  }
  if (studioCourses.length === 0) return [...fallbackCourses];

  const merged = new Map(fallbackCourses.map((course) => [course.id, course]));
  for (const course of studioCourses) merged.set(course.id, course);
  return Array.from(merged.values());
}

export { SUPPORTED_SCHEMA_VERSIONS };
