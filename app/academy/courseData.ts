export type Department = "Cyber" | "Protection" | "Intelligence" | "Technologies";

export type Course = {
  id: string;
  department: Department;
  track: string;
  title: string;
  duration: string;
  price: number;
  audience: string;
  description: string;
  outcomes: string[];
  modules: { title: string; duration: string; format: string; description: string }[];
  checkoutUrl?: string;
  stripePaymentLinkId?: string;
};

const lessons = (items: [string, string, string][]) => items.map(([title, duration, format]) => ({
  title, duration, format,
  description: "Interactive instruction, guided decision practice, and operational takeaways for the learner.",
}));

export const courses: Course[] = [
  {
    id: "cyber-foundations", department: "Cyber", track: "Core cyber", title: "Cybersecurity Fundamentals for Teams", duration: "75 minutes", price: 99,
    audience: "All employees, new hires, and teams rebuilding security habits",
    description: "Build practical judgment for everyday cyber decisions, from identity protection to reporting a suspected attack.",
    outcomes: ["Recognize common threats", "Protect accounts and data", "Report concerns quickly"],
    modules: lessons([["The threat landscape", "12 min", "Interactive briefing"], ["Identity is the control plane", "15 min", "Decision simulation"], ["Data, devices, and networks", "15 min", "Guided practice"], ["Email and social engineering", "15 min", "Scenario lab"], ["Report, preserve, improve", "18 min", "Action plan"]]),
    checkoutUrl: "https://buy.stripe.com/00w14mgTZ5AV0C77to4ow00", stripePaymentLinkId: "plink_1U0AzcCphHrx5d9okUuR7Rnp",
  },
  {
    id: "phishing-bec", department: "Cyber", track: "Human defense", title: "Phishing, BEC, and Social Engineering Defense", duration: "60 minutes", price: 89,
    audience: "Employees handling email, payments, vendors, or customer information", description: "Practice the verification habits that stop phishing, business email compromise, and urgent impersonation attempts.", outcomes: ["Spot manipulation signals", "Verify high risk requests", "Protect payments and credentials"],
    modules: lessons([["How manipulation works", "10 min", "Interactive briefing"], ["Email inspection", "12 min", "Spot the signal"], ["BEC and payment controls", "14 min", "Branching scenario"], ["Voice, text, and deepfake risk", "12 min", "Decision simulation"], ["Report and recover", "12 min", "Response practice"]]),
    checkoutUrl: "https://buy.stripe.com/7sY5kCcDJ4wR5Wr2944ow05", stripePaymentLinkId: "plink_1U0CvzCphHrx5d9oGSIVDvCj",
  },
  {
    id: "incident-response", department: "Cyber", track: "Operational readiness", title: "Incident Response Essentials", duration: "90 minutes", price: 149,
    audience: "Business leaders, technology teams, and designated incident participants", description: "Learn what to preserve, who decides, how to escalate, and how to communicate when a cyber incident unfolds.", outcomes: ["Escalate with useful facts", "Protect evidence and operations", "Support coordinated decisions"],
    modules: lessons([["What constitutes an incident", "15 min", "Interactive briefing"], ["First actions", "18 min", "Decision simulation"], ["Roles and authority", "18 min", "Role card exercise"], ["Communications under pressure", "18 min", "Scenario lab"], ["Recovery and lessons", "21 min", "After action workshop"]]),
    checkoutUrl: "https://buy.stripe.com/14A28qeLR3sNckPeVQ4ow04", stripePaymentLinkId: "plink_1U0CvbCphHrx5d9oSADT1xbC",
  },
  {
    id: "nist-csf", department: "Cyber", track: "Risk and governance", title: "NIST CSF 2.0 Foundations", duration: "90 minutes", price: 149,
    audience: "Leaders, risk owners, security teams, and cross functional program participants", description: "Use the NIST Cybersecurity Framework 2.0 to connect governance, risk, and operational action without treating it as a checkbox exercise.", outcomes: ["Explain the six functions", "Frame risks in business terms", "Prioritize practical improvement"],
    modules: lessons([["The framework as an operating model", "15 min", "Interactive briefing"], ["Govern and Identify", "18 min", "Risk mapping"], ["Protect and Detect", "18 min", "Control prioritization"], ["Respond and Recover", "18 min", "Scenario exercise"], ["Current and target profiles", "21 min", "Planning workshop"]]),
    checkoutUrl: "https://buy.stripe.com/14AeVc47dbZj84zaFA4ow03", stripePaymentLinkId: "plink_1U0Cv2CphHrx5d9oszxKuTwK",
  },
  {
    id: "cmmc-awareness", department: "Cyber", track: "Defense readiness", title: "CMMC Awareness for Leaders and Teams", duration: "75 minutes", price: 149,
    audience: "Defense industry leaders, program teams, technology teams, and personnel handling controlled information", description: "Establish practical awareness of controlled information, accountability, evidence, and behaviors that support CMMC readiness.", outcomes: ["Recognize controlled information responsibilities", "Support evidence discipline", "Escalate compliance concerns"],
    modules: lessons([["CMMC context and responsibility", "14 min", "Interactive briefing"], ["Controlled information in practice", "16 min", "Scenario lab"], ["People and process", "15 min", "Decision simulation"], ["Evidence and accountability", "14 min", "Guided practice"], ["Readiness actions", "16 min", "Action plan"]]),
    checkoutUrl: "https://buy.stripe.com/8x2bJ06flbZj2Kf6pk4ow06", stripePaymentLinkId: "plink_1U0CwoCphHrx5d9oJIjiNkdu",
  },
  {
    id: "executive-board", department: "Cyber", track: "Executive education", title: "Executive and Board Cyber Leadership", duration: "90 minutes", price: 249,
    audience: "Executives, board members, business unit leaders, and risk owners", description: "Strengthen oversight of cyber risk, investment, resilience, and crisis decisions without turning leaders into technical operators.", outcomes: ["Ask decision useful questions", "Connect risk to strategy", "Guide crisis and investment choices"],
    modules: lessons([["Cyber as enterprise risk", "16 min", "Executive briefing"], ["Accountability and risk appetite", "16 min", "Decision workshop"], ["Metrics that inform decisions", "18 min", "Dashboard lab"], ["Crisis leadership", "20 min", "Tabletop scenario"], ["Investment and assurance", "20 min", "Capital priority exercise"]]),
    checkoutUrl: "https://buy.stripe.com/fZu5kCbzFaVfckP7to4ow07", stripePaymentLinkId: "plink_1U0ECECphHrx5d9oY81VwZSb",
  },
  {
    id: "ai-security", department: "Cyber", track: "Responsible AI", title: "AI Security and Responsible Use", duration: "75 minutes", price: 129,
    audience: "Employees and leaders using, approving, or governing AI enabled tools", description: "Use AI productively while protecting sensitive information, verifying outputs, and maintaining meaningful human oversight.", outcomes: ["Apply safe use boundaries", "Verify AI outputs", "Escalate AI risks and incidents"],
    modules: lessons([["AI opportunity and exposure", "12 min", "Interactive briefing"], ["Data boundaries", "15 min", "Decision simulation"], ["Prompt and output risk", "15 min", "Scenario lab"], ["Human oversight", "15 min", "Guided practice"], ["Report and improve", "18 min", "Action plan"]]),
    checkoutUrl: "https://buy.stripe.com/aFa28qcDJ9RbesXbJE4ow08", stripePaymentLinkId: "plink_1U0ED0CphHrx5d9oC4RTqMRJ",
  },
  {
    id: "leadership-lab", department: "Cyber", track: "Cyber leadership", title: "Cybersecurity Leadership Lab", duration: "120 minutes", price: 249,
    audience: "Emerging security leaders, managers, and program owners", description: "A scenario led leadership lab for setting priorities, influencing stakeholders, establishing operating cadence, and briefing executives.", outcomes: ["Prioritize enterprise risk", "Influence across functions", "Communicate executive decisions"],
    modules: lessons([["Leadership context", "18 min", "Interactive briefing"], ["Prioritization under constraint", "24 min", "Portfolio simulation"], ["Influence and partnership", "20 min", "Role play scenario"], ["Operating cadence", "22 min", "Workshop"], ["Executive briefing", "36 min", "Briefing lab"]]),
    checkoutUrl: "https://buy.stripe.com/5kQcN40V1fbvdoT6pk4ow09", stripePaymentLinkId: "plink_1U0EDaCphHrx5d9oluMr6TiX",
  },
  {
    id: "executive-protection-foundations", department: "Protection", track: "Protective operations", title: "Executive Protection Foundations", duration: "90 minutes", price: 199,
    audience: "Protection professionals, executive support staff, and corporate security teams", description: "Build the planning, communication, observation, and decision discipline that supports executive protective operations.", outcomes: ["Plan protective operations", "Recognize changing risk", "Communicate protective decisions"],
    modules: lessons([["Protective mission and duty of care", "16 min", "Interactive briefing"], ["Advance planning", "18 min", "Planning lab"], ["Observation and situational awareness", "16 min", "Scenario practice"], ["Protective communications", "18 min", "Decision simulation"], ["After action discipline", "22 min", "Review workshop"]]),
    checkoutUrl: "https://buy.stripe.com/fZu3cu8nt1kF2Kf5lg4ow0a", stripePaymentLinkId: "plink_1U0EEBCphHrx5d9oAph2kSx6",
  },
  {
    id: "protective-intelligence-travel", department: "Protection", track: "Threat and travel readiness", title: "Protective Intelligence, Threat Assessment, and Travel Risk", duration: "105 minutes", price: 249,
    audience: "Protection teams, travel coordinators, corporate security, and executive support personnel", description: "Connect threat information, travel planning, and protective decisions into one practical risk management process.", outcomes: ["Assess protective threats", "Plan safer travel", "Escalate material changes"],
    modules: lessons([["Threat information and context", "18 min", "Analysis briefing"], ["Travel risk profile", "20 min", "Risk mapping"], ["Advance and contingency design", "20 min", "Planning exercise"], ["Live change management", "20 min", "Branching scenario"], ["Reporting and lessons", "27 min", "Operational review"]]),
    checkoutUrl: "https://buy.stripe.com/dRmaEW7jp6EZ2Kf5lg4ow0b", stripePaymentLinkId: "plink_1U0EEcCphHrx5d9oO8z5aISx",
  },
  {
    id: "intelligence-analysis-briefing", department: "Intelligence", track: "Intelligence practice", title: "Intelligence Analysis and Executive Briefing", duration: "90 minutes", price: 179,
    audience: "Analysts, corporate security teams, risk professionals, and executive support functions", description: "Turn fragmented information into clear, sourced, decision ready intelligence for business and protective leaders.", outcomes: ["Frame intelligence questions", "Assess source reliability", "Deliver decision ready briefings"],
    modules: lessons([["Decision led intelligence", "15 min", "Interactive briefing"], ["Collection and sourcing", "18 min", "Source exercise"], ["Analysis and confidence", "18 min", "Analytic lab"], ["Executive briefing", "18 min", "Briefing simulation"], ["Feedback and refinement", "21 min", "Review workshop"]]),
    checkoutUrl: "https://buy.stripe.com/14AcN4dHNfbv4Sn2944ow0c", stripePaymentLinkId: "plink_1U0EExCphHrx5d9oPmV6Qpq9",
  },
  {
    id: "osint-digital-exposure", department: "Intelligence", track: "Digital exposure", title: "Lawful OSINT and Digital Exposure Assessment", duration: "90 minutes", price: 179,
    audience: "Investigators, security professionals, executive support teams, and digital risk analysts", description: "Apply lawful, ethical open source research to identify public exposure and translate it into proportionate protective action.", outcomes: ["Use lawful OSINT methods", "Identify digital exposure", "Recommend proportionate controls"],
    modules: lessons([["Lawful and ethical boundaries", "15 min", "Governance briefing"], ["Public exposure mapping", "18 min", "Interactive exercise"], ["Validation and attribution", "18 min", "Analysis lab"], ["Risk translation", "18 min", "Decision simulation"], ["Reporting and privacy", "21 min", "Case review"]]),
    checkoutUrl: "https://buy.stripe.com/dRm9AS8ntbZjgB5cNI4ow0d", stripePaymentLinkId: "plink_1U0EFHCphHrx5d9o5ky5AoPP",
  },
  {
    id: "eios-foundations", department: "Technologies", track: "Security operations technology", title: "EIOS Foundations: Enterprise Intelligence Operations", duration: "90 minutes", price: 199,
    audience: "Security leaders, operational teams, technology stakeholders, and transformation sponsors", description: "Learn how connected signals, workflows, and accountable decisions can improve enterprise intelligence operations.", outcomes: ["Understand connected operations", "Frame workflow use cases", "Govern intelligent decisions"],
    modules: lessons([["From signals to decisions", "16 min", "Interactive briefing"], ["Use case design", "18 min", "Workflow lab"], ["Data and integration boundaries", "18 min", "Architecture exercise"], ["Human in the loop operations", "18 min", "Scenario simulation"], ["Measure and improve", "20 min", "Operating review"]]),
    checkoutUrl: "https://buy.stripe.com/8x26oG8ntgfzdoT6pk4ow0e", stripePaymentLinkId: "plink_1U0EFaCphHrx5d9o6dzl0JUU",
  },
  {
    id: "secure-ai-integration", department: "Technologies", track: "Technology governance", title: "Secure AI, Automation, and Integration Governance", duration: "105 minutes", price: 219,
    audience: "Technology leaders, architects, product owners, security teams, and automation sponsors", description: "Design AI enabled workflows and integrations with appropriate data controls, accountability, resilience, and oversight.", outcomes: ["Govern AI enabled workflows", "Assess integration risk", "Establish human oversight"],
    modules: lessons([["Automation value and risk", "18 min", "Executive briefing"], ["Identity and access design", "20 min", "Architecture lab"], ["Data protection and provenance", "20 min", "Scenario exercise"], ["Human oversight and exception handling", "20 min", "Decision simulation"], ["Assurance and continuous improvement", "27 min", "Governance workshop"]]),
    checkoutUrl: "https://buy.stripe.com/6oU7sKeLR7J35Wr6pk4ow0f", stripePaymentLinkId: "plink_1U0EFwCphHrx5d9oouTJNQjd",
  },
];
