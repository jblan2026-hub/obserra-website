"use client";

import Image from "next/image";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import styles from "./ObserraGuide.module.css";

type MessageAction = { href: string; label: string };
type Message = { from: "guide" | "visitor"; text: string; actions?: MessageAction[] };
type PageContext = {
  label: string;
  welcome: string;
  prompts: string[];
};

const excludedPaths = [
  "/admin",
  "/api",
  "/sign-in",
  "/sign-up",
  "/academy/learn",
  "/academy/certificate",
  "/academy/success",
];

function pageContext(pathname: string): PageContext {
  if (pathname.startsWith("/academy")) {
    return {
      label: "Academy Advisor",
      welcome: "I can help you compare courses, understand secure enrollment, access training, or learn how Obserra certificates are earned.",
      prompts: ["Recommend a course", "How does enrollment work?", "How do I earn a certificate?", "Enterprise training"],
    };
  }
  if (pathname.startsWith("/apps")) {
    return {
      label: "Product Advisor",
      welcome: "I can help you evaluate Obserra applications, compare use cases, request a product briefing, or identify the right solution for your organization.",
      prompts: ["Recommend an application", "Show EIOS", "Request a product demo", "Discuss enterprise pricing"],
    };
  }
  if (pathname.startsWith("/eios")) {
    return {
      label: "EIOS Advisor",
      welcome: "I can explain EIOS capabilities, guide you through the product views, or help arrange an executive platform briefing.",
      prompts: ["What is EIOS?", "Show product views", "Explain the business value", "Request an EIOS briefing"],
    };
  }
  if (pathname.startsWith("/services") || pathname.startsWith("/protection-intelligence")) {
    return {
      label: "Engagement Advisor",
      welcome: "I can help identify the right cybersecurity, protection, intelligence, governance, or technology engagement for your priority.",
      prompts: ["Cybersecurity advisory", "Executive protection", "AI governance", "Request a consultation"],
    };
  }
  if (pathname.startsWith("/about")) {
    return {
      label: "Executive Concierge",
      welcome: "I can help you understand Obserra leadership, credentials, speaking capabilities, and the best path to begin an engagement.",
      prompts: ["About Obserra", "Leadership credentials", "Book a speaker", "Start a conversation"],
    };
  }
  if (pathname.startsWith("/contact")) {
    return {
      label: "Engagement Concierge",
      welcome: "Tell me what you are trying to accomplish and I will direct you to the most relevant Obserra service, application, training, or briefing.",
      prompts: ["I need cybersecurity help", "I need executive protection", "I want a product demo", "I need team training"],
    };
  }
  return {
    label: "Executive Intelligence Advisor",
    welcome: "I can help you discover Obserra applications, professional services, Academy training, EIOS capabilities, and the right next step for your organization.",
    prompts: ["Explore applications", "Find professional training", "Review services", "Speak with an advisor"],
  };
}

