/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // No "X-Powered-By: Next.js": it tells visitors nothing useful and attackers which stack to try.
  poweredByHeader: false,

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
          // The parts of a content security policy that cannot break the site: no plugins, no
          // <base> tag pointing elsewhere, forms only post back here, and no framing. A full
          // script policy would need per-request nonces on every page.
          {
            key: "Content-Security-Policy",
            value: "object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
