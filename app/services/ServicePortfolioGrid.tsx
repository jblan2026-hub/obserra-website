import ExecutiveInfoModal from "../components/ui/ExecutiveInfoModal";
import { serviceCatalog } from "./serviceCatalog";

export default function ServicePortfolioGrid() {
  return (
    <section className="services-executive-portfolio" id="service-lines" aria-labelledby="services-portfolio-heading">
      <div className="services-executive-heading">
        <p className="apps-eyebrow">ENTERPRISE SERVICES</p>
        <h2 id="services-portfolio-heading">Choose the capability. Open the detail only when you need it.</h2>
        <p>Every engagement is aligned to business outcomes, accountable ownership, evidence, and a clear path to action.</p>
      </div>
      <div className="services-executive-grid">
        {serviceCatalog.map((service, index) => (
          <article className="services-executive-card" key={service.id}>
            <ExecutiveInfoModal
              number={String(index + 1).padStart(2, "0")}
              title={service.title}
              summary={service.summary}
              description={service.detail}
              details={service.outcomes.slice(0, 3)}
              href={`/services/${service.id}`}
              linkLabel={`Explore ${service.title}`}
            />
          </article>
        ))}
      </div>
    </section>
  );
}
