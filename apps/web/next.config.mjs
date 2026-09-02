/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@workspace/ui"],
  async redirects() {
    return [
      { source: "/experience", destination: "/experience/components", permanent: true },
    ]
  },
}

export default nextConfig
