import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const read = (path) => fs.readFileSync(path, "utf8");

const scope = read("app/components/premium/PremiumSiteScope.tsx");
const clarity = read("app/components/premium/secondary-page-clarity.css");
const institutional = read("app/components/premium/institutional-redesign.css");
const globalClarity = read("app/components/premium/global-clarity.css");
const about = read("app/about/page.tsx");
const aboutVisualRepair = read("app/about/about-visual-repair.css");
const nextConfig = read("next.config.ts");
const marketplace = read("app/ai-marketplace/MarketplaceSimple.css");
const marketplaceProduct = read("app/ai-marketplace/MarketplaceSimpleProduct.css");
const store = read("app/store/page.tsx");
const product = read("app/products/[slug]/page.tsx");
const floridaTraining = read("app/florida-security-training/page.tsx");
const dimensionalPedestal = read("app/ai-marketplace/MarketplaceDimensionalPedestal.tsx");
const marketplaceSalesDock = read("app/ai-marketplace/MarketplaceSalesDock.tsx");

function rules(source) {
  return [...source.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((match) => ({
    selector: match[1],
    body: match[2],
  }));
}

function contrastRatio(foreground, background) {
  const luminance = (hex) => {
    const channels = hex.slice(1).match(/.{2}/g).map((value) => Number.parseInt(value, 16) / 255);
    const linear = channels.map((value) => value <= 0.04045
      ? value / 12.92
      : ((value + 0.055) / 1.055) ** 2.4);
    return (0.2126 * linear[0]) + (0.7152 * linear[1]) + (0.0722 * linear[2]);
  };
  const first = luminance(foreground);
  const second = luminance(background);
  return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05);
}

