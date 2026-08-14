#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const DEFAULT_SOURCE = path.join(ROOT, 'app', 'academy', 'courseData.ts');
const DEFAULT_CONFIG = path.join(ROOT, 'config', 'academy-media-factory.json');
const DEFAULT_OUTPUT = path.join(ROOT, 'release', 'academy-media-factory');

function fail(message) {
  console.error(`[academy-media-factory] ${message}`);
  process.exit(1);
}

function parseArgs(argv) {
  const args = { mode: 'plan', all: false };
  for (let index = 2; index < argv.length; index += 1) {
    const token = argv[index];
    if (token === '--all') args.all = true;
    else if (token === '--course') args.course = argv[++index];
    else if (token === '--mode') args.mode = argv[++index];
    else if (token === '--source') args.source = argv[++index];
    else if (token === '--config') args.config = argv[++index];
    else if (token === '--output') args.output = argv[++index];
    else if (token === '--help') args.help = true;
    else fail(`Unknown argument: ${token}`);
  }
  return args;
}

function printHelp() {
  console.log(`Usage:\n  node scripts/academy-media-factory.mjs --all\n  node scripts/academy-media-factory.mjs --course <course-id>\n\nOptions:\n  --mode plan|validate\n  --source <courseData.ts path>\n  --config <config JSON path>\n  --output <output directory>`);
}

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    fail(`Unable to read JSON ${filePath}: ${error.message}`);
  }
}

function parseCourseSpecs(sourceText) {
  const pattern = /\[\s*"([a-z0-9-]+)"\s*,\s*"([^"]+)"\s*,\s*"([^"]+)"\s*,\s*"([^"]+)"\s*,\s*"([^"]+)"\s*,\s*"([^"]+)"\s*\]/g;
  const courses = [];
  for (const match of sourceText.matchAll(pattern)) {
    courses.push({
      id: match[1],
      title: match[2],
      level: match[3],
      department: match[4],
      track: match[5],
      focus: match[6],
    });
  }
  return courses;
}

