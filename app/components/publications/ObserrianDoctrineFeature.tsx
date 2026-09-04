import Image from "next/image";
import Link from "next/link";
import { OBSERRIAN_DOCTRINE } from "../../../lib/publications";
import "./obserrian-doctrine.css";

export default function ObserrianDoctrineFeature({ context }: { context: "about" | "speaking" }) {
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
        <p className="doctrine-book__label">NEW BOOK</p>
        <h3 id={`doctrine-title-${context}`}>{OBSERRIAN_DOCTRINE.title}</h3>
        <p className="doctrine-book__subtitle">{OBSERRIAN_DOCTRINE.subtitle}</p>
        <p className="doctrine-book__hook">{OBSERRIAN_DOCTRINE.hook}</p>
        {OBSERRIAN_DOCTRINE.overview.map((paragraph) => <p className="doctrine-book__description" key={paragraph}>{paragraph}</p>)}
        <div className="doctrine-book__outcomes">
          <strong>What you&apos;ll learn</strong>
          <ul>{OBSERRIAN_DOCTRINE.readerOutcomes.map((outcome) => <li key={outcome}>{outcome}</li>)}</ul>
        </div>
        <p className="doctrine-book__description">{OBSERRIAN_DOCTRINE.digitalTwinDescription}</p>
        <p className="doctrine-book__description">{OBSERRIAN_DOCTRINE.futureStatement}</p>
        <p className="doctrine-book__closing">{OBSERRIAN_DOCTRINE.accountabilityStatement}</p>
        <dl className="doctrine-book__details">
          <div><dt>Author</dt><dd>{OBSERRIAN_DOCTRINE.author}</dd></div>
          <div><dt>ISBN</dt><dd>{OBSERRIAN_DOCTRINE.isbn}</dd></div>
        </dl>
        <div className="doctrine-book__actions">
          <a href={OBSERRIAN_DOCTRINE.amazonUrl} target="_blank" rel="noopener noreferrer" aria-label="Buy The Obserrian Doctrine on Amazon (opens in a new tab)">Buy on Amazon</a>
          {context === "speaking" ? <Link href="/contact?interest=speaking">Invite Dr. Blanchard to speak</Link> : null}
        </div>
      </div>
    </article>
  );
}
