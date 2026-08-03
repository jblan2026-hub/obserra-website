"use client";

import { FormEvent, useMemo, useState } from "react";
import styles from "./ObserraGuide.module.css";

type Message = { from: "guide" | "visitor"; text: string; href?: string; label?: string };
const welcome: Message = { from: "guide", text: "Welcome to Obserra. I can help you find services, choose an Academy course, understand paid enrollment, or connect you with the right team." };

function answer(question: string): Message {
  const input = question.toLowerCase();
  if (/course|academy|train|certificate|cyber/.test(input)) return { from: "guide", text: "Obserra Academy offers paid, self paced training in cybersecurity, protective operations, intelligence, and secure technology governance. Learners complete interactive lessons and a final assessment; an Obserra Certificate of Training is issued after successful completion.", href: "/academy", label: "Open Academy" };
  if (/pay|price|buy|checkout|enroll/.test(input)) return { from: "guide", text: "Each Academy course has its own secure checkout. Choose a course to review its format and price, then select Buy this course. Protected learner access is issued only after payment verification.", href: "/academy#courses", label: "Choose a course" };
  if (/protect|executive|travel|threat/.test(input)) return { from: "guide", text: "Obserra provides protective intelligence, travel risk support, executive focused security planning, and risk advisory services.", href: "/contact", label: "Contact Obserra" };
  if (/intelligence|osint|exposure|investig/.test(input)) return { from: "guide", text: "Obserra supports decision ready intelligence, lawful digital exposure assessment, protective intelligence, and risk informed executive briefings.", href: "/intelligence", label: "Explore Intelligence" };
  if (/service|help|contact|speak|quote/.test(input)) return { from: "guide", text: "For a service inquiry, training for a team, or a confidential consultation, use the contact page and select the area that fits your need.", href: "/contact", label: "Contact Obserra" };
  return { from: "guide", text: "I can help with Academy training, course enrollment, cybersecurity services, intelligence, protective support, and contacting the right team. Try asking about a course, training certificate, cyber services, or executive protection." };
}

export default function ObserraGuide() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([welcome]);
  const quick = useMemo(() => ["Find a course", "How do certificates work?", "Talk to Obserra", "Cybersecurity services"], []);
  function submit(event: FormEvent) { event.preventDefault(); const question = input.trim(); if (!question) return; setMessages((items) => [...items, { from: "visitor", text: question }, answer(question)]); setInput(""); }
  function quickAsk(question: string) { setMessages((items) => [...items, { from: "visitor", text: question }, answer(question)]); }
  return <aside className={styles.guide} aria-label="Obserra Guide">
    {open && <section className={styles.panel}><header className={styles.header}><div><strong>Obserra Guide</strong><span>Free site assistance</span></div><button onClick={() => setOpen(false)} aria-label="Close Obserra Guide">×</button></header><div className={styles.messages}>{messages.map((message, index) => <div className={`${styles.message} ${message.from === "visitor" ? styles.visitor : ""}`} key={index}><p>{message.text}</p>{message.href && <a href={message.href}>{message.label}</a>}</div>)}</div><div className={styles.quick}>{quick.map((item) => <button key={item} onClick={() => quickAsk(item)}>{item}</button>)}</div><form className={styles.form} onSubmit={submit}><label className={styles.srOnly} htmlFor="obserra-guide-question">Ask Obserra Guide</label><input id="obserra-guide-question" value={input} onChange={(event) => setInput(event.target.value)} placeholder="How can I help?" /><button type="submit">Send</button></form></section>}
    <button className={styles.launcher} onClick={() => setOpen((value) => !value)} aria-expanded={open}>{open ? "Close Guide" : "Ask Obserra Guide"}</button>
  </aside>;
}
