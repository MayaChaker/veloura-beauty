/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Photographs are served above the default quality of 75: campaign images at 85, products at 90.
  images: { qualities: [75, 85, 90] },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
