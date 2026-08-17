"use client";

import Image from "next/image";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { LEGAL_ENTITY_NAME } from "@/lib/legal-identity";
import styles from "./ObserraGuide.module.css";

type MessageAction = { href: string; label: string };
type Message = { from: "guide" | "visitor"; text: string; actions?: MessageAction[] };
type PageContext = {
  label: string;
  welcome: string;
  prompts: string[];
};
type AdvisorApiResponse = {
  text?: unknown;
  actions?: unknown;
};

const excludedPaths = [
  "/admin",
  "/api",
  "/sign-in",
  "/sign-up",
  "/portal",
  "/academy/learn",
  "/academy/certificate",
  "/academy/success",
  "/florida-security-training/access",
  "/florida-security-training/admin",
  "/florida-security-training/completion",
  "/florida-security-training/enroll",
  "/florida-security-training/exam",
  "/florida-security-training/identity",
  "/florida-security-training/live",
  "/florida-security-training/makeup",
  "/florida-security-training/observer",
];

function pageContext(pathname: string): PageContext {
  if (pathname.startsWith("/florida-security-training")) {
    return {
      label: "Florida Training Advisor",
      welcome:
        "I can explain the planned Florida Class D training experience, public readiness requirements, current authorization status, and what is or is not open today. I will keep regulated status boundaries explicit.",
      prompts: [
        "Is enrollment open?",
        "What are the ID requirements?",
        "How is the 40 hour course structured?",
        "Notify me when training opens",
      ],
    };
  }
  if (pathname.startsWith("/academy")) {
    return {
      label: "Academy Advisor",
      welcome:
        "Tell me what you want to learn or the role you are preparing for. I can compare the actual Academy catalog, recommend relevant courses, explain secure enrollment, or clarify completion requirements.",
      prompts: ["Recommend a course for me", "Compare courses", "How does enrollment work?", "Enterprise training"],
    };
  }
  if (pathname.startsWith("/apps")) {
    return {
      label: "Product Advisor",
      welcome:
        `Tell me the business problem you are trying to solve. I can compare actual ${LEGAL_ENTITY_NAME} applications, explain availability and deployment options, and direct you to the strongest product fit.`,
      prompts: ["Recommend an application", "Compare available products", "Show Obserra EIOS", "Discuss enterprise pricing"],
    };
  }
  if (pathname.startsWith("/eios")) {
    return {
      label: "Obserra EIOS Advisor",
      welcome:
        "I can explain how Obserra EIOS connects enterprise context, evidence, controls, decisions, approvals, execution, and verified outcomes, or help you determine whether an EIOS briefing makes sense for your organization.",
      prompts: ["What problem does EIOS solve?", "Explain the business value", "How does EIOS fit existing systems?", "Request an EIOS briefing"],
    };
  }
  if (pathname.startsWith("/services") || pathname.startsWith("/protection-intelligence")) {
    return {
      label: "Engagement Advisor",
      welcome:
        "Describe the risk, decision, deadline, or capability gap in front of you. I can map it to the most relevant Obserra advisory, cybersecurity, AI governance, protection, intelligence, or secure technology path.",
      prompts: ["Cybersecurity advisory", "AI governance", "Executive protection", "Help me scope an engagement"],
    };
  }
  if (pathname.startsWith("/trust")) {
    return {
      label: "Trust Advisor",
      welcome:
        "I can help buyers and reviewers navigate Obserra security, privacy, responsible AI, accessibility, procurement assurance, and governance information without overstating certification or compliance status.",
      prompts: ["Review security assurance", "Privacy and data handling", "Responsible AI", "Procurement review"],
    };
  }
  if (pathname.startsWith("/about") || pathname.startsWith("/speaking")) {
    return {
      label: "Executive Concierge",
      welcome:
        `I can help you understand ${LEGAL_ENTITY_NAME} leadership, credentials, operating experience, speaking capabilities, and the right next step for an executive conversation.`,
      prompts: ["Leadership credentials", "Cybersecurity experience", "Book a speaker", "Start a conversation"],
    };
  }
  if (pathname.startsWith("/contact")) {
    return {
      label: "Engagement Concierge",
      welcome:
        `Tell me what you are trying to accomplish and I will narrow it to the most relevant ${LEGAL_ENTITY_NAME} service, product, Academy path, or executive briefing.`,
      prompts: ["I need cybersecurity help", "I need AI governance", "I want a product briefing", "I need team training"],
    };
  }
  return {
    label: "Executive Intelligence Advisor",
    welcome:
      `Tell me the decision, risk, capability gap, or outcome you are working through. I can connect it to ${LEGAL_ENTITY_NAME} services, EIOS, applications, Academy learning, trust resources, or a confidential executive conversation.`,
    prompts: ["What can Obserra help with?", "Explore EIOS", "Recommend an application", "Find professional training"],
  };
}

function validatedActions(value: unknown): MessageAction[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const actions = value
    .filter((candidate): candidate is { href: unknown; label: unknown } => Boolean(candidate && typeof candidate === "object"))
    .map((candidate) => ({
      href: typeof candidate.href === "string" ? candidate.href.trim() : "",
      label: typeof candidate.label === "string" ? candidate.label.trim() : "",
    }))
    .filter((action) => action.href.startsWith("/") && action.href.length <= 240 && action.label.length > 0 && action.label.length <= 90)
    .slice(0, 3);
  return actions.length ? actions : undefined;
}

