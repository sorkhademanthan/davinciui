/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@workspace/ui"],
  async redirects() {
    return [
      { source: "/experience", destination: "/experience/components", permanent: true },
      { source: "/docs/components-json", destination: "/docs/configuration", permanent: true },
      { source: "/docs/dark-mode", destination: "/docs/theming", permanent: true },
    ]
  },
}

export default nextConfig
