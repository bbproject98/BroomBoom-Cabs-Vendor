/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["images.unsplash.com", "plus.unsplash.com"],
  },
  async rewrites() {
    return [
      {
        source: "/thanku",
        destination: "/thank-you",
      },
      {
        source: "/thankyou",
        destination: "/thank-you",
      },
      {
        source: "/login",
        destination: "/vendor/login",
      },
    ];
  },
};

export default nextConfig;
