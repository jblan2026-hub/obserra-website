"use client";

import { useState } from "react";
import type { Course } from "../courseData";
import type { AssessmentQuestion, LessonBrief } from "../courseExperience";
import type { CourseProgress } from "../../../lib/academy";
import "./learning.css";
import "./brand-overrides.css";

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
  const lesson: LessonBrief = lessons[activeLesson] ?? null;
  const lessonsComplete = completedLessons.length === course.modules.length;

  async function completeLesson() {
    const response = await fetch("/api/academy/progress", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ courseId: course.id, lessonIndex: activeLesson }) });
    const result = await response.json() as { progress?: CourseProgress; error?: string };
    if (!response.ok || !result.progress) return setNotice(result.error ?? "Unable to record this lesson");
    setCompletedLessons(result.progress.completedLessons);
    setNotice("Lesson complete. Your progress is saved.");
  }

  async function submitAssessment() {
    setNotice("");
    const response = await fetch("/api/academy/assessment", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ courseId: course.id, answers }) });
    const result = await response.json() as { score?: number; passed?: boolean; certificateId?: string; error?: string };
    if (!response.ok || result.score === undefined) return setNotice(result.error ?? "Unable to score the assessment");
    setScore(result.score);
    setCertificateId(result.certificateId);
    setNotice(result.passed ? "You passed. Your Obserra Certificate of Training is ready." : "You did not reach the 80% completion standard. Review the lessons and try again.");
  }

  if (!lesson) return null;
  return <main className="learning-shell" onCopy={(event) => event.preventDefault()} onCut={(event) => event.preventDefault()} onDragStart={(event) => event.preventDefault()} onContextMenu={(event) => event.preventDefault()}>
    <div className="learner-watermark" aria-hidden="true">{watermark}</div>
    <header className="learning-header"><a href="/academy" className="learning-brand"><img src="/brand/obserra-logo.png" alt="Obserra Executive Protection and Intelligence LLC" /><b>ACADEMY</b></a><a href="/academy" className="exit-course">Exit course</a></header>
    <section className="learning-top"><div><p className="learning-kicker">Protected learner workspace, {course.department}</p><h1>{course.title}</h1><p>{course.description}</p></div><div className="progress-ring"><strong>{completedLessons.length}/{course.modules.length}</strong><span>lessons complete</span></div></section>
    <div className="learning-layout"><aside className="lesson-nav"><p>Course journey</p>{course.modules.map((module, index) => <button key={module.title} onClick={() => { setActiveLesson(index); setCheckedAnswer(null); }} className={activeLesson === index ? "active" : ""}><span>{completedLessons.includes(index) ? "OK" : String(index + 1).padStart(2, "0")}</span><div><strong>{module.title}</strong><small>{module.format}</small></div></button>)}<button onClick={() => setActiveLesson(course.modules.length)} className={activeLesson === course.modules.length ? "active assessment-nav" : "assessment-nav"} disabled={!lessonsComplete}><span>25</span><div><strong>Final assessment</strong><small>80% required</small></div></button></aside>
      {activeLesson < course.modules.length ? <section className="lesson-stage"><div className="video-frame"><div className="video-top"><span>OBSERRA ACADEMY</span><span>PROPRIETARY TRAINING</span></div><div className="video-orb" /><div className="video-copy"><p>{lesson.format}</p><h2>{lesson.title}</h2><span>Guided learning experience</span></div><div className="video-controls"><i /><span>Obserra interactive briefing</span><b>01:30</b></div></div><div className="lesson-content"><p className="learning-kicker">Mission briefing</p><h2>Observe. Decide. Act.</h2><div className="brief-grid"><article><span>01</span><h3>Observe</h3><p>{lesson.observe}</p></article><article><span>02</span><h3>Decide</h3><p>{lesson.decide}</p></article><article><span>03</span><h3>Act</h3><p>{lesson.act}</p></article></div><div className="knowledge-check"><p>Learning check</p><h3>{lesson.check.question}</h3>{lesson.check.options.map((option, index) => <button key={option} onClick={() => setCheckedAnswer(index)} className={checkedAnswer === index ? "selected" : ""}>{String.fromCharCode(65 + index)}. {option}</button>)}{checkedAnswer !== null && <div className={checkedAnswer === lesson.check.answer ? "answer correct" : "answer incorrect"}>{checkedAnswer === lesson.check.answer ? "Correct. " : "Review this choice. "}{lesson.check.explanation}</div>}</div><button className="complete-lesson" onClick={completeLesson}>{completedLessons.includes(activeLesson) ? "Lesson recorded" : "Mark lesson complete"}</button>{notice && <p className="learning-notice">{notice}</p>}</div></section> : <section className="assessment-stage"><p className="learning-kicker">Final assessment</p><h2>Demonstrate your decision readiness.</h2><p>Answer all 25 questions. You need an 80% score or higher after completing every lesson to receive your Obserra Certificate of Training.</p><div className="assessment-questions">{assessment.map((question, questionIndex) => <fieldset key={question.question}><legend>{question.question}</legend>{question.options.map((option, optionIndex) => <label key={option}><input type="radio" name={`q-${questionIndex}`} checked={answers[questionIndex] === optionIndex} onChange={() => setAnswers((current) => current.map((answer, index) => index === questionIndex ? optionIndex : answer))} />{option}</label>)}</fieldset>)}</div><button className="complete-lesson" disabled={answers.includes(-1)} onClick={submitAssessment}>Submit final assessment</button>{score !== undefined && <div className={score >= 80 ? "result-pass" : "result-retry"}><strong>{score}%</strong><span>{score >= 80 ? "Completion standard met" : "Completion standard not yet met"}</span>{certificateId && <a href={`/academy/certificate/${course.id}`}>Open your Certificate of Training</a>}</div>}{notice && <p className="learning-notice">{notice}</p>}</section>}</div>
    <footer className="learning-footer">Copyright Obserra Executive Protection &amp; Intelligence LLC. Proprietary training material. Unauthorized recording, downloading, copying, or redistribution is prohibited.</footer>
  </main>;
}