function stableHash(value) {
  return crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

function tierForCourse(course, config) {
  if (config.flagshipCourseIds.includes(course.id)) return 'flagship';
  if (config.standardCourseIds.includes(course.id)) return 'standard';
  return 'catalog';
}

function courseValue(course) {
  return `${course.title} helps ${course.department.toLowerCase()} and technology leaders apply ${course.focus} through evidence, accountable decisions, and practical action.`;
}

function standardProfile(provider, config, standard) {
  const base = {
    standardId: standard.standardId,
    standardName: standard.standardName,
    qualityClass: standard.qualityClass,
    sameQualityStandardForEveryCourse: config.productionStandard.sameQualityStandardForEveryCourse,
    minimumWidthPixels: standard.visualMaster.minimumWidthPixels,
    minimumHeightPixels: standard.visualMaster.minimumHeightPixels,
    acceptedFrameRates: standard.visualMaster.acceptedFrameRates,
    colorSpace: standard.visualMaster.colorSpace,
    audioSampleRateHz: standard.audioMaster.sampleRateHz,
    scenePlanRequired: standard.courseVideoArchitecture.scenePlanRequired,
    shotListRequired: standard.courseVideoArchitecture.shotListRequired,
    editDecisionListRequired: standard.courseVideoArchitecture.editDecisionListRequired,
    chapterStructureRequired: standard.courseVideoArchitecture.chapterStructureRequired,
    captionsRequired: standard.learnWorldsDelivery.selectableCaptionsRequired,
    transcriptRequired: standard.learnWorldsDelivery.verifiedTranscriptRequired,
    desktopPlaybackRequired: standard.learnWorldsDelivery.desktopPlaybackRequired,
    mobilePlaybackRequired: standard.learnWorldsDelivery.mobilePlaybackRequired,
    ownerApprovalRequired: standard.manualValidation.ownerApprovalRequired,
  };

  if (provider === 'heygen') {
    return {
      ...base,
      maximumUnbrokenAvatarSeconds: standard.courseVideoArchitecture.maximumUnbrokenAvatarSeconds,
      presenterScreenTimePercent: standard.courseVideoArchitecture.presenterScreenTimePercent,
      cinematicVisualTimePercent: standard.courseVideoArchitecture.cinematicVisualTimePercent,
      roboticCadenceProhibited: standard.presenterPerformance.roboticCadenceProhibited,
      likenessReviewRequired: standard.presenterPerformance.likenessReviewRequired,
      voiceSimilarityReviewRequired: standard.presenterPerformance.voiceSimilarityReviewRequired,
      lipSyncReviewRequired: standard.presenterPerformance.lipSyncReviewRequired,
      musicFreeMasterRequired: standard.audioMaster.musicFreeMasterRequired,
    };
  }

  return {
    ...base,
    minimumDistinctVisualContextsPerModule: standard.courseVideoArchitecture.minimumDistinctVisualContextsPerModule,
    minimumMeaningfulSceneChangesPerMinute: standard.courseVideoArchitecture.minimumMeaningfulSceneChangesPerMinute,
    generatedTextInsideSceneProhibited: standard.visualMaster.generatedTextInsideSceneProhibited,
    publicFigureLikenessProhibited: standard.visualMaster.publicFigureLikenessProhibited,
    physicallyPlausibleMotionRequired: true,
    reducedMotionAlternativeRequired: standard.learnWorldsDelivery.reducedMotionAlternativeRequired,
  };
}

function job({ course, provider, assetType, aspectRatio, durationSeconds, destination, brief, platform, sequence, qualityGates, productionProfile }) {
  const jobId = `${course.id}:${provider}:${assetType}:${sequence}`;
  return {
    jobId,
    idempotencyKey: stableHash({ jobId, brief, aspectRatio, durationSeconds, standardId: productionProfile.standardId }),
    courseId: course.id,
    courseTitle: course.title,
    provider,
    providerMode: 'manual-first-api-ready',
    assetType,
    platform,
    destination,
    aspectRatio,
    durationSeconds,
    brief,
    productionProfile,
    status: 'planned',
    ownerApprovalRequired: true,
    syntheticMediaDisclosureRequired: true,
    qualityGates,
  };
}

function qualityGates(config, type) {
  const common = [...config.qualityGates.common];
  if (type === 'avatar') return [...common, ...config.qualityGates.heygen];
  if (type === 'visual') return [...common, ...config.qualityGates.pollo];
  return common;
}

function buildJobs(course, tier, config, standard) {
  const jobs = [];
  const lowerThird = config.brand.presenterLowerThird;
  const value = courseValue(course);
  const moduleCount = standard.courseVideoArchitecture.requiredInstructionalModules;
  const moduleAnchorDuration = standard.courseVideoArchitecture.moduleAnchorFilmSeconds.target;
  const moduleVisualDuration = standard.courseVideoArchitecture.moduleVisualPackSeconds.target;
  const heygenProfile = standardProfile('heygen', config, standard);
  const polloProfile = standardProfile('pollo', config, standard);

  jobs.push(job({
    course,
    provider: 'heygen',
    assetType: 'instructor-welcome',
    platform: 'learnworlds,website,youtube',
    destination: 'course/intro',
    aspectRatio: '16:9',
    durationSeconds: standard.courseVideoArchitecture.courseWelcomeSeconds.target,
    sequence: 1,
    brief: `Presenter: ${lowerThird}. Create a cinematic course opening for ${course.title}. Begin with an executive or operational consequence, then welcome the learner, establish why the course matters, explain the practical outcomes, give three success principles, and transition into Module 1. Use natural pacing, pauses, realistic eye contact, restrained gestures, and no unbroken avatar shot longer than ${standard.courseVideoArchitecture.maximumUnbrokenAvatarSeconds} seconds. Core value: ${value}`,
    qualityGates: qualityGates(config, 'avatar'),
    productionProfile: heygenProfile,
  }));

  for (let index = 1; index <= moduleCount; index += 1) {
    jobs.push(job({
      course,
      provider: 'heygen',
      assetType: `module-anchor-film-${index}`,
      platform: 'learnworlds,youtube',
      destination: `course/module-${index}/anchor-film`,
      aspectRatio: '16:9',
      durationSeconds: moduleAnchorDuration,
      sequence: index,
      brief: `Presenter: ${lowerThird}. Produce a cinematic module anchor film for Module ${index} of ${course.title}. Build the film around a clear decision or consequence, business and mission context, evidence and uncertainty, decision authority and tradeoffs, a realistic instructional scenario, and one applied action. Use presenter segments as anchors, not as the entire lesson. Insert planned Pollo visual sequences, diagrams, environmental cutaways, and scenario moments so presenter screen time remains between ${standard.courseVideoArchitecture.presenterScreenTimePercent.minimum} and ${standard.courseVideoArchitecture.presenterScreenTimePercent.maximum} percent. No unbroken avatar shot may exceed ${standard.courseVideoArchitecture.maximumUnbrokenAvatarSeconds} seconds. Close with a reflection prompt and a direct transition to the LearnWorlds knowledge check.`,
      qualityGates: qualityGates(config, 'avatar'),
      productionProfile: heygenProfile,
    }));
  }

  jobs.push(job({
    course,
    provider: 'heygen',
    assetType: 'course-trailer-host',
    platform: 'website,youtube,linkedin',
    destination: 'marketing/trailer-host',
    aspectRatio: '16:9',
    durationSeconds: standard.courseVideoArchitecture.courseTrailerSeconds.target,
    sequence: 1,
    brief: `Presenter: ${lowerThird}. Create premium host segments for a cinematic sales trailer for ${course.title}. Open with a high-stakes learner problem, establish three defensible outcomes, show why the course is different from generic training, and close with a direct enrollment call to action. Leave editorial handles for Pollo B roll and use no presenter segment longer than ${standard.courseVideoArchitecture.maximumUnbrokenAvatarSeconds} seconds.`,
    qualityGates: qualityGates(config, 'avatar'),
    productionProfile: heygenProfile,
  }));

  for (let index = 1; index <= moduleCount; index += 1) {
    jobs.push(job({
      course,
      provider: 'pollo',
      assetType: `module-cinematic-visual-pack-${index}`,
      platform: 'learnworlds,website,youtube',
      destination: `course/module-${index}/visual-pack`,
      aspectRatio: '16:9',
      durationSeconds: moduleVisualDuration,
      sequence: index,
      brief: `Create a module-specific cinematic visual pack for Module ${index} of ${course.title}, focused on ${course.focus}. Supply at least ${standard.courseVideoArchitecture.minimumDistinctVisualContextsPerModule} visually distinct, physically plausible enterprise contexts with motivated lighting, realistic human behavior, controlled camera movement, editorial head and tail handles, and consistent people, locations, and props. Use the Obserra dark navy, black, restrained gold, and subtle blue visual language. No generated text inside scenes, no third-party logos, no public figures, no morphing anatomy, no generic looping stock look, and no invented case subject presented as real.`,
      qualityGates: qualityGates(config, 'visual'),
      productionProfile: polloProfile,
    }));
  }

  jobs.push(job({
    course,
    provider: 'pollo',
    assetType: 'website-hero-loop',
    platform: 'website',
    destination: 'marketing/website-hero',
    aspectRatio: '16:9',
    durationSeconds: 8,
    sequence: 1,
    brief: `Create a seamless silent cinematic hero loop for ${course.title} representing ${course.focus}. Maintain realistic enterprise environments, motivated lighting, restrained camera movement, Obserra visual language, negative space for web copy, and a reduced-motion alternative. Do not generate text, logos, public figures, or science-fiction gimmicks.`,
    qualityGates: qualityGates(config, 'visual'),
    productionProfile: polloProfile,
  }));

  for (let index = 1; index <= 3; index += 1) {
    jobs.push(job({
      course,
      provider: 'pollo',
      assetType: `vertical-short-${index}`,
      platform: 'youtube-shorts,instagram-reels,tiktok,linkedin',
      destination: `social/short-${index}`,
      aspectRatio: '9:16',
      durationSeconds: 35,
      sequence: index,
      brief: `Create a cinematic vertical educational teaser for ${course.title}. Theme ${index}: ${['problem and consequence', 'executive decision and tradeoff', 'practical action and course value'][index - 1]}. Use a visual hook in the first two seconds, realistic environments, controlled motion, safe zones for captions added in postproduction, and one defensible learning point. Do not generate text inside the scene or use generic looping stock imagery.`,
      qualityGates: qualityGates(config, 'visual'),
      productionProfile: polloProfile,
    }));
  }

  jobs.push(job({
    course,
    provider: 'pollo',
    assetType: 'linkedin-executive-clip',
    platform: 'linkedin',
    destination: 'social/linkedin',
    aspectRatio: '4:5',
    durationSeconds: 45,
    sequence: 1,
    brief: `Create a cinematic executive visual explainer for ${course.title}. Emphasize one decision insight from ${course.focus}, show realistic leadership and operational context, and leave clean safe areas for branded titles and captions in postproduction. Maintain measured pacing and enterprise credibility without generic cyber imagery or embedded text.`,
    qualityGates: qualityGates(config, 'visual'),
    productionProfile: polloProfile,
  }));

  return jobs;
}

function buildCalendar(courses, config) {
  const months = Array.from({ length: 12 }, (_, index) => ({ month: index + 1, courses: [] }));
  courses.forEach((course, index) => months[index % 12].courses.push(course.id));
  return {
    generatedAt: new Date().toISOString(),
    targetCoursesPerMonth: config.annualPlan.baselineCoursesPerMonth,
    acceleratedCoursesPerMonthAfterCanary: config.annualPlan.acceleratedCoursesPerMonthAfterCanary,
    months,
  };
}

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function writeCsv(filePath, jobs) {
  const fields = ['jobId', 'courseId', 'courseTitle', 'provider', 'assetType', 'platform', 'destination', 'aspectRatio', 'durationSeconds', 'status', 'productionStandardId'];
  const quote = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`;
  const lines = [
    fields.join(','),
    ...jobs.map((item) => fields.map((field) => quote(field === 'productionStandardId' ? item.productionProfile.standardId : item[field])).join(',')),
  ];
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${lines.join('\n')}\n`, 'utf8');
}

