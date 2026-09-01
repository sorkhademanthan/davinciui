/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@workspace/ui"],
  async redirects() {
    return [
      // Phase 1: keep old /docs URLs working, no breaking redirects yet.
      // Future phases will add permanent redirects:
      // { source: "/docs/foundations/:path*", destination: "/design-system/foundations/:path*", permanent: true },
      // { source: "/docs/components/:path*", destination: "/experience/components/:path*", permanent: true },
    ]
  },
}

export default nextConfig
