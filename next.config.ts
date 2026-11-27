import type { NextConfig } from "next";

// Security response headers applied to every route. These are the safe,
// provider-agnostic ones that don't risk breaking PayPal/Xendit scripts.
// (A full script-src Content-Security-Policy is intentionally left out for
// now — it needs the payment flow tested first to avoid blocking their SDKs.)
const securityHeaders = [
  // Force HTTPS for 2 years, including subdomains. Browsers refuse plain HTTP.
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  // Block this site from being embedded in a frame elsewhere (clickjacking).
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
  // Stop browsers from guessing/overriding declared content types.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Don't leak full URLs (query strings, paths) to other sites via Referer.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // We use none of these device APIs — deny them to every origin.
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
];

const nextConfig: NextConfig = {
  // Remove the "X-Powered-By: Next.js" header (version/stack disclosure).
  poweredByHeader: false,
  images: {
    // <Image> re-encodes every photo it serves. The default (75) visibly
    // softened the already-compressed WebPs; 90 keeps them sharp. With only
    // one allowed value, every <Image> uses it without a per-image prop.
    qualities: [90],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
