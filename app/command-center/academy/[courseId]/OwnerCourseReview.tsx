"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { Course } from "../../../academy/courseData";
import type { KnowledgeCheck, LessonBrief } from "../../../academy/courseExperience";
import styles from "../../owner-command-center.module.css";

function optionLetter(index: number) {
  return String.fromCharCode(65 + index);
}

export default function OwnerCourseReview({
  course,
  lessons,
  assessment,
}: {
  course: Course;
  lessons: LessonBrief[];
  assessment: KnowledgeCheck[];
}) {
  const [activeView, setActiveView] = useState(0);
  const assessmentActive = activeView === lessons.length;
  const lesson = assessmentActive ? null : lessons[activeView] ?? null;
  const module = assessmentActive ? null : course.modules[activeView] ?? null;

  return (
    <main className={styles.shell}>
      <div className={styles.wrapWide}>
        <header className={styles.reviewHeader}>
          <div className={styles.brandBlock}>
            <Image
              className={styles.logo}
              src="/brand/obserra-logo.png"
              alt="Obserra Executive Protection and Intelligence LLC"
              width={220}
              height={43}
              priority
            />
            <p className={styles.eyebrow}>OWNER COMMAND CENTER · READ-ONLY COURSE REVIEW</p>
            <h1 className={styles.title}>{course.title}</h1>
            <p className={styles.intro}>{course.description}</p>
            <div className={styles.courseMeta}>
              <span>{course.department}</span>
              <span>{course.level}</span>
              <span>{course.duration}</span>
              <span>{course.modules.length} lessons</span>
              <span>${course.price}</span>
            </div>
            <nav className={styles.navLinks} aria-label="Course review navigation">
              <Link className={styles.navLink} href="/command-center/academy">All courses</Link>
              <Link className={styles.navLink} href={`/command-center/academy/${course.id}/certificate`}>Certificate sample</Link>
              <Link className={styles.navLink} href={`/academy/${course.id}`}>Public sales page</Link>
            </nav>
          </div>
        </header>

        <div className={styles.reviewBanner}>
          <strong>Owner review boundary:</strong> this page renders the complete lesson and answer-key content without calling learner progress, assessment scoring, checkout, entitlement, or certificate-issuance APIs.
        </div>

        <div className={styles.reviewLayout}>
          <aside className={styles.lessonNav} aria-label="Course content sections">
            {lessons.map((item, index) => {
              const courseModule = course.modules[index];
              return (
                <button
                  key={`${item.title}-${index}`}
                  type="button"
                  className={`${styles.lessonButton} ${activeView === index ? styles.activeLesson : ""}`}
                  onClick={() => setActiveView(index)}
                >
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <span>
                    <strong>{item.title}</strong>
                    <small>{courseModule?.format ?? item.format} · {courseModule?.duration ?? item.videoDuration}</small>
                  </span>
                </button>
              );
            })}
            <button
              type="button"
              className={`${styles.lessonButton} ${styles.assessmentButton} ${assessmentActive ? styles.activeLesson : ""}`}
              onClick={() => setActiveView(lessons.length)}
            >
              <span>25</span>
              <span><strong>Final assessment</strong><small>Private answer-key review</small></span>
            </button>
          </aside>

          <article className={styles.reviewContent}>
            {lesson ? (
              <>
                <header className={styles.contentHeader}>
                  <p className={styles.eyebrow}>LESSON {String(activeView + 1).padStart(2, "0")} · {module?.format ?? lesson.format}</p>
                  <h1>{lesson.title}</h1>
                  <p>{lesson.focus}</p>
                  <div className={styles.courseMeta}>
                    <span>{module?.duration ?? lesson.videoDuration}</span>
                    <span>{lesson.authorities.length} authorities</span>
                    <span>{lesson.materials.length} training materials</span>
                    <span>{lesson.guidedPractice.length} practice steps</span>
                  </div>
                </header>

                <section className={styles.contentSection}>
                  <p className={styles.eyebrow}>WHY THIS MATTERS</p>
                  <h2>Decision relevance</h2>
                  <p>{lesson.whyItMatters}</p>
                </section>

                <section className={styles.contentSection}>
                  <p className={styles.eyebrow}>MASTERY OBJECTIVES</p>
                  <h2>Required learning outcomes</h2>
                  <ol className={styles.numberedList}>
                    {lesson.objectives.map((objective, index) => <li key={objective}><strong>{index + 1}.</strong> {objective}</li>)}
                  </ol>
                </section>

                <section className={styles.contentSection}>
                  <p className={styles.eyebrow}>OBSERVE · DECIDE · ACT</p>
                  <div className={styles.contentGridThree}>
                    <div className={styles.contentCard}><strong>Observe</strong><p>{lesson.observe}</p></div>
                    <div className={styles.contentCard}><strong>Decide</strong><p>{lesson.decide}</p></div>
                    <div className={styles.contentCard}><strong>Act</strong><p>{lesson.act}</p></div>
                  </div>
                </section>

                <section className={styles.contentSection}>
                  <p className={styles.eyebrow}>GUIDED INSTRUCTION</p>
                  <h2>{lesson.videoTitle}</h2>
                  <ul className={styles.timeline}>
                    {lesson.videoChapters.map((chapter) => (
                      <li key={`${chapter.timestamp}-${chapter.title}`}>
                        <span>{chapter.timestamp}</span>
                        <div><strong>{chapter.title}</strong><p>{chapter.narration}</p></div>
                      </li>
                    ))}
                  </ul>
                  <details className={styles.transcript}>
                    <summary>Open complete guided transcript</summary>
                    {lesson.transcript.map((line) => <p key={line}>{line}</p>)}
                  </details>
                </section>

                <section className={styles.contentSection}>
                  <p className={styles.eyebrow}>PROFESSIONAL INSTRUCTION</p>
                  <div className={styles.contentGridTwo}>
                    {lesson.instruction.map((section) => (
                      <div className={styles.contentCard} key={section.heading}>
                        <h3>{section.heading}</h3>
                        <p>{section.body}</p>
                        <strong>Organizational application</strong>
                        <p>{section.application}</p>
                      </div>
                    ))}
                  </div>
                </section>

                <section className={styles.contentSection}>
                  <p className={styles.eyebrow}>GUIDED PROFESSIONAL PRACTICE</p>
                  <h2>Required work and evidence</h2>
                  <ol className={styles.numberedList}>
                    {lesson.guidedPractice.map((step, index) => (
                      <li key={step.title}>
                        <h3>{String(index + 1).padStart(2, "0")} · {step.title}</h3>
                        <p>{step.instruction}</p>
                        <strong>Evidence to produce</strong>
                        <p>{step.evidence}</p>
                      </li>
                    ))}
                  </ol>
                </section>

                <section className={styles.contentSection}>
                  <p className={styles.eyebrow}>DECISION QUALITY RUBRIC</p>
                  <div className={styles.table} role="table" aria-label="Professional decision quality rubric">
                    <div className={`${styles.tableRow} ${styles.tableHead}`} role="row">
                      <span role="columnheader">Criterion</span>
                      <span role="columnheader">Strong practice</span>
                      <span role="columnheader">Weak practice</span>
                    </div>
                    {lesson.decisionRubric.map((row) => (
                      <div className={styles.tableRow} role="row" key={row.criterion}>
                        <strong role="cell">{row.criterion}</strong>
                        <p role="cell">{row.strong}</p>
                        <p role="cell">{row.weak}</p>
                      </div>
                    ))}
                  </div>
                </section>

                <section className={styles.contentSection}>
                  <p className={styles.eyebrow}>COMMON FAILURE MODES</p>
                  <div className={styles.contentGridTwo}>
                    {lesson.failureModes.map((failure) => (
                      <div className={styles.contentCard} key={failure.pattern}>
                        <h3>{failure.pattern}</h3>
                        <p>{failure.whyItFails}</p>
                        <strong>Correction</strong>
                        <p>{failure.correction}</p>
                      </div>
                    ))}
                  </div>
                </section>

                <section className={styles.contentSection}>
                  <p className={styles.eyebrow}>AUTHORITATIVE GROUNDING</p>
                  <div className={styles.sourceGrid}>
                    {lesson.authorities.map((authority) => (
                      <div className={styles.sourceCard} key={authority.reference}>
                        <strong>{authority.publisher}</strong>
                        <h3>{authority.reference}</h3>
                        <p>{authority.whyItMatters}</p>
                        <a href={authority.url} target="_blank" rel="noreferrer">Open authoritative source</a>
                      </div>
                    ))}
                  </div>
                </section>

                <section className={styles.contentSection}>
                  <p className={styles.eyebrow}>DOCUMENTED PRACTICE EXAMPLE</p>
                  <h2>{lesson.practiceExample.title}</h2>
                  <strong>{lesson.practiceExample.organization}</strong>
                  <p>{lesson.practiceExample.summary}</p>
                  <div className={styles.answerExplanation}><strong>Professional takeaway</strong><p>{lesson.practiceExample.takeaway}</p></div>
                  <p><a href={lesson.practiceExample.url} target="_blank" rel="noreferrer">Review public source</a></p>
                </section>

                <section className={styles.contentSection}>
                  <div className={styles.contentGridTwo}>
                    <div className={styles.contentCard}>
                      <p className={styles.eyebrow}>BUSINESS APPLICATION</p>
                      <ol className={styles.numberedList}>{lesson.businessApplication.map((item) => <li key={item}>{item}</li>)}</ol>
                    </div>
                    <div className={styles.contentCard}>
                      <p className={styles.eyebrow}>APPLIED SCENARIO</p>
                      <p>{lesson.scenario}</p>
                    </div>
                  </div>
                </section>

                <section className={styles.contentSection}>
                  <p className={styles.eyebrow}>COURSE MATERIALS</p>
                  <div className={styles.contentGridTwo}>
                    {lesson.materials.map((material) => (
                      <div className={styles.contentCard} key={material.title}>
                        <h3>{material.title}</h3>
                        <p>{material.purpose}</p>
                        <ul>{material.content.map((item) => <li key={item}>{item}</li>)}</ul>
                      </div>
                    ))}
                  </div>
                </section>

                <section className={styles.contentSection}>
                  <p className={styles.eyebrow}>KNOWLEDGE CHECK · OWNER ANSWER KEY</p>
                  <h2>{lesson.check.question}</h2>
                  <ol className={styles.optionList}>
                    {lesson.check.options.map((option, index) => (
                      <li className={index === lesson.check.answer ? styles.correctOption : ""} key={option}>
                        <strong>{optionLetter(index)}.</strong> {option}
                        {index === lesson.check.answer ? " · CORRECT ANSWER" : ""}
                      </li>
                    ))}
                  </ol>
                  <div className={styles.answerExplanation}><strong>Explanation</strong><p>{lesson.check.explanation}</p></div>
                </section>

                <section className={styles.contentSection}>
                  <div className={styles.contentGridTwo}>
                    <div className={styles.contentCard}>
                      <p className={styles.eyebrow}>MASTERY CRITERIA</p>
                      <ul>{lesson.masteryCriteria.map((item) => <li key={item}>{item}</li>)}</ul>
                    </div>
                    <div className={styles.contentCard}>
                      <p className={styles.eyebrow}>REFLECTION AND TRANSFER</p>
                      <ol>{lesson.reflectionPrompts.map((item) => <li key={item}>{item}</li>)}</ol>
                    </div>
                  </div>
                </section>
              </>
            ) : (
              <>
                <header className={styles.contentHeader}>
                  <p className={styles.eyebrow}>FINAL ASSESSMENT · PRIVATE OWNER ANSWER KEY</p>
                  <h1>{course.title}</h1>
                  <p>Review all {assessment.length} graded questions, correct answers, and rationales. Nothing on this page submits an assessment attempt or issues a certificate.</p>
                </header>
                <ol className={styles.assessmentList}>
                  {assessment.map((question, questionIndex) => (
                    <li className={styles.assessmentQuestion} key={`${question.question}-${questionIndex}`}>
                      <h3>{question.question}</h3>
                      <ol className={styles.optionList}>
                        {question.options.map((option, optionIndex) => (
                          <li className={optionIndex === question.answer ? styles.correctOption : ""} key={option}>
                            <strong>{optionLetter(optionIndex)}.</strong> {option}
                            {optionIndex === question.answer ? " · CORRECT ANSWER" : ""}
                          </li>
                        ))}
                      </ol>
                      <div className={styles.answerExplanation}><strong>Rationale</strong><p>{question.explanation}</p></div>
                    </li>
                  ))}
                </ol>
              </>
            )}
          </article>
        </div>
      </div>
    </main>
  );
}
