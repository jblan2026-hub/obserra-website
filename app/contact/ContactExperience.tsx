"use client";

import { FormEvent, useMemo, useState } from "react";
import { track } from "@vercel/analytics";
import { LEGAL_ENTITY_NAME } from "@/lib/legal-identity";

type InquiryCategory =
  | "Executive protection or urgent travel support"
  | "Protective intelligence"
  | "Cybersecurity advisory"
  | "Fractional CISO leadership"
  | "OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC application or product demonstration"
  | "Obserra EIOS executive briefing"
  | "Academy learner support"
  | "Enterprise training"
  | "Speaking or executive briefing"
  | "Strategic partnership or general inquiry";

type ContactMethod = "Email" | "Phone" | "Either";
type Urgency = "Urgent" | "Same business day" | "This week" | "Standard";

const defaultCategory: InquiryCategory = "Strategic partnership or general inquiry";

const categories: InquiryCategory[] = [
  "Executive protection or urgent travel support",
  "Protective intelligence",
  "Cybersecurity advisory",
  "Fractional CISO leadership",
  "OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC application or product demonstration",
  "Obserra EIOS executive briefing",
  "Academy learner support",
  "Enterprise training",
  "Speaking or executive briefing",
  "Strategic partnership or general inquiry",
];

const interestMap: Record<string, InquiryCategory> = {
  "enterprise-consultation": "Cybersecurity advisory",
  "capability-review": "Strategic partnership or general inquiry",
  "application-demo": "OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC application or product demonstration",
  applications: "OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC application or product demonstration",
  eios: "Obserra EIOS executive briefing",
  "eios-demo": "Obserra EIOS executive briefing",
  protection: "Executive protection or urgent travel support",
  cybersecurity: "Cybersecurity advisory",
  "enterprise-training": "Enterprise training",
  speaking: "Speaking or executive briefing",
  partnership: "Strategic partnership or general inquiry",
};

const schedulingUrl = "https://calendly.com/obserra/executive-consultation";

function resolveInitialCategory(initialInterest?: string): InquiryCategory {
  if (!initialInterest) return defaultCategory;
  return interestMap[initialInterest.toLowerCase()] ?? defaultCategory;
}

