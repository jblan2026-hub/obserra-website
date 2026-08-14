import Image from "next/image";
import Link from "next/link";
import CinematicMedia from "./CinematicMedia";

type WebsiteCampaignAdsProps = {
  enabled: boolean;
};

const campaigns = [
  {
    id: "executive-intelligence",
    eyebrow: "EXECUTIVE INTELLIGENCE",
    title: "Turn fragmented signals into executive action.",
    copy: "Connect risk, evidence, controls, intelligence, and accountability through the Obserra Executive Intelligence Operating System.",
    href: "/eios",
    action: "Explore Obserra EIOS",
    poster: "/brand/visuals/obserra-eios.png",
    video: "/media/pollo/ads/obserra-eios-executive-intelligence-15s.mp4",
    alt: "Obserra EIOS executive intelligence visualization",
  },
  {
    id: "academy",
    eyebrow: "OBSERRA ACADEMY",
    title: "Build judgment for the decisions that matter now.",
    copy: "Professional learning in cybersecurity, AI governance, leadership, intelligence, resilience, and executive protection.",
    href: "/academy",
    action: "Browse Academy courses",
    poster: "/brand/visuals/obserra-academy.png",
    video: "/media/pollo/ads/obserra-academy-cinematic-learning-15s.mp4",
    alt: "Obserra Academy professional learning visualization",
  },
  {
    id: "protection-intelligence",
    eyebrow: "PROTECTION AND INTELLIGENCE",
    title: "See exposure before it becomes consequence.",
    copy: "Connect digital exposure, travel conditions, physical risk, protective intelligence, and executive decision support.",
    href: "/protection-intelligence",
    action: "Explore protection intelligence",
    poster: "/brand/visuals/obserra-protection-intelligence.png",
    video: "/media/pollo/ads/obserra-protection-intelligence-15s.mp4",
    alt: "Obserra protection and intelligence visualization",
  },
  {
    id: "cybersecurity",
    eyebrow: "CYBERSECURITY",
    title: "Translate technical exposure into defensible business action.",
    copy: "Executive cyber advisory, governance, resilience, incident leadership, and program transformation for high consequence organizations.",
    href: "/services/cybersecurity-consulting",
    action: "Explore cybersecurity advisory",
    poster: "/brand/visuals/obserra-cybersecurity.png",
    video: "/media/pollo/ads/obserra-cybersecurity-executive-risk-15s.mp4",
    alt: "Obserra cybersecurity executive risk visualization",
  },
] as const;

export default function WebsiteCampaignAds({ enabled }: WebsiteCampaignAdsProps) {
  return (
    <section className="mission-section mission-campaigns" aria-labelledby="campaigns-title">
      <div className="mission-heading">
        <div>
          <p className="obs-eyebrow">OBSERRA CAMPAIGNS</p>
          <h2 id="campaigns-title">Cinematic stories built around the decisions leaders face.</h2>
        </div>
        <p>
          Each campaign uses official Obserra branding, accessible playback controls, reduced motion fallbacks, and a direct path into the relevant service, platform, or learning experience.
        </p>
      </div>

      <div className="mission-campaigns__grid">
        {campaigns.map((campaign) => (
          <article className="mission-campaign" key={campaign.id} data-campaign-id={campaign.id}>
            <div className="mission-campaign__media">
              <CinematicMedia
                enabled={enabled}
                src={campaign.video}
                poster={campaign.poster}
                alt={campaign.alt}
                sizes="(max-width: 760px) 100vw, (max-width: 1180px) 50vw, 25vw"
              />
              <div className="mission-campaign__brand" aria-hidden="true">
                <Image src="/brand/obserra-logo.png" alt="" width={178} height={35} />
              </div>
            </div>
            <div className="mission-campaign__content">
              <p className="obs-eyebrow">{campaign.eyebrow}</p>
              <h3>{campaign.title}</h3>
              <p>{campaign.copy}</p>
              <Link href={campaign.href}>{campaign.action} →</Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