export default function ObserraGuide() {
  const pathname = usePathname();
  const context = useMemo(() => pageContext(pathname), [pathname]);
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [messagesByPath, setMessagesByPath] = useState<Record<string, Message[]>>({});
  const messages = useMemo(
    () => messagesByPath[pathname] ?? [{ from: "guide", text: context.welcome } satisfies Message],
    [context.welcome, messagesByPath, pathname],
  );
  const messagesRef = useRef<HTMLDivElement | null>(null);
  const excluded = excludedPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`));

  useEffect(() => {
    if (pathname !== "/" || excluded) return;
    const dismissed = window.sessionStorage.getItem("obserrian-auto-open-dismissed") === "1";
    if (dismissed) return;
    const timer = window.setTimeout(() => setOpen(true), 1_100);
    return () => window.clearTimeout(timer);
  }, [excluded, pathname]);

  useEffect(() => {
    if (!open) return;
    const container = messagesRef.current;
    if (container) container.scrollTop = container.scrollHeight;
  }, [messages, open, pending]);

  if (excluded) return null;

  function appendMessage(path: string, message: Message) {
    setMessagesByPath((byPath) => ({
      ...byPath,
      [path]: [...(byPath[path] ?? [{ from: "guide", text: pageContext(path).welcome } satisfies Message]), message],
    }));
  }

  async function ask(questionValue: string) {
    const question = questionValue.replace(/\s+/g, " ").trim().slice(0, 1_000);
    if (!question || pending) return;

    const requestPath = pathname;
    const history = messages.slice(-6).map((message) => ({
      role: message.from === "visitor" ? "user" : "assistant",
      content: message.text,
    }));

    appendMessage(requestPath, { from: "visitor", text: question });
    setInput("");
    setPending(true);

    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 22_000);

    try {
      const response = await fetch("/api/obserrian", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ question, pathname: requestPath, conversation: history }),
        signal: controller.signal,
      });
      if (!response.ok) throw new Error(`advisor_request_${response.status}`);
      const payload = (await response.json()) as AdvisorApiResponse;
      const text = typeof payload.text === "string" ? payload.text.trim().slice(0, 2_800) : "";
      if (!text) throw new Error("advisor_empty_response");
      appendMessage(requestPath, { from: "guide", text, actions: validatedActions(payload.actions) });
    } catch {
      appendMessage(requestPath, {
        from: "guide",
        text:
          "I could not complete that analysis just now. Your question has not changed any account, purchase, enrollment, or regulated training state. You can try again or continue with a direct Obserra conversation.",
        actions: [{ href: "/contact?interest=enterprise-consultation", label: "Talk to Obserra" }],
      });
    } finally {
      window.clearTimeout(timeout);
      setPending(false);
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void ask(input);
  }

  function quickAsk(question: string) {
    setOpen(true);
    void ask(question);
  }

  function closeGuide() {
    setOpen(false);
    window.sessionStorage.setItem("obserrian-auto-open-dismissed", "1");
  }

  return (
    <aside className={styles.guide} aria-label="Obserrian Executive Intelligence Advisor">
      {open && (
        <section className={styles.panel} aria-busy={pending}>
          <header className={styles.header}>
            <div className={styles.brand}>
              <Image
                src="/brand/obserra-logo.png"
                alt={LEGAL_ENTITY_NAME}
                width={170}
                height={33}
                className={styles.brandLogo}
              />
              <div>
                <strong>Obserrian</strong>
                <span>{context.label}</span>
              </div>
            </div>
            <button type="button" onClick={closeGuide} aria-label="Minimize Obserrian">−</button>
          </header>

          <div className={styles.messages} ref={messagesRef} aria-live="polite">
            {messages.map((message, index) => (
              <div className={`${styles.message} ${message.from === "visitor" ? styles.visitor : ""}`} key={`${message.from}-${index}`}>
                <p>{message.text}</p>
                {message.actions && (
                  <div className={styles.messageActions}>
                    {message.actions.map((action) => (
                      <a key={`${action.href}-${action.label}`} href={action.href}>{action.label}</a>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {pending ? (
              <div className={`${styles.message} ${styles.thinking}`} role="status">
                <span className={styles.thinkingDot} aria-hidden="true" />
                <span className={styles.thinkingDot} aria-hidden="true" />
                <span className={styles.thinkingDot} aria-hidden="true" />
                <span className={styles.srOnly}>Obserrian is analyzing your question.</span>
              </div>
            ) : null}
          </div>

          <div className={styles.quick} aria-label="Suggested Obserrian actions">
            {context.prompts.map((item) => (
              <button type="button" key={item} disabled={pending} onClick={() => quickAsk(item)}>{item}</button>
            ))}
          </div>

          <form className={styles.form} onSubmit={submit}>
            <label className={styles.srOnly} htmlFor="obserrian-question">Ask Obserrian</label>
            <input
              id="obserrian-question"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask about a decision, risk, product, service, or course"
              autoComplete="off"
              maxLength={1_000}
              disabled={pending}
            />
            <button type="submit" aria-label="Send question to Obserrian" disabled={pending || !input.trim()}>
              {pending ? "Working" : "Send"}
            </button>
          </form>
          <p className={styles.grounding}>Grounded in current public Obserra product, service, Academy, and governance information.</p>
        </section>
      )}

      <button
        type="button"
        className={styles.launcher}
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label={open ? "Minimize Obserrian" : "Open Obserrian Executive Intelligence Advisor"}
      >
        <Image src="/brand/obserra-mark.svg" alt="" aria-hidden="true" width={46} height={46} className={styles.launcherMark} />
        {!open && <span>Ask Obserrian</span>}
      </button>
    </aside>
  );
}