function validateManifest(manifest, config, standard) {
  const failures = [];
  if (!Array.isArray(manifest.courses) || manifest.courses.length < 1) failures.push('no-courses');
  if (!Array.isArray(manifest.jobs) || manifest.jobs.length < 1) failures.push('no-jobs');
  if (manifest.productionStandard.standardId !== standard.standardId) failures.push('production-standard-id-mismatch');
  if (config.productionStandard.sameQualityStandardForEveryCourse !== true) failures.push('same-quality-standard-not-required');

  const ids = new Set();
  for (const item of manifest.jobs || []) {
    if (ids.has(item.idempotencyKey)) failures.push(`duplicate-idempotency-key:${item.jobId}`);
    ids.add(item.idempotencyKey);
    if (!['heygen', 'pollo'].includes(item.provider)) failures.push(`invalid-provider:${item.jobId}`);
    if (!['16:9', '9:16', '4:5', '1:1'].includes(item.aspectRatio)) failures.push(`invalid-aspect-ratio:${item.jobId}`);
    if (!item.ownerApprovalRequired) failures.push(`approval-not-required:${item.jobId}`);
    if (!item.syntheticMediaDisclosureRequired) failures.push(`disclosure-not-required:${item.jobId}`);
    if (!Array.isArray(item.qualityGates) || item.qualityGates.length < config.qualityGates.common.length) failures.push(`quality-gates-missing:${item.jobId}`);
    if (item.productionProfile?.standardId !== standard.standardId) failures.push(`standard-profile-missing:${item.jobId}`);
    if (item.productionProfile?.qualityClass !== standard.qualityClass) failures.push(`quality-class-mismatch:${item.jobId}`);
    if (item.productionProfile?.minimumWidthPixels < standard.visualMaster.minimumWidthPixels) failures.push(`resolution-width-below-standard:${item.jobId}`);
    if (item.productionProfile?.minimumHeightPixels < standard.visualMaster.minimumHeightPixels) failures.push(`resolution-height-below-standard:${item.jobId}`);
    if (item.productionProfile?.scenePlanRequired !== true || item.productionProfile?.shotListRequired !== true) failures.push(`cinematic-planning-missing:${item.jobId}`);
    if (item.provider === 'heygen' && item.productionProfile.maximumUnbrokenAvatarSeconds > standard.courseVideoArchitecture.maximumUnbrokenAvatarSeconds) failures.push(`avatar-shot-too-long:${item.jobId}`);
  }

  for (const course of manifest.courses || []) {
    const courseJobs = manifest.jobs.filter((item) => item.courseId === course.id);
    const heygenJobs = courseJobs.filter((item) => item.provider === 'heygen');
    const polloJobs = courseJobs.filter((item) => item.provider === 'pollo');
    const moduleAnchorFilms = courseJobs.filter((item) => item.assetType.startsWith('module-anchor-film-'));
    const moduleVisualPacks = courseJobs.filter((item) => item.assetType.startsWith('module-cinematic-visual-pack-'));
    if (heygenJobs.length !== config.annualPlan.heyGenAssetsPerCourse) failures.push(`heygen-course-count-mismatch:${course.id}`);
    if (polloJobs.length !== config.annualPlan.polloAssetsPerCourse) failures.push(`pollo-course-count-mismatch:${course.id}`);
    if (moduleAnchorFilms.length !== standard.courseVideoArchitecture.requiredInstructionalModules) failures.push(`module-anchor-count-mismatch:${course.id}`);
    if (moduleVisualPacks.length !== standard.courseVideoArchitecture.requiredInstructionalModules) failures.push(`module-visual-pack-count-mismatch:${course.id}`);
  }

  if (manifest.courseCount === config.annualPlan.targetCourseCount) {
    const heygenTotal = manifest.jobs.filter((item) => item.provider === 'heygen').length;
    const polloTotal = manifest.jobs.filter((item) => item.provider === 'pollo').length;
    if (heygenTotal !== config.annualPlan.targetHeyGenAssets) failures.push('portfolio-heygen-total-mismatch');
    if (polloTotal !== config.annualPlan.targetPolloAssets) failures.push('portfolio-pollo-total-mismatch');
    if (manifest.jobCount !== config.annualPlan.targetTotalAssets) failures.push('portfolio-total-asset-mismatch');
  }
  return failures;
}

