"use client";

import { FormEvent, useMemo, useState } from "react";
import { track } from "@vercel/analytics";

type InquiryCategory =
  | "Protection or urgent travel need"
  | "Protective intelligence"
  | "Cybersecurity advisory"
  | "Fractional CISO"
  | "Obserra application"
  | "EIOS partner conversation"
  | "Academy purchase"
  | "Speaking or executive briefing"
  | "General partnership";

type ContactMethod = "Email" | "Phone" | "Either";
type Urgency = "Immediate (0-4 hours)" | "Today (same business day)" | "This week" | "Standard";

const categories: InquiryCategory[] = [
  "Protection or urgent travel need",
  "Protective intelligence",
  "Cybersecurity advisory",
  "Fractional CISO",
  "Obserra application",
  "EIOS partner conversation",
  "Academy purchase",
  "Speaking or executive briefing",
  "General partnership",
];

const schedulingUrl = "https://calendly.com/obserra/executive-consultation";
const securePortalUrl = "https://www.obserrallc.com/contact?portal=requested";

export default function ContactExperience() {
  const [category, setCategory] = useState<InquiryCategory>(categories[0]);
  const [method, setMethod] = useState<ContactMethod>("Email");
  const [urgency, setUrgency] = useState<Urgency>("Today (same business day)");
  const [company, setCompany] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [confidential, setConfidential] = useState(false);
  const [summary, setSummary] = useState("");

  const responseTime = useMemo(() => {
    if (urgency === "Immediate (0-4 hours)") return "Expected response target: within 4 hours for urgent protection or travel-related requests.";
    if (urgency === "Today (same business day)") return "Expected response target: same business day.";
    if (urgency === "This week") return "Expected response target: within 1 business day.";
    return "Expected response target: within 1 business day.";
  }, [urgency]);

  function submitInquiry(event: FormEvent) {
    event.preventDefault();

    const subject = encodeURIComponent(`Obserra Inquiry | ${category} | ${urgency}`);
    const body = encodeURIComponent(
      [
        `Category: ${category}`,
        `Urgency: ${urgency}`,
        `Preferred contact method: ${method}`,
        `Confidential inquiry: ${confidential ? "Yes" : "No"}`,
        `Company: ${company || "Not provided"}`,
        `Name: ${name || "Not provided"}`,
        `Business email: ${email || "Not provided"}`,
        `Phone: ${phone || "Not provided"}`,
        "",
        "Inquiry summary:",
        summary || "Not provided",
        "",
        "Secure file submission policy:",
        "Do not send sensitive files over email. Request governed portal access for secure document exchange.",
      ].join("\n")
    );

    track("contact_inquiry_submitted", {
      category,
      urgency,
      method,
      confidential,
    });

    window.location.href = `mailto:info@obserrallc.com?subject=${subject}&body=${body}`;
  }

  return (
    <section className="contact-experience" aria-label="Immediate scheduling and guided inquiry">
      <div className="contact-experience-intro">
        <p className="contact-eyebrow">SCHEDULE OR SUBMIT NOW</p>
        <h2>Get to the right team immediately.</h2>
        <p>
          Choose a service category, set urgency, and send a structured inquiry in under two minutes.
          For sensitive information, use the governed secure portal request only.
        </p>
      </div>

      <div className="contact-experience-grid">
        <article className="contact-card scheduling-card">
          <h3>Embedded scheduling</h3>
          <p>Book an executive consultation directly. For emergency protection or travel needs, also send an urgent inquiry below.</p>
          <a
            className="contact-button"
            href={schedulingUrl}
            target="_blank"
            rel="noreferrer"
            onClick={() => track("contact_schedule_clicked", { source: "contact_page" })}
          >
            Open live scheduling
          </a>
          <div className="schedule-embed-wrap" aria-label="Scheduling preview">
            <iframe
              title="Obserra scheduling"
              src={schedulingUrl}
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
            />
          </div>
        </article>

        <article className="contact-card inquiry-card">
          <h3>Guided inquiry</h3>
          <form onSubmit={submitInquiry} className="contact-form-grid">
            <label>
              Service category
              <select value={category} onChange={(event) => setCategory(event.target.value as InquiryCategory)}>
                {categories.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </label>

            <label>
              Urgency level
              <select value={urgency} onChange={(event) => setUrgency(event.target.value as Urgency)}>
                <option>Immediate (0-4 hours)</option>
                <option>Today (same business day)</option>
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
              Company
              <input type="text" value={company} onChange={(event) => setCompany(event.target.value)} placeholder="Company name" />
            </label>

            <label>
              Contact name
              <input type="text" value={name} onChange={(event) => setName(event.target.value)} placeholder="Your full name" />
            </label>

            <label>
              Business email
              <input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@company.com" />
            </label>

            <label>
              Phone
              <input type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="Direct phone" />
            </label>

            <label className="form-span-2">
              Inquiry summary
              <textarea value={summary} onChange={(event) => setSummary(event.target.value)} rows={4} placeholder="What outcome do you need, by when, and what is at risk?" />
            </label>

            <label className="confidential-toggle form-span-2">
              <input type="checkbox" checked={confidential} onChange={(event) => setConfidential(event.target.checked)} />
              Mark as confidential inquiry
            </label>

            <p className="response-time form-span-2">{responseTime}</p>

            <div className="form-actions form-span-2">
              <button type="submit" className="contact-button">Send structured inquiry</button>
              <a
                className="contact-outline"
                href={securePortalUrl}
                onClick={() => track("contact_secure_portal_requested", { category })}
              >
                Request secure file portal
              </a>
            </div>
          </form>

          <p className="secure-note">
            Secure file submission is only accepted through a governed portal. Do not email attachments containing sensitive data.
          </p>
        </article>
      </div>
    </section>
  );
}