export default function ContactExperience({ initialInterest }: { initialInterest?: string }) {
  const [category, setCategory] = useState<InquiryCategory>(() => resolveInitialCategory(initialInterest));
  const [method, setMethod] = useState<ContactMethod>("Email");
  const [urgency, setUrgency] = useState<Urgency>("Standard");
  const [company, setCompany] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [confidential, setConfidential] = useState(false);
  const [summary, setSummary] = useState("");

  const responseTime = useMemo(() => {
    if (urgency === "Urgent") return "Urgent priority selected. Include a direct phone number and the time-sensitive outcome you need.";
    if (urgency === "Same business day") return `Same-business-day priority selected. ${LEGAL_ENTITY_NAME} will review availability and respond as promptly as practical.`;
    if (urgency === "This week") return "This-week priority selected. Include your desired decision or meeting date.";
    return `Standard priority selected. Provide enough context for ${LEGAL_ENTITY_NAME} to route your inquiry efficiently.`;
  }, [urgency]);

  function buildInquiryBody(includePortalRequest = false) {
    return encodeURIComponent(
      [
        `Inquiry category: ${category}`,
        `Priority: ${urgency}`,
        `Preferred contact method: ${method}`,
        `Confidential inquiry: ${confidential ? "Yes" : "No"}`,
        `Secure portal requested: ${includePortalRequest ? "Yes" : "No"}`,
        `Organization: ${company || "Not provided"}`,
        `Contact name: ${name || "Not provided"}`,
        `Business email: ${email || "Not provided"}`,
        `Phone: ${phone || "Not provided"}`,
        "",
        "Business need and desired outcome:",
        summary || "Not provided",
        "",
        `Please do not send sensitive attachments by ordinary email. ${LEGAL_ENTITY_NAME} will provide secure exchange instructions when required.`,
      ].join("\n"),
    );
  }

  function submitInquiry(event: FormEvent) {
    event.preventDefault();
    track("contact_inquiry_submitted", { category, urgency, method, confidential });
    const subject = encodeURIComponent(`${LEGAL_ENTITY_NAME} Inquiry | ${category}`);
    window.location.href = `mailto:info@obserrallc.com?subject=${subject}&body=${buildInquiryBody()}`;
  }

  function requestSecurePortal() {
    track("contact_secure_portal_requested", { category });
    const subject = encodeURIComponent(`${LEGAL_ENTITY_NAME} Secure Exchange Request | ${category}`);
    window.location.href = `mailto:info@obserrallc.com?subject=${subject}&body=${buildInquiryBody(true)}`;
  }

  return (
    <section className="contact-experience" aria-label={`Schedule or submit an ${LEGAL_ENTITY_NAME} inquiry`}>
      <div className="contact-experience-intro">
        <p className="contact-eyebrow">BEGIN AN {LEGAL_ENTITY_NAME} ENGAGEMENT</p>
        <h2>Connect with the right {LEGAL_ENTITY_NAME} capability.</h2>
        <p>
          Select the outcome you need, indicate the appropriate priority, and provide enough context for a focused response.
          Do not include sensitive attachments in ordinary email.
        </p>
      </div>

      <div className="contact-experience-grid">
        <article className="contact-card scheduling-card">
          <h3>Schedule an executive consultation</h3>
          <p>Reserve time for an initial discussion about cybersecurity, enterprise applications, EIOS, training, or a strategic engagement.</p>
          <a
            className="contact-button"
            href={schedulingUrl}
            target="_blank"
            rel="noreferrer"
            onClick={() => track("contact_schedule_clicked", { source: "contact_page" })}
          >
            View consultation availability
          </a>
          <div className="schedule-embed-wrap" aria-label={`${LEGAL_ENTITY_NAME} consultation scheduling`}>
            <iframe
              title={`Schedule an ${LEGAL_ENTITY_NAME} executive consultation`}
              src={schedulingUrl}
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
            />
          </div>
        </article>

        <article className="contact-card inquiry-card">
          <h3>Submit a guided inquiry</h3>
          <form onSubmit={submitInquiry} className="contact-form-grid">
            <label>
              Area of interest
              <select value={category} onChange={(event) => setCategory(event.target.value as InquiryCategory)}>
                {categories.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </label>

            <label>
              Response priority
              <select value={urgency} onChange={(event) => setUrgency(event.target.value as Urgency)}>
                <option>Urgent</option>
                <option>Same business day</option>
                <option>This week</option>
                <option>Standard</option>
              </select>
            </label>

            <fieldset>
              <legend>Preferred contact method</legend>
              <div className="contact-method-row">
                <label><input type="radio" name="contact-method" value="Email" checked={method === "Email"} onChange={() => setMethod("Email")} /> Email</label>
                <label><input type="radio" name="contact-method" value="Phone" checked={method === "Phone"} onChange={() => setMethod("Phone")} /> Phone</label>
                <label><input type="radio" name="contact-method" value="Either" checked={method === "Either"} onChange={() => setMethod("Either")} /> Either</label>
              </div>
            </fieldset>

            <label>
              Organization
              <input type="text" value={company} onChange={(event) => setCompany(event.target.value)} placeholder="Organization name" />
            </label>

            <label>
              Contact name
              <input type="text" required value={name} onChange={(event) => setName(event.target.value)} placeholder="Your full name" />
            </label>

            <label>
              Business email
              <input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@organization.com" />
            </label>

            <label>
              Direct phone
              <input type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="Phone number" />
            </label>

            <label className="form-span-2">
              Business need and desired outcome
              <textarea value={summary} onChange={(event) => setSummary(event.target.value)} rows={4} placeholder="Describe the decision, risk, requirement, timing, and outcome you need." />
            </label>

            <label className="confidential-toggle form-span-2">
              <input type="checkbox" checked={confidential} onChange={(event) => setConfidential(event.target.checked)} />
              Treat this as a confidential inquiry
            </label>

            <p className="response-time form-span-2">{responseTime}</p>

            <div className="form-actions form-span-2">
              <button type="submit" className="contact-button">Prepare email inquiry</button>
              <button type="button" className="contact-outline" onClick={requestSecurePortal}>Request secure exchange</button>
            </div>
          </form>

          <p className="secure-note">
            The form prepares a structured message in your email application. {LEGAL_ENTITY_NAME} will provide a governed secure-exchange method when confidential files are required.
          </p>
        </article>
      </div>
    </section>
  );
}