const args = parseArgs(process.argv);
if (args.help) {
  printHelp();
  process.exit(0);
}
if (!args.all && !args.course) fail('Specify --all or --course <course-id>.');
if (!['plan', 'validate'].includes(args.mode)) fail('--mode must be plan or validate.');

const sourcePath = path.resolve(args.source || DEFAULT_SOURCE);
const configPath = path.resolve(args.config || DEFAULT_CONFIG);
const outputRoot = path.resolve(args.output || DEFAULT_OUTPUT);
if (!fs.existsSync(sourcePath)) fail(`Course source not found: ${sourcePath}`);
if (!fs.existsSync(configPath)) fail(`Media factory config not found: ${configPath}`);

const config = readJson(configPath);
const standardPath = path.resolve(ROOT, config.productionStandard?.path || 'config/academy-cinematic-production-standard.json');
if (!fs.existsSync(standardPath)) fail(`Cinematic production standard not found: ${standardPath}`);
const standard = readJson(standardPath);
if (standard.standardId !== config.productionStandard.standardId) fail('Cinematic production standard ID does not match the factory configuration.');
if (standard.qualityClass !== config.productionStandard.qualityClass) fail('Cinematic production quality class does not match the factory configuration.');

const courses = parseCourseSpecs(fs.readFileSync(sourcePath, 'utf8'));
if (courses.length < config.minimumExpectedCatalogCourses) {
  fail(`Parsed ${courses.length} course specifications; expected at least ${config.minimumExpectedCatalogCourses}.`);
}
const selected = args.all ? courses : courses.filter((course) => course.id === args.course);
if (!selected.length) fail(`Course not found: ${args.course}`);

