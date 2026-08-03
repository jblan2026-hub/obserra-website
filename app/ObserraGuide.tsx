"use client";

import { FormEvent, useMemo, useState } from "react";
import styles from "./ObserraGuide.module.css";

type Message = { from: "guide" | "visitor"; text: string; href?: string; label?: string };
const welcome: Message = { from: "guide", text: "Welcome to Obserra. I can help you find services, choose an Academy course, understand paid enrollment, or connect you with the right team." };

function answer(question: string): Message {
  const input = question.toLowerCase();
  if (/\beios\b|enterprise intelligence|situation room|governed action|decision intelligence/.test(input)) return { from: "guide", text: "EIOS is Obserra's enterprise intelligence experience for connecting context, evidence, policy, approval, and accountable action. The public product view explains the decision path without exposing customer environments or proprietary implementation detail.", href: "/eios", label: "Explore EIOS" };
  if (/course|academy|train|certificate|cyber/.test(input)) return { from: "guide", text: "Obserra Academy offers paid, self-paced training in cybersecurity, protective operations, intelligence, and secure technology governance. Learners complete interactive lessons and a final assessment; an Obserra Certificate of Training is issued after successful completion.", href: "/academy", label: "Open Academy" };
  if (/pay|price|buy|checkout|enroll/.test(input)) return { from: "guide", text: "Each Academy course has its own secure checkout. Choose a course, select Purchase secure enrollment, and pay through Stripe. After payment is verified, you return directly to your paid course without creating an Academy account.", href: "/academy#courses", label: "Choose a course" };
  if (/protect|executive|travel|threat/.test(input)) return { from: "guide", text: "Obserra provides protective intelligence, travel risk support, executive focused security planning, and risk advisory services.", href: "/#protection", label: "Explore protection" };
  if (/intelligence|osint|exposure|investig/.test(input)) return { from: "guide", text: "Obserra supports decision ready intelligence, lawful digital exposure assessment, protective intelligence, and risk informed executive briefings.", href: "/#protection", label: "Explore Intelligence" };
  if (/service|help|contact|speak|quote/.test(input)) return { from: "guide", text: "For a service inquiry, training for a team, or a confidential consultation, contact Obserra directly.", href: "mailto:info@obserrallc.com?subject=Obserra%20Consultation", label: "Contact Obserra" };
  return { from: "guide", text: "I can help with Academy training, course enrollment, cybersecurity services, intelligence, protective support, and contacting the right team. Try asking about a course, training certificate, cyber services, or executive protection." };
}

export default function ObserraGuide() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([welcome]);
  const quick = useMemo(() => ["Explore EIOS", "Find a course", "How do certificates work?", "Talk to Obserra"], []);
  function submit(event: FormEvent) { event.preventDefault(); const question = input.trim(); if (!question) return; setMessages((items) => [...items, { from: "visitor", text: question }, answer(question)]); setInput(""); }
  function quickAsk(question: string) { setMessages((items) => [...items, { from: "visitor", text: question }, answer(question)]); }
  return <aside className={styles.guide} aria-label="Obserra Guide">
    {open && <section className={styles.panel}><header className={styles.header}><div><strong>Obserra Guide</strong><span>Free site assistance</span></div><button onClick={() => setOpen(false)} aria-label="Close Obserra Guide">Close</button></header><div className={styles.messages}>{messages.map((message, index) => <div className={`${styles.message} ${message.from === "visitor" ? styles.visitor : ""}`} key={index}><p>{message.text}</p>{message.href && <a href={message.href}>{message.label}</a>}</div>)}</div><div className={styles.quick}>{quick.map((item) => <button key={item} onClick={() => quickAsk(item)}>{item}</button>)}</div><form className={styles.form} onSubmit={submit}><label className={styles.srOnly} htmlFor="obserra-guide-question">Ask Obserra Guide</label><input id="obserra-guide-question" value={input} onChange={(event) => setInput(event.target.value)} placeholder="How can I help?" /><button type="submit">Send</button></form></section>}
    <button className={styles.launcher} onClick={() => setOpen((value) => !value)} aria-expanded={open}>{open ? "Close Guide" : "Ask Obserra Guide"}</button>
  </aside>;
}
