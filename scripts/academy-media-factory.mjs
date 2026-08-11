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

function job({ course, provider, assetType, aspectRatio, durationSeconds, destination, brief, platform, sequence, qualityGates }) {
  const jobId = `${course.id}:${provider}:${assetType}:${sequence}`;
  return {
    jobId,
    idempotencyKey: stableHash({ jobId, brief, aspectRatio, durationSeconds }),
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

function buildJobs(course, tier, config) {
  const jobs = [];
  const lowerThird = config.brand.presenterLowerThird;
  const value = courseValue(course);
  const moduleCount = tier === 'flagship' ? 5 : tier === 'standard' ? 3 : 1;
  const shortCount = tier === 'flagship' ? 4 : tier === 'standard' ? 3 : 2;

  jobs.push(job({
    course,
    provider: 'heygen',
    assetType: 'instructor-welcome',
    platform: 'learnworlds,website,youtube',
    destination: 'course/intro',
    aspectRatio: '16:9',
    durationSeconds: 75,
    sequence: 1,
    brief: `Presenter: ${lowerThird}. Welcome learners to ${course.title}. Explain why the course matters, the practical outcomes, three success tips, and the next action. Core value: ${value}`,
    qualityGates: qualityGates(config, 'avatar'),
  }));

  for (let index = 1; index <= moduleCount; index += 1) {
    jobs.push(job({
      course,
      provider: 'heygen',
      assetType: `module-summary-${index}`,
      platform: 'learnworlds,youtube',
      destination: `course/module-${index}`,
      aspectRatio: '16:9',
      durationSeconds: tier === 'flagship' ? 150 : 105,
      sequence: index,
      brief: `Presenter: ${lowerThird}. Deliver a concise instructor summary for module ${index} of ${course.title}. Connect ${course.focus} to business context, evidence, decision authority, tradeoffs, and one applied action. End with a reflection prompt.`,
      qualityGates: qualityGates(config, 'avatar'),
    }));
  }

  jobs.push(job({
    course,
    provider: 'heygen',
    assetType: 'course-trailer-host',
    platform: 'website,youtube,linkedin',
    destination: 'marketing/trailer-host',
    aspectRatio: '16:9',
    durationSeconds: 50,
    sequence: 1,
    brief: `Presenter: ${lowerThird}. Create the host segments for a premium trailer for ${course.title}. Use a compelling opening, three learner outcomes, and a direct enrollment call to action. Leave visual transition space for Pollo B roll.`,
    qualityGates: qualityGates(config, 'avatar'),
  }));

  jobs.push(job({
    course,
    provider: 'pollo',
    assetType: 'cinematic-b-roll-pack',
    platform: 'learnworlds,website,youtube',
    destination: 'marketing/b-roll',
    aspectRatio: '16:9',
    durationSeconds: tier === 'flagship' ? 45 : 30,
    sequence: 1,
    brief: `Generate original cinematic visual sequences illustrating ${course.focus}. Style: premium enterprise, dark navy, black, gold, restrained holographic blue, realistic business environments, no third party logos, no text rendered into scenes, no invented people presented as real case subjects.`,
    qualityGates: qualityGates(config, 'visual'),
  }));

  jobs.push(job({
    course,
    provider: 'pollo',
    assetType: 'website-hero-loop',
    platform: 'website',
    destination: 'marketing/website-hero',
    aspectRatio: '16:9',
    durationSeconds: 8,
    sequence: 1,
    brief: `Create a seamless silent hero loop for ${course.title} representing ${course.focus}. Maintain Obserra visual language, leave negative space for web copy, avoid rapid motion, and support reduced motion alternatives.`,
    qualityGates: qualityGates(config, 'visual'),
  }));

  for (let index = 1; index <= shortCount; index += 1) {
    jobs.push(job({
      course,
      provider: 'pollo',
      assetType: `vertical-short-${index}`,
      platform: 'youtube-shorts,instagram-reels,tiktok,linkedin',
      destination: `social/short-${index}`,
      aspectRatio: '9:16',
      durationSeconds: 35,
      sequence: index,
      brief: `Create a vertical educational teaser for ${course.title}. Theme ${index}: ${['problem and consequence', 'executive decision', 'practical action', 'course value'][index - 1] || 'course insight'}. Use cinematic visuals, readable safe zones, no embedded captions, and a strong visual hook in the first two seconds.`,
      qualityGates: qualityGates(config, 'visual'),
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
    brief: `Create an executive visual explainer for ${course.title}. Emphasize one decision insight from ${course.focus}, with professional pacing and room for branded titles and captions in postproduction.`,
    qualityGates: qualityGates(config, 'visual'),
  }));

  return jobs;
}

function buildCalendar(courses, config) {
  const months = Array.from({ length: 12 }, (_, index) => ({ month: index + 1, courses: [] }));
  courses.forEach((course, index) => months[index % 12].courses.push(course.id));
  return {
    generatedAt: new Date().toISOString(),
    targetCoursesPerMonth: config.annualPlan.targetCoursesPerMonth,
    months,
  };
}

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function writeCsv(filePath, jobs) {
  const fields = ['jobId', 'courseId', 'courseTitle', 'provider', 'assetType', 'platform', 'destination', 'aspectRatio', 'durationSeconds', 'status'];
  const quote = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`;
  const lines = [fields.join(','), ...jobs.map((item) => fields.map((field) => quote(item[field])).join(','))];
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${lines.join('\n')}\n`, 'utf8');
}

function validateManifest(manifest, config) {
  const failures = [];
  if (!Array.isArray(manifest.courses) || manifest.courses.length < 1) failures.push('no-courses');
  if (!Array.isArray(manifest.jobs) || manifest.jobs.length < 1) failures.push('no-jobs');
  const ids = new Set();
  for (const item of manifest.jobs || []) {
    if (ids.has(item.idempotencyKey)) failures.push(`duplicate-idempotency-key:${item.jobId}`);
    ids.add(item.idempotencyKey);
    if (!['heygen', 'pollo'].includes(item.provider)) failures.push(`invalid-provider:${item.jobId}`);
    if (!['16:9', '9:16', '4:5', '1:1'].includes(item.aspectRatio)) failures.push(`invalid-aspect-ratio:${item.jobId}`);
    if (!item.ownerApprovalRequired) failures.push(`approval-not-required:${item.jobId}`);
    if (!item.syntheticMediaDisclosureRequired) failures.push(`disclosure-not-required:${item.jobId}`);
    if (!Array.isArray(item.qualityGates) || item.qualityGates.length < config.qualityGates.common.length) failures.push(`quality-gates-missing:${item.jobId}`);
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
const courses = parseCourseSpecs(fs.readFileSync(sourcePath, 'utf8'));
if (courses.length < config.minimumExpectedCatalogCourses) {
  fail(`Parsed ${courses.length} course specifications; expected at least ${config.minimumExpectedCatalogCourses}.`);
}
const selected = args.all ? courses : courses.filter((course) => course.id === args.course);
if (!selected.length) fail(`Course not found: ${args.course}`);

const jobs = selected.flatMap((course) => buildJobs(course, tierForCourse(course, config), config));
const manifest = {
  schemaVersion: '1.0.0',
  generatedAt: new Date().toISOString(),
  source: path.relative(ROOT, sourcePath).replaceAll('\\', '/'),
  courseCount: selected.length,
  jobCount: jobs.length,
  annualPlan: config.annualPlan,
  brand: config.brand,
  courses: selected.map((course) => ({ ...course, tier: tierForCourse(course, config) })),
  jobs,
};
manifest.manifestSha256 = stableHash({ ...manifest, manifestSha256: undefined });
const failures = validateManifest(manifest, config);

if (args.mode === 'validate') {
  if (failures.length) fail(`Validation failed: ${failures.join(', ')}`);
  console.log(`[academy-media-factory] Validation passed for ${manifest.courseCount} course(s) and ${manifest.jobCount} job(s).`);
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
  manifestSha256: manifest.manifestSha256,
  generatedAt: new Date().toISOString(),
});

if (failures.length) fail(`Generated files but validation failed: ${failures.join(', ')}`);
console.log(`[academy-media-factory] Generated ${manifest.jobCount} governed media jobs for ${manifest.courseCount} course(s) in ${outputRoot}.`);