const jobs = selected.flatMap((course) => buildJobs(course, tierForCourse(course, config), config, standard));
const manifest = {
  schemaVersion: '1.1.0',
  generatedAt: new Date().toISOString(),
  source: path.relative(ROOT, sourcePath).replaceAll('\\', '/'),
  courseCount: selected.length,
  jobCount: jobs.length,
  annualPlan: config.annualPlan,
  brand: config.brand,
  productionStandard: {
    standardId: standard.standardId,
    standardName: standard.standardName,
    qualityClass: standard.qualityClass,
    source: path.relative(ROOT, standardPath).replaceAll('\\', '/'),
    sameQualityStandardForEveryCourse: config.productionStandard.sameQualityStandardForEveryCourse,
    minimumFinishedVideoMinutesPerCourse: standard.courseVideoArchitecture.minimumFinishedVideoMinutesPerCourse,
    targetFinishedVideoMinutesPerCourse: standard.courseVideoArchitecture.targetFinishedVideoMinutesPerCourse,
  },
  courses: selected.map((course) => ({ ...course, tier: tierForCourse(course, config), qualityClass: standard.qualityClass })),
  jobs,
};
manifest.manifestSha256 = stableHash({ ...manifest, manifestSha256: undefined });
const failures = validateManifest(manifest, config, standard);

if (args.mode === 'validate') {
  if (failures.length) fail(`Validation failed: ${failures.join(', ')}`);
  console.log(`[academy-media-factory] Validation passed for ${manifest.courseCount} course(s), ${manifest.jobCount} cinematic assets, and standard ${standard.standardId}.`);
  process.exit(0);
}

writeJson(path.join(outputRoot, 'academy-media-job-manifest.json'), manifest);
writeCsv(path.join(outputRoot, 'academy-media-job-register.csv'), jobs);
writeJson(path.join(outputRoot, 'academy-media-annual-calendar.json'), buildCalendar(selected, config));
writeJson(path.join(outputRoot, 'academy-media-validation.json'), {
  passed: failures.length === 0,
  findings: failures,
  courseCount: manifest.courseCount,
  jobCount: manifest.jobCount,
  heygenJobCount: jobs.filter((item) => item.provider === 'heygen').length,
  polloJobCount: jobs.filter((item) => item.provider === 'pollo').length,
  productionStandardId: standard.standardId,
  manifestSha256: manifest.manifestSha256,
  generatedAt: new Date().toISOString(),
});

if (failures.length) fail(`Generated files but validation failed: ${failures.join(', ')}`);
console.log(`[academy-media-factory] Generated ${manifest.jobCount} cinematic enterprise media jobs for ${manifest.courseCount} course(s) in ${outputRoot}.`);
