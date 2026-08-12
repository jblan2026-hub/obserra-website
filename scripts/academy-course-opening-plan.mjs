#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const DEFAULT_SOURCE = path.join(ROOT, 'app', 'academy', 'courseData.ts');
const DEFAULT_STANDARD = path.join(ROOT, 'config', 'academy-course-opening-standard.json');
const DEFAULT_OUTPUT = path.join(ROOT, 'release', 'academy-course-openings');
const EXPECTED_COURSES = 60;

function fail(message) {
  console.error(`[academy-course-opening-plan] ${message}`);
  process.exit(1);
}

function parseArgs(argv) {
  const args = { all: false, mode: 'plan' };
  for (let index = 2; index < argv.length; index += 1) {
    const token = argv[index];
    if (token === '--all') args.all = true;
    else if (token === '--course') args.course = argv[++index];
    else if (token === '--mode') args.mode = argv[++index];
    else if (token === '--source') args.source = argv[++index];
    else if (token === '--standard') args.standard = argv[++index];
    else if (token === '--output') args.output = argv[++index];
    else if (token === '--help') args.help = true;
    else fail(`Unknown argument: ${token}`);
  }
  return args;
}

function printHelp() {
  console.log(`Usage:\n  node scripts/academy-course-opening-plan.mjs --all\n  node scripts/academy-course-opening-plan.mjs --course <course-id>\n\nOptions:\n  --mode plan|validate\n  --source <courseData.ts path>\n  --standard <opening standard JSON path>\n  --output <output directory>`);
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
  return [...sourceText.matchAll(pattern)].map((match) => ({
    id: match[1],
    title: match[2],
    level: match[3],
    department: match[4],
    track: match[5],
    focus: match[6],
  }));
}

