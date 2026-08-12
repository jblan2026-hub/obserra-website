"use client";

import Image from "next/image";
import { useState } from "react";
import type { CourseProgress } from "../../../lib/academy";
import type { AssessmentQuestion, LessonBrief } from "../courseExperience";
import type { Course } from "../courseData";
import type { CourseOpening } from "../courseOpening";
import CoursePlayer from "./CoursePlayer";
import "./course-opening.css";

export default function CourseOpeningGate({
  course,
  opening,
  initialProgress,
  lessons,
  assessment,
  watermark,
}: {
  course: Course;
  opening: CourseOpening;
  initialProgress: CourseProgress;
  lessons: LessonBrief[];
  assessment: AssessmentQuestion[];
  watermark: string;
}) {
  const [acknowledged, setAcknowledged] = useState(false);
  const [introCompleted, setIntroCompleted] = useState(!opening.introduction.video.mediaReady);
  const [courseStarted, setCourseStarted] = useState(false);
  const video = opening.introduction.video;
  const canContinue = acknowledged && (video.reviewMode || introCompleted);

  if (courseStarted) {
    return (
      <CoursePlayer
        course={course}
        initialProgress={initialProgress}
        lessons={lessons}
        assessment={assessment}
        watermark={watermark}
      />
    );
  }

  return (
    <main className="course-opening-shell">
      <div className="course-opening-watermark" aria-hidden="true">{watermark}</div>

      <header className="course-opening-header">
        <a href="/academy" className="course-opening-brand">
          <Image src={opening.officialLogoPath} alt={opening.legalName} width={220} height={42} priority />
          <b>ACADEMY</b>
        </a>
        <a href="/academy" className="course-opening-exit">Exit course</a>
      </header>

      <section className="course-opening-title-card" aria-labelledby="course-opening-title">
        <div className="course-opening-title-mark">
          <Image src={opening.officialLogoPath} alt="" width={300} height={58} priority />
          <span>{opening.academyName}</span>
        </div>
        <p>{opening.titlePage.trackAndLevel}</p>
        <h1 id="course-opening-title">{opening.titlePage.courseTitle}</h1>
        <div className="course-opening-presenter">
          <strong>Presented by {opening.presenter.name}</strong>
          <span>{opening.presenter.title}</span>
        </div>
        <small>{opening.legalName}</small>
        <em>{opening.titlePage.versionLabel}</em>
      </section>

      <section className="course-opening-intro" aria-labelledby="course-intro-heading">
        <div className="course-opening-media">
          <div className="course-opening-media-top">
            <span>COURSE INTRODUCTION</span>
            <span>{video.masterResolution} MASTER REQUIRED</span>
          </div>

          {video.mediaReady && video.localAssetPath ? (
            <video
              controls
              playsInline
              preload="metadata"
              poster="/brand/visuals/obserra-academy.png"
              onEnded={() => setIntroCompleted(true)}
            >
              <source src={video.localAssetPath} type="video/mp4" />
              Your browser does not support the course introduction video.
            </video>
          ) : (
            <div className="course-opening-media-pending" role="status">
              <Image src={opening.officialLogoPath} alt="" width={236} height={46} />
              <p>Owner-approved presenter master pending</p>
              <h2 id="course-intro-heading">{opening.presenter.name} course introduction</h2>
              <span>
                The learner flow is ready for review. Production release remains blocked until the exact approved
                identity and voice are delivered as a speech-cleaned 4K master with captions and transcript.
              </span>
            </div>
          )}

          <div className="course-opening-media-footer">
            <span>{video.mediaReady ? "Approved media loaded" : "Controlled review mode"}</span>
            <b>INTRO REQUIRED BEFORE LESSON 1</b>
          </div>
        </div>

        <aside className="course-opening-quality" aria-label="Introduction production requirements">
          <p className="course-opening-kicker">Production acceptance</p>
          <h2>Executive-quality presenter standard</h2>
          <dl>
            <div><dt>Master</dt><dd>{video.masterResolution} highest-quality source</dd></div>
            <div><dt>Delivery</dt><dd>{video.deliveryResolution} controlled derivative</dd></div>
            <div><dt>Speech</dt><dd>Precision cleanup without changing voice identity</dd></div>
            <div><dt>Identity</dt><dd>Approved likeness, voice, and natural facial movement locked</dd></div>
            <div><dt>Access</dt><dd>Select captions and verified downloadable transcript</dd></div>
            <div><dt>Approval</dt><dd>Visual, auditory, technical, and owner acceptance required</dd></div>
          </dl>
          <div className="course-opening-status">
            <strong>Current status</strong>
            <span>{video.status.replaceAll("-", " ")}</span>
          </div>
        </aside>
      </section>

      <section className="course-opening-transcript" aria-labelledby="course-intro-transcript">
        <div>
          <p className="course-opening-kicker">Approved script plan</p>
          <h2 id="course-intro-transcript">Course-specific introduction transcript</h2>
          <p>
            Scripts may change by course. Presenter identity, approved voice, recognizable appearance, and natural
            facial-movement character may not change.
          </p>
        </div>
        <ol>
          {opening.introduction.transcript.map((paragraph, index) => (
            <li key={`${index}-${paragraph}`}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <p>{paragraph}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="course-opening-disclosures" aria-labelledby="course-disclosures-heading">
        <div className="course-opening-disclosures-heading">
          <p className="course-opening-kicker">Required learner disclosures</p>
          <h2 id="course-disclosures-heading">Review before beginning the lessons</h2>
          <p>These disclosures are part of the governed course opening and remain visible in the course record.</p>
        </div>
        <div className="course-opening-disclosure-grid">
          {opening.disclaimers.map((disclaimer, index) => (
            <article key={disclaimer.id}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h3>{disclaimer.title}</h3>
              <p>{disclaimer.body}</p>
            </article>
          ))}
        </div>

        <label className="course-opening-acknowledgement">
          <input
            type="checkbox"
            checked={acknowledged}
            onChange={(event) => setAcknowledged(event.target.checked)}
          />
          <span>
            I have reviewed the course disclosures. I understand that this is a controlled course-review build and
            that live release remains blocked until the owner-approved 4K introduction and all acceptance evidence exist.
          </span>
        </label>

        <button
          type="button"
          className="course-opening-continue"
          disabled={!canContinue}
          onClick={() => setCourseStarted(true)}
        >
          {opening.lessonTransitionLabel}
        </button>

        {!acknowledged ? <p className="course-opening-help">Acknowledge the disclosures to continue.</p> : null}
        {video.mediaReady && !introCompleted ? (
          <p className="course-opening-help">Complete the introduction video before continuing.</p>
        ) : null}
      </section>

      <footer className="course-opening-footer">
        Copyright {opening.legalName}. Proprietary training material. Unauthorized recording, downloading, copying,
        or redistribution is prohibited.
      </footer>
    </main>
  );
}
