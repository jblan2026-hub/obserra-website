import Image from "next/image";
import Link from "next/link";
import { OBSERRIAN_DOCTRINE } from "../../../lib/publications";
import "./obserrian-doctrine.css";

export default function ObserrianDoctrineFeature({ context }: { context: "about" | "speaking" }) {
  const supportingCopy = context === "speaking"
    ? "A leadership framework for executives responsible for trust, governance, accountability, and institutional consequence—extending the conversation from the stage to the decisions that follow."
    : "An executive leadership title centered on stewardship and institutional trust, with themes of bias mitigation, accountability and governance, and ethical communication and transparency.";

  return (
    <article className="doctrine-book" aria-labelledby={`doctrine-title-${context}`}>
      <div className="doctrine-book__cover-crop">
        <Image
          className="doctrine-book__cover"
          src={OBSERRIAN_DOCTRINE.coverPath}
          width={OBSERRIAN_DOCTRINE.coverWidth}
          height={OBSERRIAN_DOCTRINE.coverHeight}
          sizes="(max-width: 720px) 72vw, 330px"
          alt={OBSERRIAN_DOCTRINE.coverAlt}
        />
      </div>
      <div className="doctrine-book__copy">
        <p className="doctrine-book__label">NEW BOOK · EXECUTIVE STEWARDSHIP</p>
        <h3 id={`doctrine-title-${context}`}>{OBSERRIAN_DOCTRINE.title}</h3>
        <p className="doctrine-book__subtitle">{OBSERRIAN_DOCTRINE.subtitle}</p>
        <p className="doctrine-book__description">{supportingCopy}</p>
        <dl className="doctrine-book__details">
          <div><dt>Author</dt><dd>{OBSERRIAN_DOCTRINE.author}</dd></div>
          <div><dt>ISBN</dt><dd>{OBSERRIAN_DOCTRINE.isbn}</dd></div>
        </dl>
        <div className="doctrine-book__actions">
          <a href={OBSERRIAN_DOCTRINE.amazonUrl} target="_blank" rel="noopener noreferrer" aria-label="View The Obserrian Doctrine on Amazon (opens in a new tab)">View The Obserrian Doctrine on Amazon <span aria-hidden="true">↗</span></a>
          {context === "speaking" ? <Link href="/contact?interest=speaking">Request a leadership engagement</Link> : null}
        </div>
      </div>
    </article>
  );
}
