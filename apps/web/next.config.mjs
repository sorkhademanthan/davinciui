/** @type {import('next').NextConfig} */
const securityHeaders = [
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  // Enforcing (safe: only frame-ancestors, which does not restrict scripts).
  { key: "Content-Security-Policy", value: "frame-ancestors 'self'" },
  // Report-only full policy — tighten incrementally, it never blocks.
  {
    key: "Content-Security-Policy-Report-Only",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com https://us-assets.i.posthog.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob:",
      "font-src 'self' data:",
      "connect-src 'self' https://*.posthog.com https://*.vercel-insights.com https://vitals.vercel-insights.com",
      "media-src 'self' blob: https://videos.ctfassets.net",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
]

const nextConfig = {
  transpilePackages: ["@workspace/ui"],
  images: {
    formats: ["image/avif", "image/webp"],
  },
  // Hides the floating "N" dev badge (bottom-left). Dev-only setting —
  // production builds never render it. Needs a dev-server restart.
  devIndicators: false,
  async headers() {
    const mediaCache = "public, max-age=604800, stale-while-revalidate=86400";
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      {
        source: "/images/:path*",
        headers: [{ key: "Cache-Control", value: mediaCache }],
      },
      {
        source: "/preview-videos/:path*",
        headers: [{ key: "Cache-Control", value: mediaCache }],
      },
      {
        source: "/audio/:path*",
        headers: [{ key: "Cache-Control", value: mediaCache }],
      },
    ]
  },
  async redirects() {
    return [
      { source: "/experience", destination: "/experience/components", permanent: true },
      { source: "/docs/components-json", destination: "/docs/configuration", permanent: true },
      { source: "/docs/dark-mode", destination: "/docs/theming", permanent: true },
      { source: "/docs/monorepo", destination: "/docs/installation", permanent: true },
      { source: "/experience/components/pixel-drift", destination: "/experience/components/pixel-flow", permanent: true },
      { source: "/experience/components/paper-ink-background", destination: "/experience/components/ink-flow", permanent: true },
      { source: "/docs/components/preloader-pro", destination: "/docs/components/cinematic-panel-preloader", permanent: true },
      { source: "/docs/components/preloader-pro-v1", destination: "/docs/components/glitch-shred-preloader", permanent: true },
      { source: "/docs/components/preloader-pro-v4", destination: "/docs/components/editorial-card-arc-preloader", permanent: true },
      { source: "/docs/components/preloader-pro-v5", destination: "/docs/components/masked-arc-preloader", permanent: true },
      { source: "/docs/components/premium-preloader", destination: "/docs/components/editorial-curtain-preloader", permanent: true },
      { source: "/demo/preloader-pro", destination: "/demo/cinematic-panel-preloader", permanent: true },
      { source: "/demo/preloader-pro-v1", destination: "/demo/glitch-shred-preloader", permanent: true },
      { source: "/demo/preloader-pro-v4", destination: "/demo/editorial-card-arc-preloader", permanent: true },
      { source: "/demo/preloader-pro-v5", destination: "/demo/masked-arc-preloader", permanent: true },
      { source: "/demo/premium-preloader", destination: "/demo/editorial-curtain-preloader", permanent: true },
      { source: "/experience/components/preloader-pro", destination: "/experience/components/cinematic-panel-preloader", permanent: true },
      { source: "/experience/components/preloader-pro-v1", destination: "/experience/components/glitch-shred-preloader", permanent: true },
      { source: "/experience/components/preloader-pro-v4", destination: "/experience/components/editorial-card-arc-preloader", permanent: true },
      { source: "/experience/components/preloader-pro-v5", destination: "/experience/components/masked-arc-preloader", permanent: true },
      { source: "/experience/components/premium-preloader", destination: "/experience/components/editorial-curtain-preloader", permanent: true },
    ]
  },
}

export default nextConfig
