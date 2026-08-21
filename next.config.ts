import type { NextConfig } from "next";
import { prepareIdentityOriginContract } from "./lib/auth/identity-origin-contract";
import { prepareSupabaseAuthRuntime } from "./lib/auth/runtime-config";
import { CANONICAL_PUBLIC_ORIGIN } from "./lib/legal-identity";
import { isProductionRuntime } from "./lib/runtime-environment";

const identityOrigins = prepareIdentityOriginContract();
const supabaseAuthRuntime = prepareSupabaseAuthRuntime();
const productionRuntime = isProductionRuntime();
const standaloneAppServiceBuild =
  process.env.VERCEL !== "1" &&
  process.env.OBSERRA_HOSTING_PROVIDER === "azure-app-service";
const identityScriptSources = identityOrigins.scriptSources.join(" ");
const identityConnectSources = [
  ...new Set([
    ...identityOrigins.connectSources,
    ...(supabaseAuthRuntime.ready && supabaseAuthRuntime.url ? [supabaseAuthRuntime.url] : []),
  ]),
].join(" ");
const fdacsOwnerCoursewareSources = [
  "https://ggkxgjhsbgbifiqrhavr.supabase.co",
  "https://ggkxgjhsbgbifiqrhavr.storage.supabase.co",
].join(" ");

const clerkIdentitySources = [
  "https://*.clerk.accounts",
  "https://challenges.cloudflare.com",
  "https://*.protect.clerk.com",
  "https://clerk-telemetry.com",
  "https://*.clerk-telemetry.com",
  ...(productionRuntime
    ? []
    : [
        "https://clerk.accounts.dev",
        "https://*.clerk.accounts.dev",
        "https://*.clerk.dev",
        "https://*.clerkstage.dev",
      ]),
].join(" ");

const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  `script-src 'self' 'unsafe-inline' https://js.stripe.com https://cdn.credly.com ${clerkIdentitySources} ${identityScriptSources}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https:",
  "font-src 'self' data:",
  `connect-src 'self' https://api.stripe.com https://checkout.stripe.com https://www.credly.com https://cdn.credly.com https://vitals.vercel-insights.com ${clerkIdentitySources} ${identityConnectSources} ${fdacsOwnerCoursewareSources}`,
  "media-src 'self' https: blob:",
  "worker-src 'self' blob:",
  `frame-src 'self' https://js.stripe.com https://checkout.stripe.com https://hooks.stripe.com https://www.credly.com https://challenges.cloudflare.com https://*.protect.clerk.com https://*.daily.co ${fdacsOwnerCoursewareSources}`,
  "frame-ancestors 'none'",
  "form-action 'self' https://checkout.stripe.com https://buy.stripe.com",
  "upgrade-insecure-requests"
].join("; ");

const publicSecurityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-DNS-Prefetch-Control", value: "off" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Permitted-Cross-Domain-Policies", value: "none" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), display-capture=(), fullscreen=(self), geolocation=(), payment=(), usb=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
  { key: "Access-Control-Allow-Origin", value: CANONICAL_PUBLIC_ORIGIN },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

const protectedRouteHeaders = [
  { key: "Cache-Control", value: "private, no-store, max-age=0, must-revalidate" },
  { key: "Pragma", value: "no-cache" },
  { key: "Expires", value: "0" },
  { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive, nosnippet, noimageindex" },
];

const protectedVideoParticipantHeaders = [
  ...protectedRouteHeaders,
  {
    key: "Permissions-Policy",
    value: 'camera=(self "https://*.daily.co"), microphone=(self "https://*.daily.co"), display-capture=(), fullscreen=(self "https://*.daily.co"), geolocation=(), payment=(), usb=()',
  },
];

const protectedVideoInstructorHeaders = [
  ...protectedRouteHeaders,
  {
    key: "Permissions-Policy",
    value: 'camera=(self "https://*.daily.co"), microphone=(self "https://*.daily.co"), display-capture=(self "https://*.daily.co"), fullscreen=(self "https://*.daily.co"), geolocation=(), payment=(), usb=()',
  },
];

const transactionalRouteHeaders = [
  ...protectedRouteHeaders,
  { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
];

const nextConfig: NextConfig = {
  ...(standaloneAppServiceBuild ? { output: "standalone" as const } : {}),
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 31_536_000,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: publicSecurityHeaders,
      },
      {
        source: "/private-applications-gateway/:path*",
        headers: protectedRouteHeaders,
      },
      {
        source: "/checkout/:path*",
        headers: transactionalRouteHeaders,
      },
      {
        source: "/api/checkout/:path*",
        headers: transactionalRouteHeaders,
      },
      {
        source: "/api/stripe/:path*",
        headers: transactionalRouteHeaders,
      },
      {
        source: "/api/webhook/stripe",
        headers: transactionalRouteHeaders,
      },
      {
        source: "/api/academy/:path*",
        headers: transactionalRouteHeaders,
      },
      {
        source: "/api/florida-class-d/:path*",
        headers: transactionalRouteHeaders,
      },
      {
        source: "/academy/success",
        headers: transactionalRouteHeaders,
      },
      {
        source: "/portal/orders/:path*",
        headers: transactionalRouteHeaders,
      },
      {
        source: "/portal/billing/:path*",
        headers: transactionalRouteHeaders,
      },
      {
        source: "/academy/enroll/:path*",
        headers: transactionalRouteHeaders,
      },
      {
        source: "/sign-in/:path*",
        headers: protectedRouteHeaders,
      },
      {
        source: "/sign-up/:path*",
        headers: protectedRouteHeaders,
      },
      {
        source: "/portal/:path*",
        headers: protectedRouteHeaders,
      },
      {
        source: "/academy/learn/:path*",
        headers: protectedRouteHeaders,
      },
      {
        source: "/academy/certificate/:path*",
        headers: protectedRouteHeaders,
      },
      {
        source: "/florida-security-training/identity",
        headers: protectedVideoParticipantHeaders,
      },
      {
        source: "/florida-security-training/live/:path*",
        headers: protectedVideoParticipantHeaders,
      },
      {
        source: "/florida-security-training/admin/live/:path*",
        headers: protectedVideoInstructorHeaders,
      },
      {
        source: "/florida-security-training/owner-preview/:path*",
        headers: protectedVideoInstructorHeaders,
      },
      {
        source: "/florida-security-training/owner-validation/:path*",
        headers: protectedVideoInstructorHeaders,
      },
      {
        source: "/eios/app/:path*",
        headers: protectedRouteHeaders,
      },
    ];
  },
};

export default nextConfig;
