"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import styles from "./ObserraGuide.module.css";

type MessageAction = { href: string; label: string };
type Message = { from: "guide" | "visitor"; text: string; actions?: MessageAction[] };
const welcome: Message = { from: "guide", text: "Welcome to Obserra. I can help you find services, choose an Academy course, understand paid enrollment, or connect you with the right team." };

function withSelfTrainingPrompt(message: Message): Message {
  if (message.from !== "guide") return message;
  const lower = message.text.toLowerCase();
  if (lower.includes("self-paced") || lower.includes("academy")) return message;
  return {
    ...message,
    text: `${message.text} Would you like self-training on this as well?`,
    actions: [...(message.actions ?? []), { href: "/academy", label: "Start self training" }],
  };
}

function answer(question: string): Message {
  const input = question.toLowerCase();
  if (/\beios\b|enterprise intelligence|situation room|governed action|decision intelligence/.test(input)) return withSelfTrainingPrompt({ from: "guide", text: "EIOS is Obserra's enterprise intelligence experience for connecting context, evidence, policy, approval, and accountable action. The public product view explains the decision path without exposing customer environments or proprietary implementation detail.", actions: [{ href: "/eios", label: "Explore EIOS" }] });
  if (/course|academy|train|certificate|cyber/.test(input)) return { from: "guide", text: "Obserra Academy offers paid, self-paced training in cybersecurity, protective operations, intelligence, and secure technology governance. Learners complete interactive lessons and a final assessment; an Obserra Certificate of Training is issued after successful completion.", actions: [{ href: "/academy", label: "Open Academy" }] };
  if (/pay|price|buy|checkout|enroll/.test(input)) return { from: "guide", text: "Each Academy course has its own secure checkout. Choose a course, select Purchase secure enrollment, and pay through Stripe. After payment is verified, you return directly to your paid course without creating an Academy account.", actions: [{ href: "/academy#courses", label: "Choose a course" }] };
  if (/protect|executive|travel|threat/.test(input)) return withSelfTrainingPrompt({ from: "guide", text: "Obserra provides protective intelligence, travel risk support, executive focused security planning, and risk advisory services.", actions: [{ href: "/#protection", label: "Explore protection" }] });
  if (/intelligence|osint|exposure|investig/.test(input)) return withSelfTrainingPrompt({ from: "guide", text: "Obserra supports decision ready intelligence, lawful digital exposure assessment, protective intelligence, and risk informed executive briefings.", actions: [{ href: "/#protection", label: "Explore intelligence" }] });
  if (/service|help|contact|speak|quote/.test(input)) return withSelfTrainingPrompt({ from: "guide", text: "For a service inquiry, training for a team, or a confidential consultation, contact Obserra directly.", actions: [{ href: "mailto:info@obserrallc.com?subject=Obserra%20Consultation", label: "Contact Obserra" }] });
  return withSelfTrainingPrompt({ from: "guide", text: "I can help with Academy training, course enrollment, cybersecurity services, intelligence, protective support, and contacting the right team. Try asking about a course, training certificate, cyber services, or executive protection." });
}

export default function ObserraGuide() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([welcome]);
  const messagesRef = useRef<HTMLDivElement | null>(null);
  const quick = useMemo(() => ["What do you do?", "How do I buy a course?", "Can I book a consultation?", "Training Academy"], []);

  useEffect(() => {
    if (pathname !== "/") return;
    const dismissed = window.sessionStorage.getItem("obserra-guide-dismissed") === "1";
    if (dismissed) return;
    const timer = window.setTimeout(() => setOpen(true), 900);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const container = messagesRef.current;
    if (!container) return;
    container.scrollTop = container.scrollHeight;
  }, [messages, open]);

  if (pathname !== "/") return null;

  function submit(event: FormEvent) { event.preventDefault(); const question = input.trim(); if (!question) return; setMessages((items) => [...items, { from: "visitor", text: question }, answer(question)]); setInput(""); }
  function quickAsk(question: string) { setMessages((items) => [...items, { from: "visitor", text: question }, answer(question)]); setOpen(true); }
  function closeGuide() { setOpen(false); window.sessionStorage.setItem("obserra-guide-dismissed", "1"); }

  return <aside className={styles.guide} aria-label="Obserra Guide">
    {open && <section className={styles.panel}><header className={styles.header}><div className={styles.brand}><Image src="/brand/obserra-mark.svg" alt="Obserra" width={28} height={28} className={styles.brandMark} /><div><strong>Obserra Guide</strong><span>Small log. Fast answers.</span></div></div><button onClick={closeGuide} aria-label="Close Obserra Guide">Close</button></header><div className={styles.panelBody}><div className={styles.messages} ref={messagesRef}>{messages.map((message, index) => <div className={`${styles.message} ${message.from === "visitor" ? styles.visitor : ""}`} key={index}><p>{message.text}</p>{message.actions && <div className={styles.messageActions}>{message.actions.map((action) => <a key={`${action.href}-${action.label}`} href={action.href}>{action.label}</a>)}</div>}</div>)}</div><div className={styles.sideRail}><div className={styles.sideBubble}><Image src="/brand/obserra-mark.svg" alt="Obserra" width={24} height={24} /></div><div className={styles.sideHint}>Use the log, or tap a quick prompt.</div></div></div><div className={styles.quick}>{quick.map((item) => <button key={item} onClick={() => quickAsk(item)}>{item}</button>)}</div><form className={styles.form} onSubmit={submit}><label className={styles.srOnly} htmlFor="obserra-guide-question">Ask Obserra Guide</label><input id="obserra-guide-question" value={input} onChange={(event) => setInput(event.target.value)} placeholder="Ask me anything" /><button type="submit">Send</button></form></section>}
    <button className={styles.launcher} onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-label={open ? "Close Obserra Guide" : "Open Obserra Guide"}>
      <Image src="/brand/obserra-mark.svg" alt="" aria-hidden="true" width={40} height={40} className={styles.launcherMark} />
    </button>
  </aside>;
}