function hash(value) {
  return crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

function introScript(course, standard) {
  const presenter = standard.brand.presenterName;
  const title = standard.brand.presenterTitle;
  const company = standard.brand.spokenLegalName;

  if (course.id === 'cybersecurity-foundations') {
    return [
      'Welcome to Obserra EPI Academy and to Cybersecurity Foundations for New Professionals.',
      `I am ${presenter}, ${title} of ${company}`,
      'I created this course to help you build the judgment, discipline, and practical habits needed to recognize cyber security risk, make accountable decisions, and act safely within your role.',
      'Cyber security is not only a technical responsibility. It is a business, mission, and leadership responsibility shared by every professional who handles information, systems, identities, operations, or trust.',
      'As you progress through the five modules, you will work through realistic scenarios, guided practice, knowledge checks, workbook activities, and a final assessment.',
      'Keep three principles in view. Evaluate evidence before acting. Understand who owns the decision and when to escalate. Document a defensible next step that another professional can review.',
      'The examples in this course may be fictional or composite. Apply the instruction in accordance with applicable law, organizational policy, privacy requirements, and approved escalation procedures.',
      'Thank you for investing in your professional development. Welcome to the course. Let us begin.',
    ].join(' ');
  }

  return [
    `Welcome to ${standard.brand.academyName} and to ${course.title}.`,
    `I am ${presenter}, ${title} of ${company}`,
    `I created this course to help you apply ${course.focus} through evidence, accountable decisions, practical action, and measurable improvement.`,
    'Throughout the course, you will use realistic scenarios, guided practice, knowledge checks, course materials, and a final assessment to apply what you learn.',
    'Keep three principles in view. Evaluate evidence before acting. Understand who owns the decision and when to escalate. Define how the result will be verified.',
    'The examples in this course may be fictional or composite. Apply the instruction in accordance with applicable law, organizational policy, privacy requirements, and approved escalation procedures.',
    'Thank you for investing in your professional development. Welcome to the course. Let us begin.',
  ].join(' ');
}

function titleCard(course, standard) {
  return {
    id: 'official-title-page',
    order: 1,
    type: 'title-card',
    durationSeconds: standard.sequence[0].durationSeconds,
    master: {
      widthPixels: standard.technicalMaster.widthPixels,
      heightPixels: standard.technicalMaster.heightPixels,
      aspectRatio: standard.technicalMaster.aspectRatio,
    },
    officialLogoPath: standard.brand.officialLogoPath,
    logoModificationAllowed: false,
    text: {
      academy: standard.brand.academyName,
      courseTitle: course.title,
      trackAndLevel: `${course.track} · ${course.level}`,
      presenter: `Presented by ${standard.brand.presenterName}`,
      presenterTitle: standard.brand.presenterTitle,
      legalName: standard.brand.legalName,
      officialWebsite: standard.brand.officialWebsiteDisplay,
      version: 'Course version assigned at release',
    },
  };
}

function disclaimerCard(standard) {
  return {
    id: 'learner-disclosures',
    order: 2,
    type: 'disclaimer-card',
    durationSeconds: standard.sequence[1].durationSeconds,
    learnerAcknowledgementRequired: true,
    statements: [...standard.sequence[1].requiredStatements],
    master: {
      widthPixels: standard.technicalMaster.widthPixels,
      heightPixels: standard.technicalMaster.heightPixels,
      aspectRatio: standard.technicalMaster.aspectRatio,
    },
  };
}

function presenterIntro(course, standard) {
  const intro = standard.sequence[2];
  return {
    id: 'owner-course-introduction',
    order: 3,
    type: 'presenter-video',
    provider: 'heygen',
    sourceMediaFactoryAssetType: 'instructor-welcome',
    presenter: standard.brand.presenterName,
    presenterTitle: standard.brand.presenterTitle,
    requiredBeforeFirstLesson: true,
    durationSeconds: { ...intro.durationSeconds },
    script: introScript(course, standard),
    spokenPronunciation: {
      cybersecurity: 'cyber security',
    },
    lowerThird: {
      line1: standard.brand.presenterName,
      line2: standard.brand.presenterTitle,
      line3: standard.brand.legalName,
      line4: standard.brand.officialWebsiteDisplay,
    },
    identityControls: {
      approvedSourceRequired: true,
      ownerPortraitCrossCheckRequired: true,
      facialIdentityLocked: true,
      voiceIdentityLocked: true,
      nameAndApprovedTitleLocked: true,
      additionalTitlesAllowed: false,
      employerReferencesAllowed: false,
      naturalFacialMovementCharacterLocked: true,
      scriptMayChangeByCourse: true,
      wardrobeMayChange: true,
      backgroundMayChange: true,
      lightingMayChange: true,
      framingMayChange: true,
      poseMayChange: true,
      graphicsMayChangeWithinBrandStandard: true,
      facialReshapingProhibited: true,
      beautificationProhibited: true,
      skinSmoothingProhibited: true,
      exaggeratedFacialAnimationProhibited: true,
      identityMismatchRequiresRejectionAndDeletion: true,
    },
    voiceSettings: {
      defaultSpeed: intro.defaultSpeechSpeed,
      pitch: 0,
      volume: 1,
      ownerAuditoryApprovalRequired: true,
    },
    speechCleanup: {
      required: intro.speechCleanupRequired === true,
      mode: intro.speechEnhancementMode,
      backgroundNoiseReductionRequired: intro.backgroundNoiseReductionRequired === true,
      cleanupMustNotAlterVoiceIdentity: intro.cleanupMustNotAlterVoiceIdentity === true,
      ownerAuditoryApprovalRequired: true,
    },
    providerOutput: {
      highestSupportedResolutionRequired: true,
      preferredProviderResolution: '4k',
      fallbackProviderResolution: '1080p only when 4k is unavailable',
    },
    finalMaster: {
      widthPixels: standard.technicalMaster.widthPixels,
      heightPixels: standard.technicalMaster.heightPixels,
      aspectRatio: standard.technicalMaster.aspectRatio,
      quality: standard.technicalMaster.quality,
      upscaleRequiredWhenSourceBelow4K: standard.technicalMaster.upscaleRequiredWhenSourceBelow4K,
      upscaleMustNotAlterIdentity: standard.technicalMaster.upscaleMustNotAlterIdentity,
      audioSampleRateHz: standard.technicalMaster.audioSampleRateHz,
      targetIntegratedLufs: standard.technicalMaster.targetIntegratedLufs,
      maximumTruePeakDbtp: standard.technicalMaster.maximumTruePeakDbtp,
      speechCleanupRequired: standard.technicalMaster.speechCleanupRequired,
      speechEnhancementMode: standard.technicalMaster.speechEnhancementMode,
      backgroundNoiseReductionRequired: standard.technicalMaster.backgroundNoiseReductionRequired,
      dialogueLevelingRequired: standard.technicalMaster.dialogueLevelingRequired,
      cleanupMustNotAlterVoiceIdentity: standard.technicalMaster.cleanupMustNotAlterVoiceIdentity,
      captionFileRequired: true,
      transcriptRequired: true,
      musicFreeMasterRequired: true,
    },
  };
}

function transition(standard) {
  return {
    id: 'lesson-transition',
    order: 4,
    type: 'transition',
    durationSeconds: standard.sequence[3].durationSeconds,
    destination: standard.sequence[3].destination,
  };
}

function buildOpening(course, standard) {
  const sequence = [
    titleCard(course, standard),
    disclaimerCard(standard),
    presenterIntro(course, standard),
    transition(standard),
  ];
  const opening = {
    courseId: course.id,
    courseTitle: course.title,
    department: course.department,
    level: course.level,
    track: course.track,
    focus: course.focus,
    standardId: standard.standardId,
    requiredBeforeFirstLesson: true,
    learnWorldsActivityOrder: [...standard.learnWorldsDelivery.requiredActivityOrder],
    sequence,
    releaseGates: [...standard.releaseGates],
    status: 'planned-owner-approval-required',
  };
  return { ...opening, openingSha256: hash(opening) };
}

function validate(openings, standard, allRequested) {
  const findings = [];
  if (!Array.isArray(openings) || openings.length < 1) findings.push('no-openings');
  if (allRequested && openings.length !== EXPECTED_COURSES) findings.push(`expected-${EXPECTED_COURSES}-openings-found-${openings.length}`);

  for (const opening of openings) {
    if (opening.standardId !== standard.standardId) findings.push(`standard-mismatch:${opening.courseId}`);
    if (opening.requiredBeforeFirstLesson !== true) findings.push(`intro-not-required-before-lessons:${opening.courseId}`);
    if (opening.sequence.length !== 4) findings.push(`opening-sequence-count:${opening.courseId}`);
    const [title, disclaimer, intro, transitionItem] = opening.sequence;
    if (title?.id !== 'official-title-page') findings.push(`title-page-missing:${opening.courseId}`);
    if (title?.officialLogoPath !== standard.brand.officialLogoPath) findings.push(`official-logo-mismatch:${opening.courseId}`);
    if (title?.text?.presenterTitle !== 'Founder and CEO') findings.push(`title-page-owner-title-mismatch:${opening.courseId}`);
    if (title?.text?.officialWebsite !== 'www.obserrallc.com') findings.push(`title-page-website-mismatch:${opening.courseId}`);
    if (disclaimer?.id !== 'learner-disclosures') findings.push(`disclaimer-missing:${opening.courseId}`);
    if (!Array.isArray(disclaimer?.statements) || disclaimer.statements.length < 5) findings.push(`disclaimer-statements-missing:${opening.courseId}`);
    if (disclaimer?.learnerAcknowledgementRequired !== true) findings.push(`disclaimer-acknowledgement-not-required:${opening.courseId}`);
    if (intro?.id !== 'owner-course-introduction') findings.push(`owner-intro-missing:${opening.courseId}`);
    if (intro?.presenter !== 'Dr. Jody Blanchard') findings.push(`presenter-mismatch:${opening.courseId}`);
    if (intro?.presenterTitle !== 'Founder and CEO') findings.push(`presenter-title-mismatch:${opening.courseId}`);
    if (intro?.identityControls?.facialIdentityLocked !== true || intro?.identityControls?.voiceIdentityLocked !== true) findings.push(`identity-not-locked:${opening.courseId}`);
    if (intro?.identityControls?.additionalTitlesAllowed !== false) findings.push(`additional-titles-not-prohibited:${opening.courseId}`);
    if (intro?.identityControls?.employerReferencesAllowed !== false) findings.push(`employer-references-not-prohibited:${opening.courseId}`);
    if (intro?.identityControls?.scriptMayChangeByCourse !== true) findings.push(`script-not-flexible:${opening.courseId}`);
    if (intro?.voiceSettings?.defaultSpeed !== 0.92) findings.push(`speech-speed-mismatch:${opening.courseId}`);
    if (intro?.speechCleanup?.required !== true) findings.push(`speech-cleanup-not-required:${opening.courseId}`);
    if (intro?.speechCleanup?.mode !== 'precision') findings.push(`speech-cleanup-mode-mismatch:${opening.courseId}`);
    if (intro?.speechCleanup?.cleanupMustNotAlterVoiceIdentity !== true) findings.push(`speech-cleanup-voice-boundary-missing:${opening.courseId}`);
    if (!String(intro?.script ?? '').includes('Obserra EPI Academy')) findings.push(`intro-script-missing-academy:${opening.courseId}`);
    if (!String(intro?.script ?? '').includes('Founder and CEO')) findings.push(`intro-script-owner-title-missing:${opening.courseId}`);
    if (String(intro?.script ?? '').match(/CISO|Chief Information Security Officer|Cybersecurity Executive/i)) findings.push(`unapproved-owner-title-in-intro:${opening.courseId}`);
    if (intro?.lowerThird?.line4 !== 'www.obserrallc.com') findings.push(`lower-third-website-mismatch:${opening.courseId}`);
    if (intro?.finalMaster?.widthPixels !== 3840 || intro?.finalMaster?.heightPixels !== 2160) findings.push(`intro-not-4k:${opening.courseId}`);
    if (intro?.finalMaster?.upscaleRequiredWhenSourceBelow4K !== true) findings.push(`intro-upscale-not-required:${opening.courseId}`);
    if (intro?.finalMaster?.speechCleanupRequired !== true) findings.push(`intro-master-speech-cleanup-missing:${opening.courseId}`);
    if (transitionItem?.destination !== 'course orientation or Module 1') findings.push(`transition-destination-mismatch:${opening.courseId}`);
  }

  const foundations = openings.find((item) => item.courseId === 'cybersecurity-foundations');
  if (allRequested && !foundations) findings.push('cybersecurity-foundations-opening-missing');
  if (foundations) {
    const script = foundations.sequence.find((item) => item.id === 'owner-course-introduction')?.script ?? '';
    if (!script.includes('Cybersecurity Foundations for New Professionals')) findings.push('foundations-course-title-missing-from-intro');
    if (!script.includes('cyber security')) findings.push('foundations-pronunciation-safe-wording-missing');
  }
  return findings;
}

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function writeCsv(filePath, openings) {
  const fields = ['courseId', 'courseTitle', 'track', 'level', 'standardId', 'status', 'introWidth', 'introHeight', 'introSpeed', 'speechCleanupRequired', 'titlePageRequired', 'disclaimerRequired', 'ownerIntroRequired'];
  const quote = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`;
  const rows = openings.map((opening) => {
    const title = opening.sequence.find((item) => item.id === 'official-title-page');
    const disclaimer = opening.sequence.find((item) => item.id === 'learner-disclosures');
    const intro = opening.sequence.find((item) => item.id === 'owner-course-introduction');
    const record = {
      courseId: opening.courseId,
      courseTitle: opening.courseTitle,
      track: opening.track,
      level: opening.level,
      standardId: opening.standardId,
      status: opening.status,
      introWidth: intro?.finalMaster?.widthPixels,
      introHeight: intro?.finalMaster?.heightPixels,
      introSpeed: intro?.voiceSettings?.defaultSpeed,
      speechCleanupRequired: intro?.speechCleanup?.required,
      titlePageRequired: Boolean(title),
      disclaimerRequired: Boolean(disclaimer),
      ownerIntroRequired: Boolean(intro),
    };
    return fields.map((field) => quote(record[field])).join(',');
  });
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${fields.join(',')}\n${rows.join('\n')}\n`, 'utf8');
}

