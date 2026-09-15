/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@workspace/ui"],
  // Hides the floating "N" dev badge (bottom-left). Dev-only setting —
  // production builds never render it. Needs a dev-server restart.
  devIndicators: false,
  async redirects() {
    return [
      { source: "/experience", destination: "/experience/components", permanent: true },
      { source: "/docs/components-json", destination: "/docs/configuration", permanent: true },
      { source: "/docs/dark-mode", destination: "/docs/theming", permanent: true },
      { source: "/experience/components/pixel-drift", destination: "/experience/components/pixel-flow", permanent: true },
      { source: "/experience/components/paper-ink-background", destination: "/experience/components/ink-flow", permanent: true },
    ]
  },
}

export default nextConfig
