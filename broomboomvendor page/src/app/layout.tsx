import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#F59E0B",
};

export const metadata: Metadata = {
  title:
    "BroomBoom Vendor Partner | Attach Your Cabs & Fleet with India's Leading Network",

  description:
    "Attach your commercial cabs, sedans, SUVs, and fleet with BroomBoom. Enjoy 0% introductory commission, daily direct bank settlements, corporate bookings, and dedicated fleet management support across 120+ cities.",

  keywords: [
    "BroomBoom vendor partner",
    "attach cab in BroomBoom",
    "fleet attachment portal",
    "car rental vendor India",
    "taxi fleet operator partner",
    "outstation cab vendor",
    "attach car with travel agency",
    "BroomBoom cabs",
  ],

  // Keep Vendor page out of Google
  robots: {
    index: false,
    follow: false,
  },

  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://vendor.broomboom.com"),

  // OpenGraph Social Share Meta Logo & Cards
  openGraph: {
    title: "BroomBoom Vendor Partner | Attach Your Cabs & Fleet with India's Leading Network",
    description: "Attach your commercial cabs, sedans, SUVs, and fleet with BroomBoom. Enjoy 0% introductory commission, daily direct bank settlements, corporate bookings, and dedicated fleet management support across 120+ cities.",
    url: "/",
    siteName: "BroomBoom Vendor",
    images: [
      {
        url: "/broomboom-logo.png",
        width: 764,
        height: 1024,
        alt: "BroomBoom Vendor Logo",
      },
    ],
    locale: "en_IN",
    type: "website",
  },

  // Twitter Social Meta Logo & Cards
  twitter: {
    card: "summary_large_image",
    title: "BroomBoom Vendor Partner | Attach Your Cabs & Fleet",
    description: "Attach your commercial cabs, sedans, SUVs, and fleet with BroomBoom. Enjoy 0% introductory commission and daily direct bank settlements.",
    images: ["/broomboom-logo.png"],
  },

  // PWA / App icons
  icons: {
    icon: [
      {
        url: "/favicon.ico",
        sizes: "any",
      },
      {
        url: "/broomboom-logo.png",
        type: "image/png",
      },
      {
        url: "/favicon-48x48.png",
        sizes: "48x48",
        type: "image/png",
      },
      {
        url: "/favicon-96x96.png",
        sizes: "96x96",
        type: "image/png",
      },
      {
        url: "/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
    ],

    shortcut: "/broomboom-logo.png",

    apple: [
      {
        url: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
      {
        url: "/broomboom-logo.png",
        type: "image/png",
      },
    ],
  },

  // Web App Manifest
  manifest: "/site.webmanifest",

  // Optional PWA-related metadata
  applicationName: "BroomBoom Vendor",

  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "BroomBoom Vendor",
  },

  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-title": "BroomBoom Vendor",
    "copyright": "2026 BroomBoom Transportation Services Private Limited",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="antialiased text-slate-900 bg-puja-cream min-h-screen">
        {children}
      </body>
    </html>
  );
}