import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*", // Aplica las reglas a todas las páginas y rutas
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY", // Evita Clickjacking
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff", // Previene ataques de tipo MIME
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains", // Forzar HTTPS
          },
        ],
      },
    ];
  },
};

export default nextConfig;