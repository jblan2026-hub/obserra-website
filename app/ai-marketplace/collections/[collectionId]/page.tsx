import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { marketplaceV12PurchaseOptions } from "../../../../lib/marketplace-v12-bindings";
import { marketplaceV12CollectionMembers, marketplaceV12Product, marketplaceV12PublicPath } from "../../../../lib/marketplace-v12-catalog";
import MarketplaceV12Checkout, { type MarketplacePublicCheckoutOption } from "../../MarketplaceV12Checkout";
import styles from "./collection.module.css";
import "../../marketplace.css";

type SearchValue = string | string[] | undefined;
type SearchParams = { cursor?: SearchValue; q?: SearchValue; category?: SearchValue; level?: SearchValue; cadence?: SearchValue; type?: SearchValue };
type Props = { params: Promise<{ collectionId: string }>; searchParams: Promise<SearchParams> };
type MemberPage = NonNullable<ReturnType<typeof marketplaceV12CollectionMembers>>;
type Member = MemberPage["results"][number];
type FilterState = { q: string; category: string; level: string; cadence: string; type: string; cursor: number };

const PAGE_SIZE = 30;
const LEVELS = ["Beginner", "Intermediate", "Expert", "Advanced"] as const;

function first(value: SearchValue, max = 120) {
  const selected = Array.isArray(value) ? value[0] : value;
  return selected?.trim().slice(0, max) ?? "";
}

function cursorValue(value: SearchValue) {
  const cursor = first(value, 6);
  return /^\d{1,6}$/.test(cursor) ? Number(cursor) : 0;
}

function plain(value: string | undefined) {
  return value ? value.replace(/[-_]/g, " ") : "General";
}

function offeringLabel(value: string) {
  if (value === "ai-skill") return "AI skill";
  if (value === "agent-team") return "Agent team";
  if (value === "workflow-pack") return "Workflow pack";
  if (value === "industry-edition") return "Industry edition";
  if (value === "marketplace-tool") return "Marketplace tool";
  if (value === "collection" || value === "bundle") return "Capability package";
  return plain(value);
}

function buyerText(value: string | null | undefined, fallback: string) {
  const copy = value?.trim();
  if (!copy || /\b(?:artifact|checksum|file ?name|manifest|sha(?:256)?|hash|verification|verified|validation|catalog record|execution evidence)\b/i.test(copy) || /\.(?:json|ya?ml|zip|tar|gz|md|txt|csv)\b/i.test(copy)) return fallback;
  return copy;
}

function labelCadence(value: string) {
  if (value === "quote") return "Custom quote";
  if (value === "one-time") return "One-time";
  return value === "month" ? "Monthly" : value === "year" ? "Annual" : plain(value);
}

function money(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: amount % 100 === 0 ? 0 : 2 }).format(amount / 100);
}

function priceOffers(member: Member) {
  if (member.pricing.model === "quote" || member.pricing.model === "enterprise_quote" || member.pricing.offers.length === 0) return ["Custom quote"];
  return member.pricing.offers.map((offer) => {
    const cadence = offer.cadence && offer.cadence !== "one-time" ? ` / ${offer.cadence === "month" ? "mo" : offer.cadence === "year" ? "yr" : plain(offer.cadence)}` : " one-time";
    return `${money(offer.amount_minor, offer.currency)}${cadence}`;
  });
}

function memberPurchaseOptions(member: Member): MarketplacePublicCheckoutOption[] {
  const product = marketplaceV12Product(member.product_id);
  if (!product || product.product_type === "collection" || product.product_type === "bundle") return [];
  return marketplaceV12PurchaseOptions(product).map((option) => ({ option: option.option, amountMinor: option.amountMinor }));
}

function memberCadences(member: Member) {
  if (member.pricing.model === "quote" || member.pricing.model === "enterprise_quote" || member.pricing.offers.length === 0) return new Set(["quote"]);
  return new Set(member.pricing.offers.map((offer) => !offer.cadence || offer.cadence === "one-time" ? "one-time" : offer.cadence));
}

