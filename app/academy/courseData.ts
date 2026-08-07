import { mergeStudioCourses } from "./studioCatalog";

export type Department = "Cyber" | "Protection" | "Intelligence" | "Technologies";
export type CourseLevel = "Foundation" | "Professional" | "Advanced" | "Executive Intensive" | "CISO Masterclass";

export type Course = {
  id: string;
  department: Department;
  level: CourseLevel;
  track: string;
  title: string;
  duration: string;
  price: number;
  audience: string;
  description: string;
  outcomes: string[];
  modules: { title: string; duration: string; format: string; description: string }[];
};

type CourseSpec = readonly [id: string, title: string, level: CourseLevel, department: Department, track: string, focus: string];

const prices: Record<CourseLevel, number> = {
  Foundation: 149,
  Professional: 249,
  Advanced: 349,
  "Executive Intensive": 499,
  "CISO Masterclass": 699,
};

const durations: Record<CourseLevel, string> = {
  Foundation: "2.5 hours",
  Professional: "4.5 hours",
  Advanced: "7 hours",
  "Executive Intensive": "9 hours",
  "CISO Masterclass": "11 hours",
};

const audiences: Record<Department, string> = {
  Cyber: "Security leaders, technology teams, risk owners, and business decision makers",
  Protection: "Corporate security teams, executive support personnel, and protection professionals",
  Intelligence: "Leaders, analysts, investigators, and operational decision makers",
  Technologies: "Technology leaders, product owners, architects, and transformation teams",
};

