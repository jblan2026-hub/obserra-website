import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, FileCheck2, FileDown, ShieldCheck } from "lucide-react";
import { requireFloridaClassDSignedInUser } from "../../../lib/florida-class-d-auth";
import { listCompletionDocumentsForStudent } from "../../../lib/florida-class-d-completion-documents";
import "../florida-security-training.css";

export const metadata: Metadata = {
  title: "Florida Class D Completion Documents | Obserra",
  robots: { index: false, follow: false },
};

function documentLabel(type: string) {
  if (type === "fdacs_16103") return "FDACS-16103 Certificate of Security Officer Training";
  if (type === "obserra_course_completion") return "Obserra Course Completion Certificate";
  return "Florida Class D Application Instructions";
}

export default async function FloridaClassDCompletionDocumentsPage() {
  const user = await requireFloridaClassDSignedInUser();
  const documents = await listCompletionDocumentsForStudent(user.userId);
  const official = documents.filter((document) => document.document_type === "fdacs_16103");
  const supplemental = documents.filter((document) => document.document_type !== "fdacs_16103");

  return (
    <main className="fl-classd">
      <section className="fl-classd__hero">
        <div className="fl-classd__eyebrow"><ShieldCheck size={18} /> Florida Class D Student Records</div>
        <h1>Completion Documents</h1>
        <p className="fl-classd__lead">After successful completion and school compliance review, this portal provides the documents made available for your Florida Class D license application record.</p>
        <div className="fl-classd__notice">
          <FileCheck2 size={20} />
          <div>
            <strong>No completion certificate is issued for hours alone.</strong>
            <span>Forty verified instructional hours are required, but you must also complete all required learning activities, pass the separate 170-question final examination with at least 128 correct answers, clear any required remediation or attendance issues, and receive school completion approval before any course-completion certificate is released.</span>
          </div>
        </div>
        <div className="fl-classd__notice">
          <FileCheck2 size={20} />
          <div>
            <strong>The official training certificate is FDACS-16103.</strong>
            <span>It is generated through the school&apos;s LIAS reporting workflow only after successful completion. An Obserra-branded certificate may also be provided after the passing examination and completion approval, but it is supplemental and does not replace FDACS-16103.</span>
          </div>
        </div>
      </section>

      <section className="fl-classd__section">
        <div className="fl-classd__section-heading">
          <span>SUCCESSFUL COMPLETION STANDARD</span>
          <h2>40 hours + required coursework + passing examination + school approval</h2>
          <p>Reaching 2,400 verified instructional minutes makes the instructional-hours requirement complete. It does not, by itself, complete the course. A failed examination keeps the course incomplete and no certificate is issued. If a retest is required, the regulated remediation and retest process must be completed before successful completion can be approved.</p>
        </div>
      </section>

      <section className="fl-classd__section">
        <div className="fl-classd__section-heading">
          <span>OFFICIAL FLORIDA TRAINING RECORD</span>
          <h2>Certificate to include with the Class D application</h2>
          <p>After you pass the final examination and the school approves successful completion, authorized staff report the completion through LIAS. Download the LIAS-generated Certificate of Security Officer Training when it appears below and retain a copy with your application records.</p>
        </div>
        <div className="fl-classd__automation-grid">
          {official.map((document) => (
            <Link key={document.id} href={`/api/florida-class-d/completion-documents?documentId=${encodeURIComponent(document.id)}`}>
              <FileDown size={18} /> <span>{documentLabel(document.document_type)}</span>
            </Link>
          ))}
          {official.length === 0 ? <div><b>Pending</b><span>Your official FDACS-16103 has not yet been released to this portal.</span></div> : null}
        </div>
      </section>

      <section className="fl-classd__section">
        <div className="fl-classd__section-heading">
          <span>FLORIDA CLASS D APPLICATION</span>
          <h2>Use the official FDACS application process</h2>
          <p>The FDACS-16103 is the official course-completion evidence students retain for the Class D application. The application itself is submitted to FDACS, not to Obserra.</p>
        </div>
        <div className="fl-classd__actions">
          <a href="https://laso.fdacs.gov/apply/DApplicationForm.aspx" target="_blank" rel="noreferrer">Open official Class D application <ExternalLink size={16} /></a>
          <a className="secondary" href="https://www.fdacs.gov/Business-Services/Private-Security-Licenses/Class-D-Security-Officer-License-Requirements" target="_blank" rel="noreferrer">Review FDACS Class D requirements <ExternalLink size={16} /></a>
        </div>
      </section>

      <section className="fl-classd__section">
        <div className="fl-classd__section-heading">
          <span>SUPPLEMENTAL RECORDS</span>
          <h2>School completion and application support</h2>
          <p>Supplemental Obserra records may be generated only after the passing examination and successful completion approval. They may include your verified legal name, course title, 40 instructional hours, completion date, and a unique certificate identifier. These records do not substitute for the official LIAS-generated FDACS-16103.</p>
        </div>
        <div className="fl-classd__automation-grid">
          {supplemental.map((document) => (
            <Link key={document.id} href={`/api/florida-class-d/completion-documents?documentId=${encodeURIComponent(document.id)}`}>
              <FileDown size={18} /> <span>{documentLabel(document.document_type)}</span>
            </Link>
          ))}
          {supplemental.length === 0 ? <div><b>Info</b><span>No supplemental documents are currently available.</span></div> : null}
        </div>
      </section>

      <section className="fl-classd__legal">
        <ShieldCheck />
        <div>
          <strong>License application reminder</strong>
          <p>Successful course completion does not itself issue a Florida Class D license. Submit the required license application and supporting documentation to the Florida Department of Agriculture and Consumer Services and wait for state licensure before performing duties that require a Class D license.</p>
        </div>
      </section>
    </main>
  );
}
