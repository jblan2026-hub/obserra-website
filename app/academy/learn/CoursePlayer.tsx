"use client";

import Image from "next/image";
import { useState } from "react";
import type { Course } from "../courseData";
import type { AssessmentQuestion, LessonBrief } from "../courseExperience";
import type { CourseProgress } from "../../../lib/academy";
import "./learning.css";
import "./brand-overrides.css";

const quickTutorPrompts = [
  "Explain this lesson in a different way and tell me why it matters.",
  "Give me a realistic business example and walk me through the decision.",
  "Quiz me with three ungraded practice questions about this lesson.",
  "Show me how I would apply this lesson inside an enterprise environment.",
] as const;

export default function CoursePlayer({ course, initialProgress, lessons, assessment, watermark }: {
  course: Course;
  initialProgress: CourseProgress;
  lessons: LessonBrief[];
  assessment: AssessmentQuestion[];
  watermark: string;
}) {
  const [activeLesson, setActiveLesson] = useState(0);
  const [completedLessons, setCompletedLessons] = useState(initialProgress.completedLessons);
  const [checkedAnswer, setCheckedAnswer] = useState<number | null>(null);
  const [answers, setAnswers] = useState<number[]>(Array(25).fill(-1));
  const [score, setScore] = useState<number | undefined>(initialProgress.assessmentScore);
  const [certificateId, setCertificateId] = useState(initialProgress.certificateId);
  const [notice, setNotice] = useState("");
  const [tutorQuestion, setTutorQuestion] = useState("");
  const [tutorAnswer, setTutorAnswer] = useState("");
  const [tutorError, setTutorError] = useState("");
  const [tutorLoading, setTutorLoading] = useState(false);
  const lesson = lessons[activeLesson];
  const lessonsComplete = completedLessons.length === course.modules.length;
  const assessmentActive = activeLesson === course.modules.length;

  async function completeLesson() {
    const response = await fetch("/api/academy/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId: course.id, lessonIndex: activeLesson }),
    });
    const result = await response.json() as { progress?: CourseProgress; error?: string };
    if (!response.ok || !result.progress) return setNotice(result.error ?? "Unable to record this lesson");
    setCompletedLessons(result.progress.completedLessons);
    setNotice("Lesson complete. Your progress is saved.");
  }

  async function submitAssessment() {
    setNotice("");
    const response = await fetch("/api/academy/assessment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId: course.id, answers }),
    });
    const result = await response.json() as { score?: number; passed?: boolean; certificateId?: string; error?: string };
    if (!response.ok || result.score === undefined) return setNotice(result.error ?? "Unable to score the assessment");
    setScore(result.score);
    setCertificateId(result.certificateId);
    setNotice(result.passed ? "You passed. Your Obserra Certificate of Training is ready." : "You did not reach the 80% completion standard. Review the lessons and try again.");
  }

  async function askTutor(questionOverride?: string) {
    const question = (questionOverride ?? tutorQuestion).trim();
    if (!lesson || question.length < 2 || tutorLoading) return;
    setTutorLoading(true);
    setTutorError("");
    setTutorAnswer("");
    if (questionOverride) setTutorQuestion(questionOverride);

    try {
      const response = await fetch("/api/academy/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId: course.id, lessonIndex: activeLesson, question }),
      });
      const result = await response.json() as { answer?: string; error?: string };
      if (!response.ok || !result.answer) {
        setTutorError(result.error ?? "The Academy Tutor is temporarily unavailable.");
        return;
      }
      setTutorAnswer(result.answer);
    } catch {
      setTutorError("The Academy Tutor is temporarily unavailable.");
    } finally {
      setTutorLoading(false);
    }
  }

  if (!assessmentActive && !lesson) return null;

  return <main className="learning-shell" onCopy={(event) => event.preventDefault()} onCut={(event) => event.preventDefault()} onDragStart={(event) => event.preventDefault()} onContextMenu={(event) => event.preventDefault()}>
    <div className="learner-watermark" aria-hidden="true">{watermark}</div>
    <header className="learning-header">
      <a href="/academy" className="learning-brand">
        <Image src="/brand/obserra-logo.png" alt="Obserra Executive Protection and Intelligence LLC" width={220} height={42} />
        <b>ACADEMY</b>
      </a>
      <a href="/academy" className="exit-course">Exit course</a>
    </header>

    <section className="learning-top">
      <div>
        <p className="learning-kicker">Protected learner workspace, {course.department}</p>
        <h1>{course.title}</h1>
        <p>{course.description}</p>
        <div className="learning-course-meta" aria-label="Course requirements">
          <span>{course.duration}</span>
          <span>{course.modules.length} lessons</span>
          <span>25 question final assessment</span>
          <span>80 percent required</span>
          <span>AI tutor included with paid access</span>
        </div>
      </div>
      <div className="progress-ring">
        <strong>{completedLessons.length}/{course.modules.length}</strong>
        <span>lessons complete</span>
      </div>
    </section>

    <div className="learning-layout">
      <aside className="lesson-nav">
        <p>Course journey</p>
        {course.modules.map((module, index) => <button key={module.title} onClick={() => {
          setActiveLesson(index);
          setCheckedAnswer(null);
          setTutorAnswer("");
          setTutorError("");
        }} className={activeLesson === index ? "active" : ""}>
          <span>{completedLessons.includes(index) ? "OK" : String(index + 1).padStart(2, "0")}</span>
          <div><strong>{module.title}</strong><small>{module.format} · {module.duration}</small></div>
        </button>)}
        <button onClick={() => setActiveLesson(course.modules.length)} className={assessmentActive ? "active assessment-nav" : "assessment-nav"} disabled={!lessonsComplete}>
          <span>25</span><div><strong>Final assessment</strong><small>80% required</small></div>
        </button>
      </aside>

      {!assessmentActive && lesson ? <section className="lesson-stage">
        <div className="video-frame">
          <div className="video-top"><span>OBSERRA ACADEMY</span><span>PROPRIETARY TRAINING</span></div>
          <div className="video-orb" />
          <div className="video-copy"><p>{lesson.format}</p><h2>{lesson.title}</h2><span>{lesson.videoDuration} guided professional learning session</span></div>
          <div className="video-controls"><i /><span>Original Obserra instruction grounded in authoritative sources</span><b>AI NATIVE</b></div>
        </div>

        <div className="lesson-content">
          <section className="lesson-session-map" aria-label="Guided lesson chapters">
            <div><p className="learning-kicker">Guided lesson plan</p><h2>{lesson.videoTitle}</h2></div>
            <ol>{lesson.videoChapters.map((chapter) => <li key={`${chapter.timestamp}-${chapter.title}`}><span>{chapter.timestamp}</span><div><strong>{chapter.title}</strong><p>{chapter.narration}</p></div></li>)}</ol>
            <details className="lesson-transcript"><summary>Read the guided lesson transcript</summary>{lesson.transcript.map((line) => <p key={line}>{line}</p>)}</details>
          </section>

          <p className="learning-kicker">Lesson mission</p>
          <h2>Understand it. Apply it. Defend the decision.</h2>
          <p className="lesson-focus">{lesson.focus}</p>
          <div className="why-it-matters"><strong>Why this matters</strong><p>{lesson.whyItMatters}</p></div>

          <section className="lesson-objectives" aria-label="Lesson objectives">
            <p className="learning-kicker">Mastery objectives</p>
            <h3>What you should be able to do after this lesson</h3>
            <ol>{lesson.objectives.map((objective) => <li key={objective}>{objective}</li>)}</ol>
          </section>

          <div className="brief-grid">
            <article><span>01</span><h3>Observe</h3><p>{lesson.observe}</p></article>
            <article><span>02</span><h3>Decide</h3><p>{lesson.decide}</p></article>
            <article><span>03</span><h3>Act</h3><p>{lesson.act}</p></article>
          </div>

          <section className="instruction-stack" aria-label="Professional instruction">
            <p className="learning-kicker">Professional instruction</p>
            {lesson.instruction.map((section, index) => <article key={section.heading}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div><h3>{section.heading}</h3><p>{section.body}</p><strong>Use it at work</strong><p>{section.application}</p></div>
            </article>)}
          </section>

          <section className="guided-practice" aria-label="Guided professional practice">
            <div className="section-heading"><p className="learning-kicker">Guided professional practice</p><h3>Build the work, not just the vocabulary.</h3></div>
            <ol>{lesson.guidedPractice.map((step, index) => <li key={step.title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div><h4>{step.title}</h4><p>{step.instruction}</p><strong>Evidence to produce</strong><p>{step.evidence}</p></div>
            </li>)}</ol>
          </section>

          <section className="decision-rubric" aria-label="Professional decision rubric">
            <div className="section-heading"><p className="learning-kicker">Professional decision rubric</p><h3>What strong work looks like</h3></div>
            <div className="rubric-table" role="table" aria-label="Decision quality rubric">
              <div className="rubric-row rubric-head" role="row"><span role="columnheader">Criterion</span><span role="columnheader">Strong practice</span><span role="columnheader">Weak practice</span></div>
              {lesson.decisionRubric.map((row) => <div className="rubric-row" role="row" key={row.criterion}><strong role="cell">{row.criterion}</strong><p role="cell">{row.strong}</p><p role="cell">{row.weak}</p></div>)}
            </div>
          </section>

          <section className="failure-modes" aria-label="Common professional failure modes">
            <div className="section-heading"><p className="learning-kicker">Common failure modes</p><h3>Recognize the mistakes that undermine otherwise good work.</h3></div>
            <div>{lesson.failureModes.map((failure) => <article key={failure.pattern}><h4>{failure.pattern}</h4><p>{failure.whyItFails}</p><strong>Correction</strong><p>{failure.correction}</p></article>)}</div>
          </section>

          <section className="authority-section" aria-label="Authoritative grounding">
            <div className="section-heading"><p className="learning-kicker">Why Obserra teaches it</p><h3>Authoritative grounding</h3></div>
            <div className="authority-grid">
              {lesson.authorities.map((authority) => <article key={authority.reference}>
                <span>{authority.publisher}</span>
                <h4>{authority.reference}</h4>
                <p>{authority.whyItMatters}</p>
                <a href={authority.url} target="_blank" rel="noreferrer">Open authoritative source</a>
              </article>)}
            </div>
          </section>

          <section className="practice-example">
            <p className="learning-kicker">Documented practice example</p>
            <h3>{lesson.practiceExample.title}</h3>
            <strong>{lesson.practiceExample.organization}</strong>
            <p>{lesson.practiceExample.summary}</p>
            <div><b>Professional takeaway</b><p>{lesson.practiceExample.takeaway}</p></div>
            <a href={lesson.practiceExample.url} target="_blank" rel="noreferrer">Review public source</a>
          </section>

          <section className="application-lab">
            <div>
              <p className="learning-kicker">Business application</p>
              <h3>How to use this in an organization</h3>
              <ol>{lesson.businessApplication.map((item) => <li key={item}>{item}</li>)}</ol>
            </div>
            <div>
              <p className="learning-kicker">Applied scenario</p>
              <h3>Work the decision</h3>
              <p>{lesson.scenario}</p>
            </div>
          </section>

          <section className="mastery-review" aria-label="Lesson mastery review">
            <div>
              <p className="learning-kicker">Mastery criteria</p>
              <h3>Before you leave this lesson</h3>
              <ul>{lesson.masteryCriteria.map((item) => <li key={item}>{item}</li>)}</ul>
            </div>
            <div>
              <p className="learning-kicker">Reflection and transfer</p>
              <h3>Connect the lesson to your environment</h3>
              <ol>{lesson.reflectionPrompts.map((item) => <li key={item}>{item}</li>)}</ol>
            </div>
          </section>

          <section className="learning-materials">
            <p className="learning-kicker">Course materials</p>
            <div className="material-grid">{lesson.materials.map((material) => <article key={material.title}>
              <h3>{material.title}</h3><p>{material.purpose}</p><ul>{material.content.map((item) => <li key={item}>{item}</li>)}</ul>
            </article>)}</div>
          </section>

          <div className="knowledge-check">
            <p>Learning check</p>
            <h3>{lesson.check.question}</h3>
            {lesson.check.options.map((option, index) => <button key={option} onClick={() => setCheckedAnswer(index)} className={checkedAnswer === index ? "selected" : ""}>{String.fromCharCode(65 + index)}. {option}</button>)}
            {checkedAnswer !== null && <div className={checkedAnswer === lesson.check.answer ? "answer correct" : "answer incorrect"}>{checkedAnswer === lesson.check.answer ? "Correct. " : "Review this choice. "}{lesson.check.explanation}</div>}
          </div>

          <section className="academy-tutor" aria-label="Obserrian Academy Tutor">
            <div className="academy-tutor-heading">
              <div><p className="learning-kicker">Included with paid access</p><h3>Obserrian Academy Tutor</h3></div>
              <span>Course aware · Lesson aware · Assessment protected</span>
            </div>
            <p className="academy-tutor-intro">Ask for another explanation, a realistic example, an ungraded practice quiz, a study plan, feedback on the professional work product, or help translating this lesson into your business environment. The tutor is grounded in this course, this lesson, the authoritative references, guided practice, decision rubric, and mastery criteria shown above.</p>
            <div className="tutor-quick-prompts">{quickTutorPrompts.map((prompt) => <button key={prompt} type="button" onClick={() => void askTutor(prompt)} disabled={tutorLoading}>{prompt}</button>)}</div>
            <label htmlFor="academy-tutor-question">Ask the tutor</label>
            <textarea id="academy-tutor-question" value={tutorQuestion} onChange={(event) => setTutorQuestion(event.target.value)} maxLength={1400} placeholder="Example: Walk me through how I would apply this lesson during a real enterprise decision." />
            <button className="tutor-submit" type="button" disabled={tutorLoading || tutorQuestion.trim().length < 2} onClick={() => void askTutor()}>{tutorLoading ? "Tutor is working..." : "Ask Obserrian Tutor"}</button>
            {tutorError && <div className="tutor-error">{tutorError}</div>}
            {tutorAnswer && <div className="tutor-answer" aria-live="polite"><strong>Obserrian Tutor</strong><p>{tutorAnswer}</p></div>}
            <small>The tutor will not provide answers to the graded final assessment and does not replace legal, regulatory, safety, medical, or organizational authority.</small>
          </section>

          <button className="complete-lesson" onClick={completeLesson}>{completedLessons.includes(activeLesson) ? "Lesson recorded" : "Mark lesson complete"}</button>
          {notice && <p className="learning-notice">{notice}</p>}
        </div>
      </section> : <section className="assessment-stage">
        <p className="learning-kicker">Final assessment</p>
        <h2>Demonstrate your decision readiness.</h2>
        <p>Answer all 25 questions. You need an 80% score or higher after completing every lesson to receive your Obserra Certificate of Training.</p>
        <div className="assessment-integrity"><strong>Assessment integrity</strong><span>The Obserrian Tutor is paused during the graded assessment. Return to any lesson for tutoring, explanations, additional examples, or ungraded practice.</span></div>
        <div className="assessment-questions">{assessment.map((question, questionIndex) => <fieldset key={question.question}><legend>{question.question}</legend>{question.options.map((option, optionIndex) => <label key={option}><input type="radio" name={`q-${questionIndex}`} checked={answers[questionIndex] === optionIndex} onChange={() => setAnswers((current) => current.map((answer, index) => index === questionIndex ? optionIndex : answer))} />{option}</label>)}</fieldset>)}</div>
        <button className="complete-lesson" disabled={answers.includes(-1)} onClick={submitAssessment}>Submit final assessment</button>
        {score !== undefined && <div className={score >= 80 ? "result-pass" : "result-retry"}><strong>{score}%</strong><span>{score >= 80 ? "Completion standard met" : "Completion standard not yet met"}</span>{certificateId && <a href={`/academy/certificate/${course.id}`}>Open your Certificate of Training</a>}</div>}
        {notice && <p className="learning-notice">{notice}</p>}
      </section>}
    </div>
    <footer className="learning-footer">Copyright Obserra Executive Protection &amp; Intelligence LLC. Proprietary training material. Unauthorized recording, downloading, copying, or redistribution is prohibited.</footer>
  </main>;
}