const specs: CourseSpec[] = [
  ["cybersecurity-foundations", "Cybersecurity Foundations for New Professionals", "Foundation", "Cyber", "Cyber Defense Academy", "foundational cyber judgment, identity protection, and incident reporting"],
  ["generative-ai-business-leaders", "Generative AI Fundamentals for Business Leaders", "Foundation", "Technologies", "AI and LLM Academy", "responsible business adoption of generative AI"],
  ["llms-for-leaders", "Large Language Models, LLMs, Explained for Leaders", "Foundation", "Technologies", "AI and LLM Academy", "how language models work, where they help, and where oversight is required"],
  ["security-awareness-high-risk", "Security Awareness for High Risk Employees", "Foundation", "Cyber", "Cyber Defense Academy", "high-consequence decisions involving access, data, payments, and social engineering"],
  ["executive-travel-risk", "Executive Travel Risk Management", "Foundation", "Protection", "Executive Protection and Intelligence Academy", "travel risk planning, changing conditions, and safe escalation"],
  ["digital-exposure-executive-privacy", "Digital Exposure and Executive Privacy", "Foundation", "Protection", "Executive Protection and Intelligence Academy", "public exposure reduction, privacy-aware assessment, and proportionate protective action"],
  ["ai-ready-workforce", "Building an AI Ready Workforce", "Foundation", "Technologies", "AI and LLM Academy", "workforce readiness, safe experimentation, and accountable AI use"],
  ["coding-for-cyber-leaders", "Coding Fundamentals for Cybersecurity Leaders", "Foundation", "Technologies", "Obserra Technologies Academy", "technical fluency for leaders who govern cyber automation and engineering work"],
  ["python-security-automation", "Python for Security, Risk, and Automation", "Professional", "Technologies", "Obserra Technologies Academy", "safe automation design, data handling, and security use cases with Python"],
  ["api-security-integration", "API Security and Enterprise Integration", "Professional", "Technologies", "Obserra Technologies Academy", "secure API design, integration governance, and service accountability"],
  ["prompt-engineering-secure-workflows", "Prompt Engineering for Secure Business Workflows", "Professional", "Technologies", "AI and LLM Academy", "prompt design, data minimization, output validation, and human review"],
  ["zero-trust-strategy", "Zero Trust Strategy and Implementation", "Professional", "Cyber", "Cyber Defense Academy", "identity-centric security strategy, segmentation, and continuous verification"],
  ["cloud-security-executives", "Cloud Security for Executives", "Professional", "Cyber", "Cyber Defense Academy", "cloud accountability, shared responsibility, and executive risk decisions"],
  ["identity-security-access-governance", "Identity Security and Access Governance", "Professional", "Cyber", "Cyber Defense Academy", "identity lifecycle governance, least privilege, and access-risk reduction"],
  ["vulnerability-management", "Vulnerability Management and Risk Prioritization", "Professional", "Cyber", "Cyber Defense Academy", "evidence-based vulnerability prioritization and remediation accountability"],
  ["executive-protection-fundamentals", "Executive Protection Fundamentals", "Professional", "Protection", "Executive Protection and Intelligence Academy", "protective planning, duty of care, operational communication, and after-action discipline"],
  ["insider-threat-awareness", "Insider Threat Awareness for Leaders", "Professional", "Cyber", "Cyber Defense Academy", "risk-aware people, data, and access decisions without unsupported accusations"],
  ["low-code-security-automation", "Low Code Automation for Business and Security Teams", "Professional", "Technologies", "Obserra Technologies Academy", "governed automation, safe approval paths, and measurable process improvement"],
  ["cybersecurity-governance-policy", "Cybersecurity Governance and Policy Development", "Professional", "Cyber", "CISO and Board Leadership Academy", "policy design, ownership, evidence, and operational adoption"],
  ["ai-executive-decision-making", "AI for Executive Decision Making", "Professional", "Technologies", "AI and LLM Academy", "AI-supported executive decisions, evidence boundaries, and accountable review"],
  ["ai-data-privacy-ip", "AI Data Privacy and Intellectual Property Protection", "Professional", "Technologies", "AI and LLM Academy", "data classification, privacy, intellectual-property protection, and AI use controls"],
  ["executive-dashboards-data-ai", "Building Executive Dashboards with Data and AI", "Professional", "Technologies", "Obserra Technologies Academy", "decision-ready metrics, explainable AI summaries, and executive dashboard design"],
  ["cybersecurity-business-leaders", "Cybersecurity Fundamentals for Business Leaders", "Foundation", "Cyber", "Cyber Defense Academy", "business accountability for cyber risk, resilience, and security investment"],
  ["building-trusted-teams", "Building Trusted Teams in High Stakes Environments", "Professional", "Intelligence", "Professional Leadership Academy", "trust, communication, accountability, and decisions under pressure"],
  ["security-intelligence-careers", "Security and Intelligence Career Foundations", "Foundation", "Intelligence", "Professional Leadership Academy", "career foundations, ethical practice, and professional decision habits"],
  ["secure-enterprise-llm-deployment", "Secure Enterprise LLM Deployment", "Advanced", "Technologies", "AI and LLM Academy", "enterprise model deployment, governance, data controls, and operating safeguards"],
  ["ai-risk-ethics-governance", "AI Risk, Ethics, and Governance", "Advanced", "Technologies", "AI and LLM Academy", "AI risk assessment, ethical decision-making, governance, and evidence"],
  ["ai-policy-responsible-use", "AI Policy Development and Responsible Use", "Advanced", "Technologies", "AI and LLM Academy", "policy architecture, responsible-use controls, and implementation accountability"],
  ["secure-ai-native-apps", "Secure AI Native Business Applications", "Advanced", "Technologies", "Obserra Technologies Academy", "secure-by-design AI-native application architecture and operational controls"],
  ["secure-software-development-lifecycle", "Secure Software Development Lifecycle", "Advanced", "Technologies", "Obserra Technologies Academy", "secure engineering practices, assurance evidence, and release discipline"],
  ["cloud-native-app-security", "Cloud Native Application Security", "Advanced", "Technologies", "Obserra Technologies Academy", "cloud-native threat reduction, resilient delivery, and runtime safeguards"],
  ["devsecops-enterprise-teams", "DevSecOps for Enterprise Teams", "Advanced", "Technologies", "Obserra Technologies Academy", "integrated development, security, operations, and evidence-backed release controls"],
  ["incident-response-leadership", "Incident Response Leadership", "Advanced", "Cyber", "Cyber Defense Academy", "crisis roles, evidence handling, executive communication, and recovery leadership"],
  ["ransomware-readiness", "Ransomware Readiness and Executive Response", "Advanced", "Cyber", "Cyber Defense Academy", "ransomware readiness, material decision points, and executive response coordination"],
  ["digital-forensics-evidence", "Digital Forensics and Evidence Preservation", "Advanced", "Cyber", "Cyber Defense Academy", "forensic integrity, evidence preservation, reporting, and defensible handoffs"],
  ["protective-intelligence-corporate-security", "Protective Intelligence for Corporate Security Teams", "Advanced", "Protection", "Executive Protection and Intelligence Academy", "protective intelligence analysis, threat indicators, and safe operational recommendations"],
  ["third-party-cyber-risk", "Third Party and Supply Chain Cyber Risk", "Advanced", "Cyber", "CISO and Board Leadership Academy", "supplier risk, concentration exposure, control validation, and accountable escalation"],
  ["business-continuity-cyber-resilience", "Business Continuity and Cyber Resilience", "Advanced", "Cyber", "Cyber Defense Academy", "continuity planning, recovery decisions, and resilience measurement"],
  ["crisis-communications-executives", "Crisis Communications for Executive Teams", "Advanced", "Protection", "Executive Protection and Intelligence Academy", "truthful crisis communication, stakeholder coordination, and reputational resilience"],
  ["executive-threat-assessment", "Executive Threat Assessment and Protective Intelligence", "Advanced", "Protection", "Executive Protection and Intelligence Academy", "threat assessment, evidence calibration, protective planning, and escalation"],
  ["ai-red-teaming-model-risk", "AI Red Teaming and Model Risk Testing", "Executive Intensive", "Technologies", "AI and LLM Academy", "model-risk testing, adversarial analysis, controls, and executive accountability"],
  ["cyber-risk-assessment", "Cyber Risk Assessment and Remediation Planning", "Executive Intensive", "Cyber", "CISO and Board Leadership Academy", "risk assessment, prioritization, remediation planning, and leadership reporting"],
  ["enterprise-risk-technology", "Enterprise Risk Management for Technology Leaders", "Executive Intensive", "Cyber", "CISO and Board Leadership Academy", "technology risk integration, strategic trade-offs, and business accountability"],
  ["building-security-program", "Building a High Performing Security Program", "Executive Intensive", "Cyber", "CISO and Board Leadership Academy", "security-program operating models, investment, people, and measurable outcomes"],
  ["crisis-leadership-cisos", "Crisis Leadership for CISOs and Executives", "Executive Intensive", "Cyber", "CISO and Board Leadership Academy", "crisis leadership, governance, communication, and recovery under pressure"],
  ["board-communication-cybersecurity", "Board Communication for Cybersecurity Leaders", "Executive Intensive", "Cyber", "CISO and Board Leadership Academy", "board-level cyber communication, evidence, decisions, and accountability"],
  ["cybersecurity-executive-metrics", "Cybersecurity Metrics That Executives Understand", "Executive Intensive", "Cyber", "CISO and Board Leadership Academy", "executive metrics, business context, confidence, and decision usefulness"],
  ["workplace-violence-threat-management", "Workplace Violence Prevention and Threat Management", "Executive Intensive", "Protection", "Executive Protection and Intelligence Academy", "prevention, threat-management governance, and coordinated protective response"],
  ["family-security-digital-safety", "Family Security, Privacy, and Digital Safety", "Executive Intensive", "Protection", "Executive Protection and Intelligence Academy", "family privacy, digital safety, protective habits, and proportionate response"],
  ["regulatory-readiness-security", "Regulatory Readiness for Security Leaders", "Executive Intensive", "Cyber", "CISO and Board Leadership Academy", "security-control readiness, evidence, accountability, and honest gap communication"],
  ["cybersecurity-budget-business-case", "Budgeting and Business Cases for Cybersecurity", "Executive Intensive", "Cyber", "CISO and Board Leadership Academy", "cybersecurity investment cases, cost context, risk reduction, and executive decisions"],
  ["ciso-leadership-playbook", "The New CISO Leadership Playbook", "CISO Masterclass", "Cyber", "CISO and Board Leadership Academy", "modern CISO leadership, operating cadence, enterprise influence, and accountable outcomes"],
  ["becoming-a-strategic-ciso", "Becoming a Strategic CISO", "CISO Masterclass", "Cyber", "CISO and Board Leadership Academy", "strategic CISO positioning, business partnership, and board-ready leadership"],
  ["ciso-career-executive-presence", "CISO Career Development and Executive Presence", "CISO Masterclass", "Cyber", "CISO and Board Leadership Academy", "executive presence, career strategy, credibility, and leadership communication"],
  ["eios-enterprise-intelligence-overview", "EIOS Enterprise Intelligence Operating System Overview", "CISO Masterclass", "Technologies", "Obserra Technologies Academy", "enterprise intelligence, governed orchestration, digital twin context, and verified outcomes"],
  ["executive-decision-making-pressure", "Executive Decision Making Under Pressure", "CISO Masterclass", "Intelligence", "Professional Leadership Academy", "high-stakes decisions, evidence, trade-offs, and accountable execution"],
  ["ethical-leadership-ai", "Ethical Leadership in the Age of AI", "CISO Masterclass", "Intelligence", "Professional Leadership Academy", "ethical leadership, AI accountability, human consequences, and durable trust"],
  ["leading-through-cyber-crisis", "Leading Through Cyber Crisis and Change", "CISO Masterclass", "Cyber", "CISO and Board Leadership Academy", "cyber-crisis leadership, organizational change, resilience, and recovery"],
  ["custom-ai-native-app-strategy", "Custom AI Native Application Strategy", "CISO Masterclass", "Technologies", "Obserra Technologies Academy", "AI-native product strategy, architecture choices, governance, and measurable value"],
  ["data-driven-risk-intelligence", "Data Driven Risk Intelligence for Leaders", "CISO Masterclass", "Intelligence", "CISO and Board Leadership Academy", "data-driven risk intelligence, confidence, decision quality, and outcome learning"],
];

