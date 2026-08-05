"use client";

import { useEffect, useMemo, useState } from "react";
import { track } from "@vercel/analytics";
import Image from "next/image";
import { courses, type CourseLevel, type Department } from "./courseData";

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const departments: (Department | "All")[] = ["All", "Cyber", "Protection", "Intelligence", "Technologies"];
const departmentLabels: Record<Department | "All", string> = {
  All: "All courses",
  Cyber: "Cybersecurity",
  Protection: "Travel and Executive Safety",
  Intelligence: "Intelligence and Leadership",
  Technologies: "AI and Technology",
};
const collections = [
  { key: "All", label: "All levels", matcher: (_level: CourseLevel) => true },
  { key: "Starter", label: "Starter", matcher: (level: CourseLevel) => level === "Foundation" },
  { key: "Career", label: "Career growth", matcher: (level: CourseLevel) => level === "Professional" || level === "Advanced" },
  { key: "Executive", label: "Executive", matcher: (level: CourseLevel) => level === "Executive Intensive" || level === "CISO Masterclass" },
] as const;
type Collection = (typeof collections)[number]["key"];
type SortMode = "recommended" | "price-low" | "price-high" | "title";

const featuredIds = ["zero-trust-strategy", "executive-threat-assessment", "secure-enterprise-llm-deployment", "incident-response-leadership", "ciso-leadership-playbook"] as const;
const panel = "rounded-2xl border border-sky-300/20 bg-[linear-gradient(145deg,rgba(13,47,77,.96),rgba(5,25,43,.98))] shadow-[0_20px_50px_rgba(0,0,0,.24)]";
const goldButton = "inline-flex min-h-11 items-center justify-center rounded-full bg-[#f2bd5a] px-5 py-3 text-sm font-black text-[#082038] transition hover:bg-[#ffd17a] focus:outline-none focus:ring-2 focus:ring-[#f2bd5a] focus:ring-offset-2 focus:ring-offset-[#06182a]";
const outlineButton = "inline-flex min-h-11 items-center justify-center rounded-full border border-sky-300/30 px-5 py-3 text-sm font-black text-sky-50 transition hover:border-[#f2bd5a]/70 hover:text-[#f2bd5a] focus:outline-none focus:ring-2 focus:ring-[#f2bd5a] focus:ring-offset-2 focus:ring-offset-[#06182a]";

function levelTag(level: CourseLevel) {
  if (level === "Foundation") return "Starter";
  if (level === "Professional") return "Professional";
  if (level === "Advanced") return "Advanced";
  return "Executive";
}

