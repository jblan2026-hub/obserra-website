"use client";

import Image from "next/image";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import styles from "./ObserraGuide.module.css";

type MessageAction = { href: string; label: string; reason?: string };
type Message = { from: "guide" | "visitor"; text: string; actions?: MessageAction[]; confidence?: number };
type PageContext = { label: string; welcome: string; prompts: string[] };
type AgentReply = { answer: string; actions: MessageAction[]; followUpPrompts: string[]; confidence: number };

const excludedPaths = ["/admin", "/api"];

function pageContext(pathname: string): PageContext {
  if (pathname.startsWith("/academy/learn")) return { label: "Learning Copilot", welcome: "I can clarify lessons, summarize concepts, and help you prepare without giving away assessment answers.", prompts: ["Explain this lesson", "Summarize key ideas", "Help me study"] };
  if (pathname.startsWith("/academy/certificate")) return { label: "Credential Guide", welcome: "I can explain this completion credential, verification, and recommended next training.", prompts: ["Verify a certificate", "Explain this credential", "Recommend next training"] };
  if (pathname.startsWith("/academy")) return { label: "Academy Intelligence", welcome: "Tell me your role, goal, experience, time, or budget and I will compare current Academy courses.", prompts: ["Recommend a course", "Compare prices", "AI governance training"] };
  if (pathname.startsWith("/apps")) return { label: "Product Intelligence", welcome: "Describe the business problem and I will compare Obserra applications, availability, integrations, and subscription fit.", prompts: ["Recommend an app", "Compare products", "Explain EIOS integration"] };
  if (pathname.startsWith("/eios")) return { label: "EIOS Intelligence", welcome: "I can explain EIOS architecture, applications, business value, and the best path into the platform.", prompts: ["What is EIOS?", "Show capabilities", "Explain business value"] };
  if (pathname.startsWith("/services") || pathname.startsWith("/protection-intelligence")) return { label: "Engagement Intelligence", welcome: "Describe your priority and I will identify the most relevant Obserra service or engagement path.", prompts: ["Cyber advisory", "Executive protection", "AI governance"] };
  return { label: "Executive Intelligence", welcome: "I am Obserrian, your AI guide across Obserra applications, EIOS, Academy, cybersecurity, and executive protection.", prompts: ["Explore applications", "Find training", "Review EIOS"] };
}

export default function ObserraGuide() {
  const pathname = usePathname();
  const context = useMemo(() => pageContext(pathname), [pathname]);
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [prompts, setPrompts] = useState(context.prompts);
  const messagesRef = useRef<HTMLDivElement | null>(null);
  const excluded = excludedPaths.some((path) => pathname.startsWith(path));

  useEffect(() => {
    setMessages([{ from: "guide", text: context.welcome }]);
    setPrompts(context.prompts);
  }, [context]);

  useEffect(() => {
    if (!open) return;
    const container = messagesRef.current;
    if (container) container.scrollTop = container.scrollHeight;
  }, [messages, open]);

  if (excluded) return null;

  async function ask(question: string) {
    const clean = question.trim();
    if (!clean || busy) return;
    const history = messages.slice(-6).map((message) => ({ role: message.from === "visitor" ? "user" as const : "assistant" as const, content: message.text }));
    setMessages((items) => [...items, { from: "visitor", text: clean }]);
    setInput("");
    setBusy(true);
    try {
      const response = await fetch("/api/obserrian", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: clean, pathname, conversation: history }),
      });
      if (!response.ok) throw new Error("Obserrian is temporarily unavailable");
      const reply = await response.json() as AgentReply;
      setMessages((items) => [...items, { from: "guide", text: reply.answer, actions: reply.actions, confidence: reply.confidence }]);
      if (reply.followUpPrompts?.length) setPrompts(reply.followUpPrompts);
    } catch {
      setMessages((items) => [...items, { from: "guide", text: "I could not complete that request just now. You can still browse applications, Academy courses, EIOS, or contact Obserra directly.", actions: [{ href: "/apps", label: "Applications" }, { href: "/academy", label: "Academy" }, { href: "/contact", label: "Contact" }] }]);
    } finally {
      setBusy(false);
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void ask(input);
  }

  return (
    <aside className={styles.guide} aria-label="Obserrian AI guide">
      {open && (
        <section className={styles.panel}>
          <header className={styles.header}>
            <div className={styles.identity}>
              <span className={styles.orb}><Image src="/brand/obserra-mark.svg" alt="Obserrian" width={38} height={38} /></span>
              <div><strong>Obserrian</strong><span>{context.label}</span></div>
            </div>
            <div className={styles.status}><i />AI online</div>
            <button type="button" className={styles.close} onClick={() => setOpen(false)} aria-label="Close Obserrian">×</button>
          </header>

          <div className={styles.messages} ref={messagesRef} aria-live="polite">
            {messages.map((message, index) => (
              <div className={`${styles.message} ${message.from === "visitor" ? styles.visitor : styles.guideMessage}`} key={`${message.from}-${index}`}>
                <p>{message.text}</p>
                {message.confidence !== undefined && <small>{Math.round(message.confidence * 100)}% confidence</small>}
                {message.actions?.length ? <div className={styles.messageActions}>{message.actions.map((action) => <a key={`${action.href}-${action.label}`} href={action.href} title={action.reason}>{action.label}</a>)}</div> : null}
              </div>
            ))}
            {busy && <div className={`${styles.message} ${styles.guideMessage} ${styles.thinking}`}><span /><span /><span /></div>}
          </div>

          <div className={styles.quick} aria-label="Suggested questions">
            {prompts.slice(0, 3).map((item) => <button type="button" key={item} onClick={() => void ask(item)}>{item}</button>)}
          </div>

          <form className={styles.form} onSubmit={submit}>
            <label className={styles.srOnly} htmlFor="obserrian-question">Ask Obserrian</label>
            <input id="obserrian-question" value={input} onChange={(event) => setInput(event.target.value)} placeholder="Ask Obserrian..." autoComplete="off" disabled={busy} />
            <button type="submit" aria-label="Send question" disabled={busy || !input.trim()}>↗</button>
          </form>
        </section>
      )}

      <button type="button" className={styles.launcher} onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-label={open ? "Close Obserrian" : "Open Obserrian AI guide"}>
        <span className={styles.launcherGlow} />
        <Image src="/brand/obserra-mark.svg" alt="" aria-hidden="true" width={44} height={44} className={styles.launcherMark} />
        {!open && <span className={styles.launcherLabel}><b>Obserrian</b><small>AI Guide</small></span>}
      </button>
    </aside>
  );
}