function createModules(title: string, focus: string, level: CourseLevel): Course["modules"] {
  const minutes = level === "Foundation" ? [24, 26, 28, 30, 42] : level === "Professional" ? [38, 44, 48, 54, 86] : level === "Advanced" ? [60, 72, 78, 84, 126] : level === "Executive Intensive" ? [84, 96, 102, 114, 144] : [108, 120, 132, 144, 156];
  const phases = ["Decision context", "Evidence and risk", "Control and authority", "Scenario practice", "Action and improvement"];
  return phases.map((phase, index) => ({
    title: `${phase}: ${index === 0 ? title : focus}`,
    duration: `${minutes[index]} min`,
    format: index === 3 ? "Interactive scenario" : index === 4 ? "Applied decision workshop" : "Interactive lesson",
    description: `Original Obserra Academy instruction on ${focus}. Learners work through context, evidence, trade-offs, and an accountable next action.`,
  }));
}

function createCourse([id, title, level, department, track, focus]: CourseSpec): Course {
  return {
    id, title, level, department, track, price: prices[level], duration: durations[level], audience: audiences[department],
    description: `An original Obserra Academy ${level.toLowerCase()} course focused on ${focus}. It uses practical decision scenarios, knowledge checks, and accountable application—not third-party certification material.`,
    outcomes: [`Frame ${focus} in business context`, "Evaluate evidence and uncertainty before acting", "Apply policy, authority, and proportionate escalation", "Document a defensible next action"],
    modules: createModules(title, focus, level),
  };
}

const fallbackCourses: Course[] = specs.map(createCourse);

export const courses: Course[] = mergeStudioCourses(fallbackCourses);