export default function AcademyClient() {
  const [department, setDepartment] = useState<Department | "All">("All");
  const [collection, setCollection] = useState<Collection>("All");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortMode>("recommended");
  const [visibleCount, setVisibleCount] = useState(12);
  const [featuredIndex, setFeaturedIndex] = useState(0);

  const flagshipCourses = useMemo(() => courses.filter((course) => featuredIds.includes(course.id as typeof featuredIds[number])), []);
  const featuredCourse = flagshipCourses[featuredIndex % flagshipCourses.length];
  const selectedCollection = collections.find((item) => item.key === collection)!;

  useEffect(() => {
    if (flagshipCourses.length < 2) return;
    const timer = window.setInterval(() => setFeaturedIndex((current) => (current + 1) % flagshipCourses.length), 5200);
    return () => window.clearInterval(timer);
  }, [flagshipCourses.length]);

  useEffect(() => setVisibleCount(12), [department, collection, query, sort]);

  const filteredCourses = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const result = courses.filter((course) => department === "All" || course.department === department)
      .filter((course) => selectedCollection.matcher(course.level))
      .filter((course) => !normalized || [course.title, course.description, course.track, course.department, course.audience, ...course.outcomes].join(" ").toLowerCase().includes(normalized));

    return [...result].sort((a, b) => {
      if (sort === "price-low") return a.price - b.price;
      if (sort === "price-high") return b.price - a.price;
      if (sort === "title") return a.title.localeCompare(b.title);
      const aFeatured = featuredIds.includes(a.id as typeof featuredIds[number]) ? 1 : 0;
      const bFeatured = featuredIds.includes(b.id as typeof featuredIds[number]) ? 1 : 0;
      return bFeatured - aFeatured || a.price - b.price || a.title.localeCompare(b.title);
    });
  }, [collection, department, query, selectedCollection, sort]);

  const visibleCourses = filteredCourses.slice(0, visibleCount);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_85%_5%,rgba(29,104,151,.24),transparent_30%),linear-gradient(180deg,#03101d,#071a2b_48%,#04111e)] font-sans text-[#edf7ff]">
      <header className="sticky top-0 z-30 flex flex-col gap-4 border-b border-sky-300/20 bg-[#03101d]/95 px-5 py-4 backdrop-blur-xl md:flex-row md:items-center md:justify-between md:px-[max(5vw,24px)]">
        <a href="/" className="flex items-center gap-3 text-xs font-black tracking-[.14em] text-white" aria-label="Obserra home"><Image className="h-auto w-[210px] md:w-[260px]" src="/brand/obserra-logo.png" alt="Obserra Executive Protection and Intelligence LLC" width={286} height={55} /><span>ACADEMY</span></a>
        <div className="grid grid-cols-2 gap-2 md:flex md:flex-wrap md:items-center md:gap-4">{[["Services", "/services"], ["Applications", "/apps"], ["Contact", "/contact"], ["Enterprise training", "/contact?interest=enterprise-training"]].map(([label, href]) => <a key={href} href={href} className="rounded-lg border border-sky-300/20 px-3 py-2 text-center text-xs font-extrabold text-sky-50 transition hover:border-[#f2bd5a]/60 hover:text-[#f2bd5a] md:border-0 md:p-0">{label}</a>)}</div>
      </header>

      <section className="mx-auto max-w-[1500px] px-5 pb-14 pt-16 md:px-[max(5vw,24px)] md:pb-20 md:pt-24">
        <p className="mb-4 text-xs font-black tracking-[.18em] text-[#f2bd5a]">OBSERRA ACADEMY</p>
        <h1 className="max-w-6xl text-[clamp(2.6rem,6vw,5.5rem)] font-black leading-[.96] tracking-[-.055em]">Professional training for high consequence cybersecurity, intelligence, protection, and AI decisions.</h1>
        <p className="mt-6 max-w-4xl text-base leading-8 text-[#bad4e3] md:text-lg">Choose a course, create your secure learner account, complete payment through Stripe, and begin immediately. Access, progress, assessment results, and certificates remain tied to your account.</p>
        <div className="mt-8 flex max-w-4xl flex-col gap-2 rounded-2xl border border-[#f2bd5a]/30 bg-[#0a2c48]/80 p-5 sm:flex-row sm:items-center sm:gap-5"><strong className="text-[#f2bd5a]">Completion standard</strong><span className="text-sm leading-6 text-[#c7dce8]">Complete every lesson and earn 80 percent or higher on the final assessment to receive an Obserra Certificate of Training.</span></div>
      </section>

      <section className="grid gap-4 px-5 pb-20 md:grid-cols-2 md:px-[max(5vw,24px)] xl:grid-cols-4" aria-label="Academy purchase and completion journey">
        {[['01','Select','Compare outcomes, duration, level, and price.'],['02','Enroll securely','Sign in and complete Stripe checkout.'],['03','Learn','Receive account based access and saved progress.'],['04','Certify','Pass the assessment and generate your certificate.']].map(([step,title,copy], index) => <article key={step} className={`${panel} min-h-[210px] border-t-[3px] p-6 ${index % 2 ? 'border-t-sky-300' : 'border-t-[#f2bd5a]'}`}><span className="mb-7 block text-xs font-black tracking-[.16em] text-[#f2bd5a]">{step}</span><h2 className="text-2xl font-black tracking-tight">{title}</h2><p className="mt-3 text-sm leading-7 text-[#a9c4d5]">{copy}</p></article>)}
      </section>

      <section className="border-y border-sky-300/15 bg-[#06182a] px-5 py-16 md:px-[max(5vw,24px)]" aria-label="Featured courses">
        <div className="mx-auto grid max-w-[1500px] gap-8 xl:grid-cols-[.8fr_1.2fr]">
          <div><p className="text-xs font-black tracking-[.18em] text-[#f2bd5a]">FEATURED COURSES</p><h2 className="mt-3 text-[clamp(2rem,4vw,3.6rem)] font-black leading-none tracking-[-.04em]">Start with training built for decisions leaders face now.</h2><p className="mt-5 max-w-2xl leading-7 text-[#bad4e3]">Premium learning across cybersecurity, executive protection, incident leadership, AI governance, and enterprise technology.</p><div className="mt-7 flex flex-wrap gap-2">{flagshipCourses.map((course, index) => <button key={course.id} type="button" className={`rounded-full border px-4 py-2 text-left text-xs font-bold transition ${index === featuredIndex ? 'border-[#f2bd5a] bg-[#f2bd5a] text-[#082038]' : 'border-sky-300/25 text-sky-100 hover:border-[#f2bd5a]/60'}`} onClick={() => setFeaturedIndex(index)}>{course.title}</button>)}</div></div>
          <article key={featuredCourse.id} className={`${panel} p-7 md:p-9`} aria-live="polite"><span className="text-xs font-black tracking-[.13em] text-[#f2bd5a]">{featuredCourse.department} · {levelTag(featuredCourse.level)}</span><h3 className="mt-4 text-3xl font-black tracking-tight md:text-4xl">{featuredCourse.title}</h3><p className="mt-4 text-base leading-8 text-[#c6dce8]">{featuredCourse.description}</p><div className="mt-6 flex items-baseline gap-2"><b className="text-3xl text-[#f2bd5a]">{money.format(featuredCourse.price)}</b><em className="not-italic text-[#9fbfce]">· {featuredCourse.duration}</em></div><div className="mt-6 grid gap-2">{featuredCourse.outcomes.slice(0, 3).map((item) => <span key={item} className="rounded-xl bg-[#031525]/70 px-4 py-3 text-sm text-[#d4e7f1]">{item}</span>)}</div><div className="mt-7 flex flex-wrap gap-3"><a className={outlineButton} href={`/academy/${featuredCourse.id}`}>Preview course</a><a className={goldButton} href={`/api/academy/checkout?course=${featuredCourse.id}`} onClick={() => track("academy_checkout_started", { course: featuredCourse.id, source: "featured" })}>Enroll securely</a></div></article>
        </div>
      </section>

      <section className="mx-auto max-w-[1500px] px-5 py-16 md:px-[max(5vw,24px)]" id="courses">
        <div className="grid gap-5 lg:grid-cols-[1fr_.55fr] lg:items-end"><div><p className="text-xs font-black tracking-[.18em] text-[#f2bd5a]">COURSE CATALOG</p><h2 className="mt-3 text-[clamp(2rem,4vw,3.6rem)] font-black leading-none tracking-[-.04em]">Find the right course without scrolling through the entire catalog.</h2></div><p className="text-base leading-7 text-[#bad4e3]">{courses.length} paid courses with secure checkout, saved progress, assessments, and certificates.</p></div>

        <div className="my-7 grid gap-4 md:grid-cols-[1fr_250px]">
          <label className="grid gap-2 text-xs font-black uppercase tracking-[.1em] text-[#d8e9f4]"><span>Search courses</span><input className="min-h-12 w-full rounded-xl border border-sky-300/25 bg-[#041829]/90 px-4 text-base font-normal normal-case tracking-normal text-white outline-none placeholder:text-slate-500 focus:border-[#f2bd5a] focus:ring-2 focus:ring-[#f2bd5a]/30" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search AI governance, CISO, incident response..." type="search" /></label>
          <label className="grid gap-2 text-xs font-black uppercase tracking-[.1em] text-[#d8e9f4]"><span>Sort</span><select className="min-h-12 w-full rounded-xl border border-sky-300/25 bg-[#041829]/90 px-4 text-base font-normal normal-case tracking-normal text-white outline-none focus:border-[#f2bd5a] focus:ring-2 focus:ring-[#f2bd5a]/30" value={sort} onChange={(event) => setSort(event.target.value as SortMode)}><option value="recommended">Recommended</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option><option value="title">Title</option></select></label>
        </div>

        <nav className="flex gap-2 overflow-x-auto pb-2" aria-label="Browse Academy categories">{departments.map((item) => <button key={item} className={`flex shrink-0 items-center gap-3 rounded-full border px-4 py-2 text-sm font-extrabold ${department === item ? 'border-[#f2bd5a] bg-[#f2bd5a] text-[#082038]' : 'border-sky-300/25 text-sky-50 hover:border-[#f2bd5a]/60'}`} onClick={() => setDepartment(item)}><span>{departmentLabels[item]}</span><b>{item === "All" ? courses.length : courses.filter((course) => course.department === item).length}</b></button>)}</nav>
        <div className="mt-3 flex gap-2 overflow-x-auto pb-2" aria-label="Browse course levels">{collections.map((item) => <button key={item.key} className={`flex shrink-0 items-center gap-3 rounded-full border px-4 py-2 text-sm font-extrabold ${collection === item.key ? 'border-sky-300 bg-sky-300 text-[#082038]' : 'border-sky-300/25 text-sky-50 hover:border-sky-300/60'}`} onClick={() => setCollection(item.key)}><span>{item.label}</span><b>{courses.filter((course) => item.matcher(course.level)).length}</b></button>)}</div>
        <div className="my-6 flex flex-wrap items-end justify-between gap-3"><p className="text-xs font-black tracking-[.15em] text-[#f2bd5a]">{departmentLabels[department]} · {selectedCollection.label}</p><strong>{filteredCourses.length} course{filteredCourses.length === 1 ? "" : "s"} found</strong></div>

        {visibleCourses.length ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{visibleCourses.map((course) => <article key={course.id} className={`${panel} flex min-h-[420px] flex-col p-6`}><span className="text-xs font-black tracking-[.1em] text-[#f2bd5a]">{course.department}: {course.track}</span><h3 className="mt-4 text-2xl font-black tracking-tight">{course.title}</h3><p className="mt-3 leading-7 text-[#bcd4e1]">{course.description}</p><div className="mt-5 flex flex-wrap gap-2"><i className="rounded-full border border-[#f2bd5a]/30 px-3 py-1 text-xs not-italic text-[#f2bd5a]">{levelTag(course.level)}</i><i className="rounded-full border border-sky-300/25 px-3 py-1 text-xs not-italic text-sky-100">{course.level}</i></div><div className="mt-5 grid gap-2">{course.outcomes.slice(0, 2).map((item) => <span key={item} className="rounded-lg bg-[#031525]/70 px-3 py-2 text-sm text-[#d4e7f1]">{item}</span>)}</div><footer className="mt-auto flex items-baseline gap-2 pt-6"><b className="text-2xl text-[#f2bd5a]">{money.format(course.price)}</b><em className="not-italic text-[#9fbfce]">· {course.duration}</em></footer><div className="mt-5 flex flex-wrap gap-3"><a className={outlineButton} href={`/academy/${course.id}`}>View details</a><a className={goldButton} href={`/api/academy/checkout?course=${course.id}`} onClick={() => track("academy_checkout_started", { course: course.id, source: "catalog" })}>Enroll securely</a></div></article>)}</div> : <div className="my-6 rounded-2xl border border-dashed border-sky-300/35 bg-[#041829]/50 p-10 text-center"><h3 className="text-2xl font-black">No courses match those filters.</h3><p className="mt-2 text-[#bdd5e4]">Clear the search or select a broader category.</p><button className={`${goldButton} mt-5`} type="button" onClick={() => { setQuery(""); setDepartment("All"); setCollection("All"); }}>Reset catalog</button></div>}

        {visibleCount < filteredCourses.length && <div className="mt-8 flex flex-col items-center gap-3"><button className={goldButton} type="button" onClick={() => setVisibleCount((count) => count + 12)}>Show 12 more courses</button><span className="text-sm text-[#afcadc]">{visibleCourses.length} of {filteredCourses.length} shown</span></div>}
      </section>

      <section className="grid gap-5 px-5 py-16 md:grid-cols-2 md:px-[max(5vw,24px)]">{[["INDIVIDUAL LEARNERS","Build practical capability at your own pace.","Secure enrollment, immediate access, saved progress, assessments, and a verifiable completion record.","#courses","Browse courses"],["ENTERPRISE TEAMS","Train teams against a shared operating standard.","Request curated learning paths, cohort delivery, executive briefings, and organizational reporting.","/contact?interest=enterprise-training","Request enterprise training"]].map(([eyebrow,title,copy,href,action]) => <article key={eyebrow} className={`${panel} p-7 md:p-9`}><p className="text-xs font-black tracking-[.17em] text-[#f2bd5a]">{eyebrow}</p><h2 className="mt-3 text-3xl font-black tracking-tight">{title}</h2><p className="mt-4 leading-7 text-[#c5dce9]">{copy}</p><a className={`${goldButton} mt-6`} href={href}>{action}</a></article>)}</section>

      <section className="mx-5 mb-16 grid gap-6 rounded-2xl border border-sky-300/20 bg-[#06192a] p-7 md:mx-[max(5vw,24px)] md:grid-cols-[1fr_.55fr] md:p-10"><div><p className="text-xs font-black tracking-[.17em] text-[#f2bd5a]">COMPLETION RECOGNITION</p><h2 className="mt-3 text-3xl font-black tracking-tight md:text-4xl">Earn an Obserra Certificate of Training.</h2><p className="mt-4 leading-7 text-[#c5dce9]">Complete every lesson and pass the final assessment with an 80 percent score or higher. Certificates include learner name, course, completion date, training hours, and a unique certificate ID.</p></div><p className="rounded-xl bg-[#031525]/70 p-5 text-sm leading-6 text-[#a9c4d5]">An Obserra Certificate of Training is a proprietary course completion record. It is not a state license, occupational authorization, accredited academic credit, or third party professional certification.</p></section>

      <section className="mx-5 mb-16 rounded-2xl border border-[#f2bd5a]/25 bg-[linear-gradient(135deg,rgba(4,24,41,.98),rgba(10,48,78,.94))] p-7 text-center md:mx-[max(5vw,24px)] md:p-10"><h2 className="text-3xl font-black">Commercial purchase assurance</h2><div className="mt-6 flex flex-wrap justify-center gap-2">{["Secure Stripe checkout","Authenticated learner access","Saved progress","Assessment based completion","Certificate record","Enterprise support available"].map((item) => <span key={item} className="rounded-full border border-sky-300/25 px-4 py-2 text-sm font-extrabold text-[#d9eaf4]">{item}</span>)}</div><p className="mt-6 text-[#bdd5e4]">Questions about enrollment, team licensing, access, or certificates can be directed to <a className="font-bold text-[#f2bd5a]" href="mailto:info@obserrallc.com">info@obserrallc.com</a>.</p></section>

      <footer className="flex flex-col gap-4 border-t border-sky-300/15 px-5 py-8 text-sm text-[#91afbf] md:flex-row md:items-center md:px-[max(5vw,24px)]"><Image className="h-auto w-[180px]" src="/brand/obserra-logo.png" alt="Obserra Executive Protection and Intelligence LLC" width={180} height={35} /><p>Obserra Technologies learning product. Proprietary to Obserra Executive Protection &amp; Intelligence LLC. Unauthorized downloading, recording, copying, sharing, distribution, or classroom use is prohibited.</p></footer>
    </main>
  );
}