function response(question: string, pathname: string): Message {
  const input = question.toLowerCase();

  if (/\beios\b|enterprise intelligence|situation room|decision intelligence|business value|product view/.test(input)) {
    return {
      from: "guide",
      text: "Obserra EIOS is a governed enterprise intelligence and execution environment. It connects risk context, evidence, policy, approvals, actions, and verified outcomes so leaders can make faster, defensible decisions.",
      actions: [
        { href: "/eios", label: "Explore EIOS" },
        { href: "/contact?interest=eios", label: "Request a briefing" },
      ],
    };
  }

  if (/app|application|software|product|demo|pricing/.test(input)) {
    return {
      from: "guide",
      text: "Obserra applications support cybersecurity, AI governance, cyber risk, control evidence, vulnerability prioritization, executive exposure, and enterprise intelligence. Product availability is stated clearly on each commercial product page.",
      actions: [
        { href: "/apps", label: "Browse applications" },
        { href: "/contact?interest=applications", label: "Request product guidance" },
      ],
    };
  }

  if (/course|academy|training|learn|recommend/.test(input)) {
    return {
      from: "guide",
      text: "Obserra Academy offers account-based, self-paced professional training across cybersecurity, protection, intelligence, leadership, AI, and secure technology. Course pages show the level, duration, outcomes, and price before enrollment.",
      actions: [
        { href: "/academy#courses", label: "Browse courses" },
        { href: "/contact?interest=enterprise-training", label: "Discuss team training" },
      ],
    };
  }

  if (/pay|price|buy|checkout|enroll|stripe|access/.test(input)) {
    return {
      from: "guide",
      text: "Select a course and choose Enroll securely. You will sign in or create a learner account, complete payment through Stripe, and return to account-based course access. Your enrollment and progress remain connected to that learner account.",
      actions: [{ href: "/academy#courses", label: "Choose a course" }],
    };
  }

  if (/certificate|certify|completion|assessment|exam/.test(input)) {
    return {
      from: "guide",
      text: "To earn an Obserra Certificate of Training, complete every lesson and score at least 80 percent on the final assessment. The certificate is generated from the authenticated completion record and includes a unique certificate ID.",
      actions: [{ href: "/academy", label: "Review Academy standards" }],
    };
  }

  if (/protect|executive protection|travel|threat|physical security/.test(input)) {
    return {
      from: "guide",
      text: "Obserra supports executive protection planning, protective intelligence, travel risk, digital exposure, and threat-informed security decisions for leaders and organizations.",
      actions: [
        { href: "/protection-intelligence", label: "Explore protection" },
        { href: "/contact?interest=protection", label: "Request consultation" },
      ],
    };
  }

  if (/cyber|ciso|incident|risk|governance|identity|grc|ai governance/.test(input)) {
    return {
      from: "guide",
      text: "Obserra provides executive cybersecurity advisory, fractional CISO leadership, incident readiness, risk and governance, identity access management, GRC, AI governance, and secure technology consulting.",
      actions: [
        { href: "/services", label: "Review services" },
        { href: "/contact?interest=cybersecurity", label: "Discuss your priority" },
      ],
    };
  }

  if (/about|leadership|credential|speaker|speaking|jody|blanchard/.test(input)) {
    return {
      from: "guide",
      text: "Obserra is veteran-owned and executive-led by Dr. Jody Blanchard, combining Fortune 500 cybersecurity leadership, military intelligence, protection, governance, technology, and professional education experience.",
      actions: [
        { href: "/about", label: "Meet the leadership" },
        { href: "/contact?interest=speaking", label: "Request a briefing or speaker" },
      ],
    };
  }

  if (/contact|consult|advisor|quote|speak|help|enterprise/.test(input)) {
    return {
      from: "guide",
      text: "Obserra can help scope a confidential advisory engagement, product briefing, enterprise training program, or protection and intelligence requirement.",
      actions: [{ href: "/contact", label: "Contact Obserra" }],
    };
  }

  const context = pageContext(pathname);
  return {
    from: "guide",
    text: `I am currently your ${context.label}. I can guide you to an Obserra application, service, Academy course, EIOS briefing, or confidential consultation.`,
    actions: [
      { href: "/apps", label: "Applications" },
      { href: "/services", label: "Services" },
      { href: "/academy", label: "Academy" },
      { href: "/contact", label: "Contact" },
    ],
  };
}

export default function ObserraGuide() {
  const pathname = usePathname();
  const context = useMemo(() => pageContext(pathname), [pathname]);
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messagesByPath, setMessagesByPath] = useState<Record<string, Message[]>>({});
  const messages = messagesByPath[pathname] ?? [{ from: "guide", text: context.welcome } satisfies Message];
  const messagesRef = useRef<HTMLDivElement | null>(null);
  const excluded = excludedPaths.some((path) => pathname.startsWith(path));

  useEffect(() => {
    if (pathname !== "/" || excluded) return;
    const dismissed = window.sessionStorage.getItem("obserrian-auto-open-dismissed") === "1";
    if (dismissed) return;
    const timer = window.setTimeout(() => setOpen(true), 1100);
    return () => window.clearTimeout(timer);
  }, [excluded, pathname]);

  useEffect(() => {
    if (!open) return;
    const container = messagesRef.current;
    if (container) container.scrollTop = container.scrollHeight;
  }, [messages, open]);

  if (excluded) return null;

  function currentMessages() {
    return messagesByPath[pathname] ?? [{ from: "guide", text: context.welcome } satisfies Message];
  }

  function appendExchange(question: string) {
    setMessagesByPath((byPath) => ({
      ...byPath,
      [pathname]: [
        ...(byPath[pathname] ?? [{ from: "guide", text: context.welcome } satisfies Message]),
        { from: "visitor", text: question },
        response(question, pathname),
      ],
    }));
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const question = input.trim();
    if (!question) return;
    appendExchange(question);
    setInput("");
  }

  function quickAsk(question: string) {
    appendExchange(question);
    setOpen(true);
  }

  function closeGuide() {
    setOpen(false);
    window.sessionStorage.setItem("obserrian-auto-open-dismissed", "1");
  }

  void currentMessages;

  return (
    <aside className={styles.guide} aria-label="Obserrian Executive Intelligence Advisor">
      {open && (
        <section className={styles.panel}>
          <header className={styles.header}>
            <div className={styles.brand}>
              <Image
                src="/brand/obserra-logo.png"
                alt="Obserra Executive Protection and Intelligence LLC"
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
          </div>

          <div className={styles.quick} aria-label="Suggested Obserrian actions">
            {context.prompts.map((item) => (
              <button type="button" key={item} onClick={() => quickAsk(item)}>{item}</button>
            ))}
          </div>

          <form className={styles.form} onSubmit={submit}>
            <label className={styles.srOnly} htmlFor="obserrian-question">Ask Obserrian</label>
            <input
              id="obserrian-question"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask about Obserra"
              autoComplete="off"
            />
            <button type="submit" aria-label="Send question to Obserrian">Send</button>
          </form>
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
