"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Course } from "../../../academy/courseData";
import type { AssessmentQuestion, LessonBrief } from "../../../academy/courseExperience";

type AssessmentResult = {
  score: number;
  passed: boolean;
  correctCount: number;
  questionCount: number;
};

export default function OwnerCourseReviewClient({
  course,
  lessons,
  assessment,
}: {
  course: Course;
  lessons: LessonBrief[];
  assessment: AssessmentQuestion[];
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedCheck, setSelectedCheck] = useState<number | null>(null);
  const [answers, setAnswers] = useState<number[]>(() => Array(assessment.length).fill(-1));
  const [assessmentResult, setAssessmentResult] = useState<AssessmentResult | null>(null);
  const [assessmentError, setAssessmentError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const assessmentActive = activeIndex === lessons.length;
  const lesson = lessons[activeIndex];
  const answeredCount = useMemo(() => answers.filter((answer) => answer >= 0).length, [answers]);

  function openLesson(index: number) {
    setActiveIndex(index);
    setSelectedCheck(null);
    setAssessmentError("");
  }

  async function submitAssessment() {
    if (answers.some((answer) => answer < 0) || submitting) return;
    setSubmitting(true);
    setAssessmentError("");
    setAssessmentResult(null);
    try {
      const response = await fetch("/api/command-center/academy/review-assessment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId: course.id, answers }),
      });
      const payload = await response.json() as AssessmentResult & { error?: string };
      if (!response.ok) {
        setAssessmentError(payload.error ?? "The owner assessment review could not be scored.");
        return;
      }
      setAssessmentResult(payload);
    } catch {
      setAssessmentError("The owner assessment review could not reach the scoring service.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="owner-main">
      <section className="owner-section">
        <p className="owner-eyebrow">OWNER COURSE CONTENT REVIEW</p>
        <h1>{course.title}</h1>
        <p>{course.description}</p>
        <div className="owner-lesson-meta">
          <span>{course.department}</span>
          <span>{course.level}</span>
          <span>{course.duration}</span>
          <span>{lessons.length} lessons</span>
          <span>{assessment.length} final questions</span>
          <span>${course.price}</span>
        </div>
        <div className="owner-actions">
          <Link href="/command-center/academy" className="owner-link-button">Back to course catalog</Link>
          <Link href={`/command-center/academy/${course.id}/certificate`} className="owner-link-button">
            Review certificate sample
          </Link>
          <Link href={`/academy/${course.id}`} className="owner-link-button" target="_blank">
            Open public sales page
          </Link>
        </div>
      </section>

      <div className="owner-review-grid">
        <aside className="owner-lesson-nav" aria-label="Owner course review navigation">
          <p className="owner-eyebrow">COURSE CONTENT</p>
          {lessons.map((item, index) => (
            <button
              type="button"
              key={`${index}-${item.title}`}
              onClick={() => openLesson(index)}
              className={activeIndex === index ? "active" : ""}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div>
                <strong>{item.title}</strong>
                <small>{item.format} · {item.videoDuration}</small>
              </div>
            </button>
          ))}
          <button
            type="button"
            onClick={() => setActiveIndex(lessons.length)}
            className={assessmentActive ? "active" : ""}
          >
            <span>FA</span>
            <div>
              <strong>Final assessment</strong>
              <small>{assessment.length} questions · non-persistent owner review</small>
            </div>
          </button>
        </aside>

        {!assessmentActive && lesson ? (
          <div className="owner-review-stack">
            <section className="owner-review-panel">
              <p className="owner-eyebrow">LESSON {String(activeIndex + 1).padStart(2, "0")}</p>
              <h2>{lesson.title}</h2>
              <p>{lesson.focus}</p>
              <div className="owner-lesson-meta">
                <span>{lesson.format}</span>
                <span>{lesson.videoDuration}</span>
                <span>{lesson.videoChapters.length} guided chapters</span>
                <span>{lesson.authorities.length} authoritative sources</span>
              </div>
            </section>

            <section className="owner-review-panel">
              <p className="owner-eyebrow">WHY THIS LESSON MATTERS</p>
              <h2>Purpose and mastery objectives</h2>
              <p>{lesson.whyItMatters}</p>
              <ol>{lesson.objectives.map((objective) => <li key={objective}>{objective}</li>)}</ol>
            </section>

            <section className="owner-review-panel">
              <p className="owner-eyebrow">GUIDED VIDEO EXPERIENCE</p>
              <h2>{lesson.videoTitle}</h2>
              <div className="owner-review-stack">
                {lesson.videoChapters.map((chapter) => (
                  <article className="owner-subcard" key={`${chapter.timestamp}-${chapter.title}`}>
                    <strong>{chapter.timestamp} · {chapter.title}</strong>
                    <p>{chapter.narration}</p>
                  </article>
                ))}
              </div>
              <details>
                <summary>Read the complete guided transcript</summary>
                {lesson.transcript.map((line, index) => <p key={`${index}-${line.slice(0, 24)}`}>{line}</p>)}
              </details>
            </section>

            <section className="owner-review-panel">
              <p className="owner-eyebrow">OBSERVE · DECIDE · ACT</p>
              <div className="owner-three-column">
                <article className="owner-subcard"><h3>Observe</h3><p>{lesson.observe}</p></article>
                <article className="owner-subcard"><h3>Decide</h3><p>{lesson.decide}</p></article>
                <article className="owner-subcard"><h3>Act</h3><p>{lesson.act}</p></article>
              </div>
            </section>

            <section className="owner-review-panel">
              <p className="owner-eyebrow">PROFESSIONAL INSTRUCTION</p>
              <h2>Course-specific teaching content</h2>
              <div className="owner-review-stack">
                {lesson.instruction.map((section, index) => (
                  <article className="owner-subcard" key={section.heading}>
                    <h3>{String(index + 1).padStart(2, "0")} · {section.heading}</h3>
                    <p>{section.body}</p>
                    <strong>Organizational application</strong>
                    <p>{section.application}</p>
                  </article>
                ))}
              </div>
            </section>

            <section className="owner-review-panel">
              <p className="owner-eyebrow">GUIDED PROFESSIONAL PRACTICE</p>
              <h2>Required learner work and evidence</h2>
              <div className="owner-two-column">
                {lesson.guidedPractice.map((step, index) => (
                  <article className="owner-subcard" key={step.title}>
                    <h3>{String(index + 1).padStart(2, "0")} · {step.title}</h3>
                    <p>{step.instruction}</p>
                    <strong>Evidence to produce</strong>
                    <p>{step.evidence}</p>
                  </article>
                ))}
              </div>
            </section>

            <section className="owner-review-panel">
              <p className="owner-eyebrow">DECISION QUALITY RUBRIC</p>
              <h2>Strong and weak practice</h2>
              <div className="owner-review-stack">
                {lesson.decisionRubric.map((row) => (
                  <article className="owner-subcard" key={row.criterion}>
                    <h3>{row.criterion}</h3>
                    <div className="owner-two-column">
                      <div><strong>Strong practice</strong><p>{row.strong}</p></div>
                      <div><strong>Weak practice</strong><p>{row.weak}</p></div>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className="owner-review-panel">
              <p className="owner-eyebrow">COMMON FAILURE MODES</p>
              <div className="owner-two-column">
                {lesson.failureModes.map((failure) => (
                  <article className="owner-subcard" key={failure.pattern}>
                    <h3>{failure.pattern}</h3>
                    <p>{failure.whyItFails}</p>
                    <strong>Correction</strong>
                    <p>{failure.correction}</p>
                  </article>
                ))}
              </div>
            </section>

            <section className="owner-review-panel">
              <p className="owner-eyebrow">AUTHORITATIVE GROUNDING</p>
              <h2>Sources supporting the lesson</h2>
              <div className="owner-authority-grid">
                {lesson.authorities.map((authority) => (
                  <article className="owner-subcard" key={`${authority.publisher}-${authority.reference}`}>
                    <strong>{authority.publisher}</strong>
                    <h3>{authority.reference}</h3>
                    <p>{authority.whyItMatters}</p>
                    <a href={authority.url} target="_blank" rel="noreferrer">Open authoritative source</a>
                  </article>
                ))}
              </div>
            </section>

            <section className="owner-review-panel">
              <p className="owner-eyebrow">DOCUMENTED PRACTICE EXAMPLE</p>
              <h2>{lesson.practiceExample.title}</h2>
              <strong>{lesson.practiceExample.organization}</strong>
              <p>{lesson.practiceExample.summary}</p>
              <div className="owner-subcard">
                <strong>Professional takeaway</strong>
                <p>{lesson.practiceExample.takeaway}</p>
              </div>
              <a href={lesson.practiceExample.url} target="_blank" rel="noreferrer">Review public source</a>
            </section>

            <section className="owner-review-panel">
              <p className="owner-eyebrow">BUSINESS APPLICATION</p>
              <div className="owner-two-column">
                <article className="owner-subcard">
                  <h3>How the learner applies the lesson</h3>
                  <ol>{lesson.businessApplication.map((item) => <li key={item}>{item}</li>)}</ol>
                </article>
                <article className="owner-subcard">
                  <h3>Applied scenario</h3>
                  <p>{lesson.scenario}</p>
                </article>
              </div>
            </section>

            <section className="owner-review-panel">
              <p className="owner-eyebrow">MASTERY AND TRANSFER</p>
              <div className="owner-two-column">
                <article className="owner-subcard">
                  <h3>Mastery criteria</h3>
                  <ul>{lesson.masteryCriteria.map((item) => <li key={item}>{item}</li>)}</ul>
                </article>
                <article className="owner-subcard">
                  <h3>Reflection prompts</h3>
                  <ol>{lesson.reflectionPrompts.map((item) => <li key={item}>{item}</li>)}</ol>
                </article>
              </div>
            </section>

            <section className="owner-review-panel">
              <p className="owner-eyebrow">LEARNER MATERIALS</p>
              <div className="owner-material-grid">
                {lesson.materials.map((material) => (
                  <article className="owner-subcard" key={material.title}>
                    <h3>{material.title}</h3>
                    <p>{material.purpose}</p>
                    <ul>{material.content.map((item) => <li key={item}>{item}</li>)}</ul>
                  </article>
                ))}
              </div>
            </section>

            <section className="owner-review-panel">
              <p className="owner-eyebrow">INTERACTIVE KNOWLEDGE CHECK</p>
              <h2>{lesson.check.question}</h2>
              <div className="owner-check-options">
                {lesson.check.options.map((option, index) => (
                  <button
                    type="button"
                    key={option}
                    onClick={() => setSelectedCheck(index)}
                    className={selectedCheck === index ? "selected" : ""}
                  >
                    {String.fromCharCode(65 + index)}. {option}
                  </button>
                ))}
              </div>
              {selectedCheck !== null && (
                <div className="owner-feedback">
                  <strong>{selectedCheck === lesson.check.answer ? "Correct" : "Review this answer"}</strong>
                  <p>{lesson.check.explanation}</p>
                </div>
              )}
            </section>
          </div>
        ) : (
          <section className="owner-assessment-card">
            <p className="owner-eyebrow">NON-PERSISTENT OWNER ASSESSMENT REVIEW</p>
            <h2>Review the complete final assessment.</h2>
            <p>
              Answers are scored through an owner-only server route. No enrollment, progress, completion,
              assessment, or certificate record is created.
            </p>
            <p className="owner-muted">Answered {answeredCount} of {assessment.length} questions.</p>
            <div className="owner-assessment-list">
              {assessment.map((question, questionIndex) => (
                <article className="owner-subcard" key={`${questionIndex}-${question.question}`}>
                  <fieldset>
                    <legend>{questionIndex + 1}. {question.question}</legend>
                    <div className="owner-assessment-options">
                      {question.options.map((option, optionIndex) => (
                        <label key={option}>
                          <input
                            type="radio"
                            name={`owner-review-question-${questionIndex}`}
                            checked={answers[questionIndex] === optionIndex}
                            onChange={() => setAnswers((current) => current.map((answer, index) => (
                              index === questionIndex ? optionIndex : answer
                            )))}
                          />
                          {option}
                        </label>
                      ))}
                    </div>
                  </fieldset>
                </article>
              ))}
            </div>
            <button
              type="button"
              className="owner-primary"
              disabled={submitting || answers.some((answer) => answer < 0)}
              onClick={() => void submitAssessment()}
            >
              {submitting ? "Scoring owner review…" : "Score owner assessment review"}
            </button>
            {assessmentError && <p className="owner-feedback">{assessmentError}</p>}
            {assessmentResult && (
              <div className="owner-assessment-summary" aria-live="polite">
                <strong>{assessmentResult.score}%</strong>
                <span>{assessmentResult.correctCount} of {assessmentResult.questionCount} correct</span>
                <span>{assessmentResult.passed ? "Published completion threshold met" : "Published completion threshold not met"}</span>
                <span>No learner record created</span>
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