function countBy(items: Member[], value: (member: Member) => string | undefined) {
  const counts = new Map<string, number>();
  for (const item of items) {
    const key = value(item);
    if (key) counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return [...counts].sort(([leftName, leftCount], [rightName, rightCount]) => rightCount - leftCount || leftName.localeCompare(rightName));
}

function cadenceCounts(items: Member[]) {
  const counts = new Map<string, number>();
  for (const item of items) for (const cadence of memberCadences(item)) counts.set(cadence, (counts.get(cadence) ?? 0) + 1);
  return [...counts].sort(([left], [right]) => left.localeCompare(right));
}

function allMembers(collectionId: string) {
  const members: Member[] = [];
  let cursor: string | undefined;
  let expected = -1;
  for (let pageNumber = 0; pageNumber < 200; pageNumber += 1) {
    const page = marketplaceV12CollectionMembers(collectionId, { cursor, limit: 60 });
    if (!page || "error" in page) return null;
    expected = page.total;
    members.push(...page.results);
    if (!page.nextCursor) break;
    cursor = page.nextCursor;
  }
  if (expected < 0 || members.length !== expected || new Set(members.map((member) => member.product_id)).size !== members.length) throw new Error("Marketplace collection membership could not be bounded exactly.");
  return members;
}

function href(path: string, state: FilterState, changes: Partial<FilterState>) {
  const next = { ...state, ...changes };
  const query = new URLSearchParams();
  if (next.q) query.set("q", next.q);
  if (next.category) query.set("category", next.category);
  if (next.level) query.set("level", next.level);
  if (next.cadence) query.set("cadence", next.cadence);
  if (next.type) query.set("type", next.type);
  if (next.cursor > 0) query.set("cursor", String(next.cursor));
  return `${path}${query.size ? `?${query}` : ""}`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const collection = marketplaceV12Product((await params).collectionId);
  if (!collection || (collection.product_type !== "collection" && collection.product_type !== "bundle")) return {};
  const path = marketplaceV12PublicPath(collection);
  const description = buyerText(collection.description, `Explore the individual capabilities included in ${collection.name}.`);
  return { title: `${collection.name} | Obserra EPI AI Marketplace`, description, alternates: { canonical: path }, robots: { index: true, follow: true }, openGraph: { title: collection.name, description, url: path, type: "website" } };
}

export default async function MarketplaceCollectionPage({ params, searchParams }: Props) {
  const collectionId = (await params).collectionId;
  const requested = await searchParams;
  const collection = marketplaceV12Product(collectionId);
  if (!collection || (collection.product_type !== "collection" && collection.product_type !== "bundle")) notFound();
  const members = allMembers(collection.product_id);
  if (!members) notFound();
  const path = marketplaceV12PublicPath(collection);
  const availableCategories = new Set(members.flatMap((member) => member.category ? [member.category] : []));
  const availableTypes = new Set(members.map((member) => member.product_type));
  const availableCadences = new Set(members.flatMap((member) => [...memberCadences(member)]));
  const requestedLevel = first(requested.level, 32);
  const state: FilterState = {
    q: first(requested.q),
    category: availableCategories.has(first(requested.category)) ? first(requested.category) : "",
    level: LEVELS.includes(requestedLevel as typeof LEVELS[number]) ? requestedLevel : "",
    cadence: availableCadences.has(first(requested.cadence, 32)) ? first(requested.cadence, 32) : "",
    type: availableTypes.has(first(requested.type, 80)) ? first(requested.type, 80) : "",
    cursor: cursorValue(requested.cursor),
  };
  const needle = state.q.toLocaleLowerCase();
  const filtered = members.filter((member) => {
    if (state.category && member.category !== state.category) return false;
    if (state.level && member.proficiency !== state.level) return false;
    if (state.type && member.product_type !== state.type) return false;
    if (state.cadence && !memberCadences(member).has(state.cadence)) return false;
    return !needle || `${member.name} ${member.description} ${member.mission ?? ""} ${member.family} ${member.category ?? ""} ${member.proficiency ?? ""} ${member.product_type}`.toLocaleLowerCase().includes(needle);
  });
  const offset = state.cursor < filtered.length ? state.cursor : 0;
  const results = filtered.slice(offset, offset + PAGE_SIZE);
  const categoryFacets = countBy(members, (member) => member.category || member.family);
  const levelFacets = LEVELS.map((level) => [level, members.filter((member) => member.proficiency === level).length] as const).filter(([, count]) => count > 0);
  const typeFacets = countBy(members, (member) => member.product_type);
  const cadenceFacets = cadenceCounts(members);
  const activeFilterCount = [state.q, state.category, state.level, state.cadence, state.type].filter(Boolean).length;
  const collectionDescription = buyerText(collection.description, `Explore ${members.length.toLocaleString()} individual capabilities included in ${collection.name}.`);
  const structuredData = [{ "@context": "https://schema.org", "@type": "CollectionPage", "@id": `https://www.obserrallc.com${path}#collection`, url: `https://www.obserrallc.com${path}`, name: collection.name, description: collectionDescription, isPartOf: { "@id": "https://www.obserrallc.com/ai-marketplace#catalog" }, mainEntity: { "@type": "ItemList", numberOfItems: filtered.length, itemListElement: results.map((entry, index) => ({ "@type": "ListItem", position: offset + index + 1, name: entry.name, url: `https://www.obserrallc.com${marketplaceV12PublicPath(entry)}` })) } }, { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "AI Marketplace", item: "https://www.obserrallc.com/ai-marketplace" }, { "@type": "ListItem", position: 2, name: collection.name, item: `https://www.obserrallc.com${path}` }] }];

  return <main className="ai-marketplace ai-marketplace--detail">
    <header className="ai-marketplace__nav"><Link href="/ai-marketplace">OBSERRA EPI</Link><nav aria-label="Marketplace navigation"><Link href="/ai-marketplace">Marketplace</Link><Link href="/ai-marketplace/compare">Compare</Link><Link href="/ai-marketplace/configure">Build a bundle</Link><Link href="/ai-marketplace/hangar">My products</Link></nav></header>
    <section className={styles.packageHeader} aria-labelledby="package-title">
      <nav aria-label="Breadcrumb"><Link href="/ai-marketplace">AI Marketplace</Link><span aria-hidden="true">/</span><span>Capability package</span></nav>
      <div><p>{collection.family}</p><h1 id="package-title">{collection.name}</h1><span>{collectionDescription}</span></div>
      <dl><div><dt>Included offerings</dt><dd>{members.length.toLocaleString()}</dd></div><div><dt>Experience levels</dt><dd>{levelFacets.map(([level]) => level).join(" · ") || "All levels"}</dd></div><div><dt>Ways to buy</dt><dd>{cadenceFacets.map(([cadence]) => labelCadence(cadence)).join(" · ")}</dd></div></dl>
    </section>
    <section className={styles.storefront} aria-labelledby="package-products-title">
      <aside className={styles.sidebar} aria-label="Package categories">
        <div><p>Package contents</p><h2>Browse categories</h2></div>
        <nav><Link aria-current={!state.category ? "page" : undefined} href={href(path, state, { category: "", cursor: 0 })}><span>All offerings</span><strong>{members.length.toLocaleString()}</strong></Link>{categoryFacets.map(([category, count]) => <Link aria-current={state.category === category ? "page" : undefined} key={category} href={href(path, state, { category, cursor: 0 })}><span>{category}</span><strong>{count.toLocaleString()}</strong></Link>)}</nav>
      </aside>
      <div className={styles.directory}>
        <form className={styles.filters} action={path} method="get" role="search">
          <label className={styles.search}><span>Search inside this package</span><input type="search" name="q" defaultValue={state.q} placeholder="Search names, outcomes, or categories"/></label>
          {state.category ? <input type="hidden" name="category" value={state.category}/> : null}
          <label><span>Level</span><select name="level" defaultValue={state.level}><option value="">All levels</option>{levelFacets.map(([level, count]) => <option value={level} key={level}>{level} ({count.toLocaleString()})</option>)}</select></label>
          <label><span>Purchase type</span><select name="cadence" defaultValue={state.cadence}><option value="">All purchase types</option>{cadenceFacets.map(([cadence, count]) => <option value={cadence} key={cadence}>{labelCadence(cadence)} ({count.toLocaleString()})</option>)}</select></label>
          <label><span>Offering type</span><select name="type" defaultValue={state.type}><option value="">All offering types</option>{typeFacets.map(([type, count]) => <option value={type} key={type}>{offeringLabel(type)} ({count.toLocaleString()})</option>)}</select></label>
          <button type="submit">Show matching offerings</button>
          {activeFilterCount > 0 ? <Link href={path}>Clear {activeFilterCount} filter{activeFilterCount === 1 ? "" : "s"}</Link> : null}
        </form>
        <header className={styles.resultsHeader}><div><p>Individual products and skills</p><h2 id="package-products-title">{filtered.length.toLocaleString()} matching offering{filtered.length === 1 ? "" : "s"}</h2></div><span>{filtered.length ? `Showing ${offset + 1}–${offset + results.length}` : "Change or clear a filter to continue."}</span></header>
        {results.length ? <ol className={styles.results} start={offset + 1}>{results.map((member) => {
          const offers = priceOffers(member);
          const purchaseOptions = memberPurchaseOptions(member);
          const outcome = buyerText(member.mission || member.description, `${member.name} helps move ${member.category || member.family} work from a clear request to a usable outcome.`);
          return <li key={member.product_id}><article><div className={styles.cardTop}><div className={styles.tags}>{member.proficiency ? <span>{member.proficiency}</span> : null}<span>{member.category || member.family}</span><span>{offeringLabel(member.product_type)}</span></div><div className={styles.price}>{offers.map((offer) => <strong key={offer}>{offer}</strong>)}</div></div><h3><Link href={marketplaceV12PublicPath(member)}>{member.name}</Link></h3><p>{outcome}</p><MarketplaceV12Checkout productId={member.product_id} options={purchaseOptions} compact /><footer><span>Buy here or inspect full details</span><Link href={marketplaceV12PublicPath(member)}>View product details <b aria-hidden="true">→</b></Link></footer></article></li>;
        })}</ol> : <div className={styles.empty}><h3>No offerings match those filters.</h3><p>Clear one or more filters to see the individual products and skills included in this package.</p><Link href={path}>View all package offerings</Link></div>}
        <nav className={styles.pagination} aria-label="Package result pages">{offset > 0 ? <Link href={href(path, state, { cursor: Math.max(0, offset - PAGE_SIZE) })}>Previous {PAGE_SIZE}</Link> : <span aria-disabled="true">Previous</span>}<strong>{filtered.length ? `${offset + 1}–${offset + results.length} of ${filtered.length.toLocaleString()}` : "0 results"}</strong>{offset + results.length < filtered.length ? <Link href={href(path, state, { cursor: offset + PAGE_SIZE })}>Next {Math.min(PAGE_SIZE, filtered.length - offset - results.length)}</Link> : <span aria-disabled="true">Next</span>}</nav>
      </div>
    </section>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
  </main>;
}
