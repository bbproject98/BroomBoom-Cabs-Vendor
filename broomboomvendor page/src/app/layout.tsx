
// app/layout.tsx

import type { Metadata, Viewport } from "next";
import {
  GoogleTagManager,
  GoogleAnalytics,
} from "@next/third-parties/google";

import "./globals.css";

/* ------------------------------------------------------------------ */
/* GOOGLE TRACKING                                                    */
/* ------------------------------------------------------------------ */

const GTM_ID = "GTM-N6D7HH8";
const GA_ID = "G-JD89KXBSS2";

/* ------------------------------------------------------------------ */
/* VIEWPORT                                                           */
/* ------------------------------------------------------------------ */

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#F59E0B",
};

/* ------------------------------------------------------------------ */
/* SEO METADATA                                                       */
/* ------------------------------------------------------------------ */

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ||
      "https://vendor.broomboomcabs.com"
  ),

  title:
    "Cab Vendor Registration in India | Attach Your Car – BroomBoom Vendor",

  description:
    "Register as a cab vendor with BroomBoom. Attach your car, taxi or fleet for outstation, local, airport and corporate booking opportunities across India. Join as a fleet partner.",

  keywords: [
    "attach car with cab company",
    "taxi vendor registration",
    "cab partner registration",
    "outstation cab vendor",
    "taxi fleet partner",
    "driver partner registration",
    "commercial vehicle attachment",
    "cab booking company for drivers",
  ],

  applicationName: "BroomBoom Vendor",

  authors: [
    {
      name: "BroomBoom Transportation Services Private Limited",
    },
  ],

  creator: "BroomBoom Transportation Services Private Limited",

  publisher: "BroomBoom Transportation Services Private Limited",

  category: "Travel",

  /* CANONICAL URL */
  alternates: {
    canonical: "https://vendor.broomboomcabs.com/",
  },

  /* SEARCH ENGINE ROBOTS */
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  /* OPEN GRAPH */
  openGraph: {
    title:
      "BroomBoom Vendor Partner | Attach Your Cabs & Fleet with India's Leading Network",

    description:
      "Attach your commercial cabs, sedans, SUVs, and fleet with BroomBoom. Enjoy 0% introductory commission, daily direct bank settlements, corporate bookings, and dedicated fleet management support across 120+ cities.",

    url: "https://vendor.broomboomcabs.com/",

    siteName: "BroomBoom Vendor",

    images: [
      {
        url: "/logo.png",
        width: 764,
        height: 1024,
        alt: "broomboom-cabs-logo",
      },
    ],

    locale: "en_IN",

    type: "website",
  },

  /* TWITTER / X */
  twitter: {
    card: "summary_large_image",

    title: "BroomBoom Vendor Partner | Attach Your Cabs & Fleet",

    description:
      "Attach your commercial cabs, sedans, SUVs, and fleet with BroomBoom. Enjoy 0% introductory commission and daily direct bank settlements.",

    images: ["/logo.png"],
  },

  /* FAVICON */
  icons: {
    icon: [
      {
        url: "/favicon.ico",
        sizes: "any",
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

    shortcut: "/favicon.ico",

    apple: [
      {
        url: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },

  /* PWA */
  manifest: "/site.webmanifest",

  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "BroomBoom Vendor",
  },

  /* CUSTOM META TAGS */
  other: {
    brand: "BroomBoom Vendor",

    "mobile-web-app-capable": "yes",

    "apple-mobile-web-app-capable": "yes",

    "apple-mobile-web-app-title": "BroomBoom Vendor",

    copyright:
      "2026 BroomBoom Transportation Services Private Limited",
  },
};

/* ------------------------------------------------------------------ */
/* ROOT LAYOUT                                                        */
/* ------------------------------------------------------------------ */

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="scroll-smooth"
      suppressHydrationWarning
    >
      <body
        className="min-h-screen bg-puja-cream text-slate-900 antialiased"
        suppressHydrationWarning
      >
        {/* GOOGLE TAG MANAGER - NOSCRIPT FALLBACK */}
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
            height="0"
            width="0"
            style={{
              display: "none",
              visibility: "hidden",
            }}
            title="Google Tag Manager"
          />
        </noscript>

        {/* WEBSITE CONTENT */}
        {children}

        {/* GOOGLE TAG MANAGER */}
        <GoogleTagManager gtmId={GTM_ID} />

        {/* GOOGLE ANALYTICS 4 */}
        <GoogleAnalytics gaId={GA_ID} />

      </body>
    </html>
  );
}