const args = parseArgs(process.argv);
if (args.help) {
  printHelp();
  process.exit(0);
}
if (!args.all && !args.course) fail('Specify --all or --course <course-id>.');
if (!['plan', 'validate'].includes(args.mode)) fail('--mode must be plan or validate.');

const sourcePath = path.resolve(args.source || DEFAULT_SOURCE);
const standardPath = path.resolve(args.standard || DEFAULT_STANDARD);
const outputRoot = path.resolve(args.output || DEFAULT_OUTPUT);
if (!fs.existsSync(sourcePath)) fail(`Course source not found: ${sourcePath}`);
if (!fs.existsSync(standardPath)) fail(`Opening standard not found: ${standardPath}`);

const standard = readJson(standardPath);
if (standard.standardId !== 'obserra-course-opening-v1') fail('Unexpected course opening standard ID.');
if (standard.brand.presenterTitle !== 'Founder and CEO') fail('Owner introduction title must be Founder and CEO.');
if (standard.brand.officialWebsiteDisplay !== 'www.obserrallc.com') fail('Official website must be www.obserrallc.com.');
const courses = parseCourseSpecs(fs.readFileSync(sourcePath, 'utf8'));
if (courses.length !== EXPECTED_COURSES) fail(`Parsed ${courses.length} courses; expected ${EXPECTED_COURSES}.`);
const selected = args.all ? courses : courses.filter((course) => course.id === args.course);
if (!selected.length) fail(`Course not found: ${args.course}`);

