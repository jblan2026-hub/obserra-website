"use client";

import Image from "next/image";
import Link from "next/link";
import CinematicMedia from "../components/marketing/CinematicMedia";

type AcademyCinematicCampaignsProps = {
  enabled: boolean;
};

const academyCampaigns = [
  {
    id: "cybersecurity-foundations",
    eyebrow: "CYBERSECURITY FOUNDATIONS",
    title: "Build the judgment behind secure decisions.",
    copy: "Follow the controlled canary build for new professionals learning evidence, identity, risk, escalation, and accountable action.",
    href: "/academy/cybersecurity-foundations",
    action: "View canary build",
    poster: "/brand/visuals/obserra-cybersecurity.png",
    video: "/media/pollo/academy/obserra-academy-cybersecurity-foundations-15s.mp4",
    alt: "Obserra Academy cybersecurity learning visualization",
  },
  {
    id: "ai-governance",
    eyebrow: "AI GOVERNANCE",
    title: "Govern intelligent systems before risk scales.",
    copy: "Explore the planned leadership pathway for AI ethics, policy, oversight, evidence, privacy, and responsible enterprise adoption.",
    href: "/academy/ai-risk-ethics-governance",
    action: "View AI course roadmap",
    poster: "/brand/visuals/obserra-eios-intelligence-hero.png",
    video: "/media/pollo/academy/obserra-academy-ai-governance-leadership-15s.mp4",
    alt: "Obserra Academy AI governance learning visualization",
  },
  {
    id: "ciso-board-leadership",
    eyebrow: "CISO AND BOARD LEADERSHIP",
    title: "Translate technical risk into executive action.",
    copy: "Develop board communication, executive judgment, crisis leadership, program strategy, and defensible investment decisions.",
    href: "/academy/board-communication-cybersecurity",
    action: "View leadership roadmap",
    poster: "/brand/visuals/obserra-core.png",
    video: "/media/pollo/academy/obserra-academy-ciso-board-leadership-15s.mp4",
    alt: "Obserra Academy CISO and board leadership visualization",
  },
  {
    id: "executive-protection-intelligence",
    eyebrow: "PROTECTION AND INTELLIGENCE",
    title: "Prepare leaders for physical and digital exposure.",
    copy: "Explore planned learning in protective intelligence, executive travel risk, situational awareness, resilience, and coordinated response.",
    href: "/academy/executive-protection-fundamentals",
    action: "View protection roadmap",
    poster: "/brand/visuals/obserra-protection-intelligence.png",
    video: "/media/pollo/academy/obserra-academy-executive-protection-intelligence-15s.mp4",
    alt: "Obserra Academy protection and intelligence learning visualization",
  },
] as const;

export default function AcademyCinematicCampaigns({ enabled }: AcademyCinematicCampaignsProps) {
  return (
    <section
      className="academy-cinematic"
      aria-labelledby="academy-cinematic-title"
      data-security-boundary="public-static-media-only"
    >
      <div className="academy-cinematic__hero">
        <div className="academy-cinematic__hero-copy">
          <p className="kicker">CINEMATIC LEARNING DIRECTION</p>
          <h2 id="academy-cinematic-title">Professional education built around real decisions, not robotic presentation.</h2>
          <p>
            Obserra Academy combines authorized instructor presence, realistic enterprise scenarios, evidence-based
            instruction, practical exercises, assessment, and controlled LearnWorlds delivery. Course availability
            remains governed by content, accessibility, commerce, certificate, and owner-approval gates.
          </p>
          <div className="academy-cinematic__assurance" aria-label="Academy media security boundary">
            <span>Static public media only</span>
            <span>No database access</span>
            <span>No external embeds</span>
            <span>Owner approved activation</span>
          </div>
        </div>
        <div className="academy-cinematic__hero-media">
          <CinematicMedia
            enabled={enabled}
            src="/media/pollo/academy/obserra-academy-learning-hero-loop-12s.mp4"
            poster="/brand/visuals/obserra-academy.png"
            alt="Obserra Academy cinematic professional learning visualization"
            sizes="(max-width: 900px) 100vw, 46vw"
          />
          <div className="academy-cinematic__brand" aria-hidden="true">
            <Image src="/brand/obserra-logo.png" alt="" width={190} height={37} />
            <span>ACADEMY</span>
          </div>
        </div>
      </div>

      <div className="academy-cinematic__grid">
        {academyCampaigns.map((campaign) => (
          <article className="academy-cinematic-card" key={campaign.id} data-campaign-id={campaign.id}>
            <div className="academy-cinematic-card__media">
              <CinematicMedia
                enabled={enabled}
                src={campaign.video}
                poster={campaign.poster}
                alt={campaign.alt}
                sizes="(max-width: 720px) 100vw, (max-width: 1180px) 50vw, 25vw"
              />
              <div className="academy-cinematic-card__logo" aria-hidden="true">
                <Image src="/brand/obserra-logo.png" alt="" width={154} height={30} />
              </div>
            </div>
            <div className="academy-cinematic-card__content">
              <p className="kicker">{campaign.eyebrow}</p>
              <h3>{campaign.title}</h3>
              <p>{campaign.copy}</p>
              <Link href={campaign.href}>{campaign.action} →</Link>
            </div>
          </article>
        ))}
      </div>

      <p className="academy-cinematic__security-note">
        These media elements load only versioned public files from the Obserra website. They do not query, write,
        expose, or connect to the learner, commerce, identity, assessment, certificate, or application databases.
      </p>
    </section>
  );
}
