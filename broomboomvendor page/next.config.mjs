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
  async redirects() {
    return [
      {
        source: "/services/:city(kolkata|delhi|mumbai|bangalore|pune|hyderabad)",
        destination: "/:city",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