const openings = selected.map((course) => buildOpening(course, standard));
const findings = validate(openings, standard, args.all);
const manifest = {
  schemaVersion: '1.2.0',
  generatedAt: new Date().toISOString(),
  source: path.relative(ROOT, sourcePath).replaceAll('\\', '/'),
  standard: path.relative(ROOT, standardPath).replaceAll('\\', '/'),
  standardId: standard.standardId,
  courseCount: openings.length,
  openingCount: openings.length,
  fourKIntroCount: openings.filter((item) => {
    const intro = item.sequence.find((entry) => entry.id === 'owner-course-introduction');
    return intro?.finalMaster?.widthPixels === 3840 && intro?.finalMaster?.heightPixels === 2160;
  }).length,
  speechCleanupIntroCount: openings.filter((item) => {
    const intro = item.sequence.find((entry) => entry.id === 'owner-course-introduction');
    return intro?.speechCleanup?.required === true && intro?.speechCleanup?.mode === 'precision';
  }).length,
  passed: findings.length === 0,
  findings,
  openings,
};
manifest.manifestSha256 = hash({ ...manifest, manifestSha256: undefined });

if (args.mode === 'validate') {
  if (findings.length) fail(`Validation failed: ${findings.join(', ')}`);
  console.log(`[academy-course-opening-plan] Validation passed for ${openings.length} course opening(s); every intro uses the exact owner identity, Founder and CEO title, official Obserra EPI branding, and a speech-cleaned 4K master before the first lesson.`);
  process.exit(0);
}

writeJson(path.join(outputRoot, 'academy-course-opening-manifest.json'), manifest);
writeCsv(path.join(outputRoot, 'academy-course-opening-register.csv'), openings);
writeJson(path.join(outputRoot, 'academy-course-opening-validation.json'), {
  schemaVersion: '1.2.0',
  generatedAt: manifest.generatedAt,
  passed: findings.length === 0,
  findings,
  courseCount: manifest.courseCount,
  fourKIntroCount: manifest.fourKIntroCount,
  speechCleanupIntroCount: manifest.speechCleanupIntroCount,
  standardId: standard.standardId,
  manifestSha256: manifest.manifestSha256,
});

if (findings.length) fail(`Generated opening files but validation failed: ${findings.join(', ')}`);
console.log(`[academy-course-opening-plan] Generated ${openings.length} governed course opening sequence(s) in ${outputRoot}.`);