test("public marketing routes receive the secondary scope without crossing protected boundaries", () => {
  assert.match(scope, /import "\.\/secondary-page-clarity\.css";/);
  assert.match(scope, /const publicSecondaryRoute = publicMarketingRoute && pathname !== "\/";/);
  assert.match(scope, /\$\{publicSecondaryRoute \? " public-secondary-scope" : ""\}/);
  assert.ok(
    scope.includes("const marketplaceRoute = pathname === \"/ai-marketplace\" || pathname.startsWith(\"/ai-marketplace/\");"),
    "the AI Marketplace must keep its isolated design scope",
  );
  assert.ok(
    scope.includes("const publicDetailRoute = /^\\/(services|industries|trust|eios|apps)\\/[^/]+$/.test(pathname)"),
    "public service, industry, trust, EIOS, and app details must be scoped",
  );
  assert.ok(
    scope.includes("|| /^\\/products\\/[^/]+$/.test(pathname)"),
    "public product detail routes must be scoped",
  );
  assert.ok(
    scope.includes("pathname !== \"/academy/success\""),
    "the Academy transaction result must stay outside the public design scope",
  );
  assert.ok(
    scope.includes("const publicPurchaseRoute = /^\\/apps\\/[^/]+\\/subscribe$/.test(pathname);"),
    "public app purchase routes must be scoped",
  );

  const routeList = scope.match(/const publicMarketingRoutes = new Set\(\[([\s\S]*?)\]\);/)?.[1];
  assert.ok(routeList, "the explicit public marketing route inventory must remain readable");
  const publicRoutes = new Set([...routeList.matchAll(/"([^"]+)"/g)].map((match) => match[1]));

  for (const pathname of [
    "/about",
    "/speaking",
    "/services",
    "/protection-intelligence",
    "/industries",
    "/resources",
    "/contact",
    "/trust",
    "/eios",
    "/apps",
    "/marketplace",
    "/academy",
    "/academy/enterprise",
    "/certifications",
    "/catalog",
    "/store",
    "/florida-security-training",
  ]) assert.ok(publicRoutes.has(pathname), `${pathname} must receive public-secondary-scope`);

  for (const pathname of [
    "/ai-marketplace",
    "/academy/success",
    "/academy/learn/course-id",
    "/academy/certificate/course-id",
    "/florida-security-training/access",
    "/private-applications-gateway/app-id",
    "/portal",
    "/portal/orders",
    "/sign-in",
    "/sign-up",
    "/admin",
  ]) assert.ok(!publicRoutes.has(pathname), `${pathname} must not enter the explicit public route inventory`);

  assert.ok(publicRoutes.has("/"), "the homepage must retain public-marketing-scope");
  assert.doesNotMatch(scope, /const publicSecondaryRoute = publicMarketingRoute;/);
});

test("every major secondary-page hero has an explicit high-contrast visual owner", () => {
  const heroRule = rules(clarity).find(({ selector, body }) =>
    selector.includes(".apps-hero")
    && body.includes("var(--public-hero-art")
    && body.includes("color: #0a2438 !important"));
  assert.ok(heroRule, "the shared light hero rule is missing");

  for (const selector of [
    ".apps-hero",
    ".service-detail-hero",
    ".trust-hero",
    ".industry-hero",
    ".industry-detail-hero",
    ".contact-hero",
    ".eios-hero",
    ".commercial-hero",
    ".catalog-hero",
    ".ae-hero",
    ".academy-course-hero",
    ".eios-product-hero",
    ".app-detail-hero",
    ".commerce-hero",
    ".about-page .about-hero",
    ".academy-executive-page .hero",
  ]) assert.ok(heroRule.selector.includes(selector), `${selector} must use the shared light hero treatment`);

  for (const selector of [".about-executive-hero", ".speaker-executive-hero"]) {
    assert.ok(institutional.includes(selector), `${selector} must remain owned by the institutional redesign`);
  }
  assert.match(globalClarity, /\.fl-classd \.fl-classd__hero/);
});

test("secondary surfaces use light fields and independently readable dark typography", () => {
  const tokens = new Map([
    ["secondary-canvas", "#f4f9fc"],
    ["secondary-band", "#e6f2f7"],
    ["secondary-surface", "#ffffff"],
    ["secondary-ink", "#0a2438"],
    ["secondary-body", "#29495d"],
    ["secondary-muted", "#466476"],
    ["secondary-link", "#075e8a"],
  ]);
  for (const [name, value] of tokens) {
    assert.match(clarity, new RegExp(`--${name}:\\s*${value}`, "i"), `${name} changed unexpectedly`);
  }

  assert.match(clarity, /background: #f4f9fc !important;[\s\S]{0,80}color: #0a2438 !important;/);
  assert.ok(contrastRatio("#0a2438", "#f4f9fc") >= 7, "headings must exceed WCAG AAA normal-text contrast");
  assert.ok(contrastRatio("#29495d", "#f4f9fc") >= 4.5, "body copy must exceed WCAG AA contrast");
  assert.ok(contrastRatio("#466476", "#ffffff") >= 4.5, "muted copy must remain readable on cards");
  assert.ok(contrastRatio("#075e8a", "#ffffff") >= 4.5, "links must remain readable on cards");
});

test("desktop and compact navigation retain the larger, high-contrast type contract", () => {
  const navRule = rules(clarity).find(({ selector, body }) =>
    selector.includes(".apps-nav") && body.includes("font-size: .95rem !important"));
  assert.ok(navRule, "the shared navigation type rule is missing");
  for (const selector of [
    ".apps-nav",
    ".eios-nav",
    ".eios-product-nav",
    ".catalog-nav",
    ".academy-course-nav",
    ".academy-executive-page .masthead",
    ".ae-nav",
    ".contact-nav",
    ".about-nav",
    ".commerce-nav",
  ]) assert.ok(navRule.selector.includes(selector), `${selector} must inherit the larger nav type`);
  assert.match(navRule.body, /color: #eef8fc !important;/);
  assert.match(navRule.body, /font-weight: 700 !important;/);
  assert.match(clarity, /\.ent-header__nav > a \{[\s\S]*?font-size: \.95rem !important;[\s\S]*?font-weight: 700 !important;/);
  assert.match(clarity, /@media \(max-width: 820px\) \{[\s\S]*?font-size: \.9rem !important;/);
});

test("the LinkedIn speaking post is accessible, responsive, and permitted by CSP", () => {
  const card = about.match(/<article className="about-proof-card about-media-card about-linkedin-card">([\s\S]*?)<\/article>/)?.[1];
  assert.ok(card, "About must render the LinkedIn evidence card");
  const iframe = card.match(/<iframe([\s\S]*?)\/>/)?.[1];
  assert.ok(iframe, "the LinkedIn evidence card must contain an iframe");
  assert.match(iframe, /src="https:\/\/www\.linkedin\.com\/embed\/feed\/update\/urn:li:ugcPost:\d+\?compact=1"/);
  assert.match(iframe, /loading="lazy"/);
  assert.match(iframe, /allowFullScreen/);
  assert.match(iframe, /title="LinkedIn announcement for Dr\. Jody Blanchard's upcoming speaking engagement"/);
  assert.match(card, /href="https:\/\/www\.linkedin\.com\/feed\/update\/urn:li:ugcPost:\d+"/);
  assert.match(card, /target="_blank" rel="noopener noreferrer"/);
  assert.match(aboutVisualRepair, /\.about-linkedin-embed iframe\{[\s\S]*?width:100%;[\s\S]*?height:100%;[\s\S]*?border:0;/);

  const frameSource = nextConfig.match(/`frame-src[^`]+`/)?.[0];
  assert.ok(frameSource, "CSP must publish a frame-src directive");
  assert.ok(frameSource.includes("https://www.linkedin.com"), "CSP must permit the exact LinkedIn embed origin");
});

test("purchase controls are bright yellow only when enabled and gray when disabled", () => {
  const enabledRule = rules(clarity).find(({ selector, body }) =>
    selector.includes(".executive-buy-button") && body.includes("background: #ffd400 !important"));
  assert.ok(enabledRule, "the enabled purchase rule is missing");
  for (const selector of [
    ".executive-buy-button",
    ".home-marketplace-promo__primary",
    ".academy-checkout-button:not(:disabled)",
    ".academy-course-checkout:not(:disabled):not([aria-disabled=\"true\"])",
    ".academy-course-buy-button:not(:disabled):not([aria-disabled=\"true\"])",
    ".academy-flagship-buy-button:not(:disabled):not([aria-disabled=\"true\"])",
    ".commerce-options button:not(:disabled)",
    ".doctrine-book__actions a:first-child",
    ".marketplace-simple__purchase-ready > a",
    ".marketplace-simple__buy--purchase",
    ".ai-marketplace__checkout button:not(:disabled)",
  ]) assert.ok(enabledRule.selector.includes(selector), `${selector} must use the enabled purchase signal`);
  assert.match(enabledRule.body, /border-color: #d6af00 !important;/);
  assert.match(enabledRule.body, /color: #071a2b !important;/);

  const disabledRule = rules(clarity).find(({ selector, body }) =>
    selector.includes(".academy-checkout-button:disabled") && body.includes("background: #dce5ea !important"));
  assert.ok(disabledRule, "the disabled purchase rule is missing");
  for (const selector of [
    ".academy-checkout-button:disabled",
    ".academy-course-checkout[aria-disabled=\"true\"]",
    ".academy-course-buy-button[aria-disabled=\"true\"]",
    ".academy-flagship-buy-button[aria-disabled=\"true\"]",
    ".commerce-options button:disabled",
    ".ai-marketplace__checkout button:disabled",
  ]) assert.ok(disabledRule.selector.includes(selector), `${selector} must use the disabled purchase signal`);
  assert.match(disabledRule.body, /border-color: #9babb5 !important;/);
  assert.match(disabledRule.body, /color: #536a78 !important;/);
  assert.match(disabledRule.body, /cursor: not-allowed !important;/);
  assert.match(disabledRule.body, /opacity: 1 !important;/);

  assert.match(marketplace, /\.marketplace-simple__buy--purchase \{[^}]*background: #ffd400;[^}]*color: #071a2b;/);
  assert.match(marketplaceProduct, /\.ai-marketplace__checkout button \{[^}]*background: #ffd400;[^}]*color: #071a2b;/);
  assert.match(marketplaceProduct, /\.ai-marketplace__checkout button:disabled \{[^}]*background: #dce5ea;[^}]*color: #536a78;/);
  for (const source of [store, product]) {
    assert.match(source, /bg-\[#ffd400\]/, "direct commerce actions must use the same yellow signal");
    assert.match(source, /text-\[#071a2b\]/, "direct commerce actions need dark readable type");
  }
});

test("the clarity layer cannot alter scrolling-card mechanics", () => {
  const forbiddenDeclarations = /\b(?:overflow(?:-x|-y)?|overscroll-behavior(?:-inline|-block|-x|-y)?|scroll-snap-(?:type|align|stop)|scroll-padding(?:-inline|-block|-x|-y)?|scrollbar-(?:width|color)|grid-auto-(?:flow|columns)|flex-basis|-webkit-overflow-scrolling)\s*:/i;
  assert.doesNotMatch(clarity, forbiddenDeclarations);
  assert.doesNotMatch(clarity, /\bflex\s*:\s*0\s+0(?:\s|;)/i);

  for (const selector of [
    ".about-proof-rail",
    ".about-proof-card",
    ".verified-credentials-grid",
    ".verified-credential-card",
    ".speaker-proof-rail",
    ".speaker-topic-rail",
    ".speaker-media-rail",
    ".speaker-media-card",
  ]) assert.ok(!clarity.includes(selector), `clarity layer must not override protected rail selector ${selector}`);
});

test("public marketing visuals do not render decorative zero-padded step numbers", () => {
  for (const source of [floridaTraining, dimensionalPedestal, marketplaceSalesDock]) {
    assert.doesNotMatch(source, />\s*0[1-4]\s*</);
    assert.doesNotMatch(source, /String\(index \+ 1\)\.padStart\(2, "0"\)/);
  }
});
