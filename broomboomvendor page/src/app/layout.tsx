import type { Metadata, Viewport } from "next";
import Script from "next/script";
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

  robots: {
    index: true,
    follow: true,
  },

  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ||
      "https://vendor.broomboomcabs.com"
  ),

  openGraph: {
    title:
      "BroomBoom Vendor Partner | Attach Your Cabs & Fleet with India's Leading Network",

    description:
      "Attach your commercial cabs, sedans, SUVs, and fleet with BroomBoom. Enjoy 0% introductory commission, daily direct bank settlements, corporate bookings, and dedicated fleet management support across 120+ cities.",

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

  twitter: {
    card: "summary_large_image",

    title: "BroomBoom Vendor Partner | Attach Your Cabs & Fleet",

    description:
      "Attach your commercial cabs, sedans, SUVs, and fleet with BroomBoom. Enjoy 0% introductory commission and daily direct bank settlements.",

    images: ["/broomboom-logo.png"],
  },

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

    shortcut: "/broomboom-logo.png",

    apple: [
      {
        url: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },

  manifest: "/site.webmanifest",

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
    copyright:
      "2026 BroomBoom Transportation Services Private Limited",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <body className="min-h-screen bg-puja-cream text-slate-900 antialiased" suppressHydrationWarning>
        {/* Google Tag Manager */}
        <Script
          id="google-tag-manager"
          strategy="lazyOnload"
        >
          {`
            (function(w,d,s,l,i){
              w[l]=w[l]||[];
              w[l].push({
                'gtm.start': new Date().getTime(),
                event:'gtm.js'
              });

              var f=d.getElementsByTagName(s)[0],
                  j=d.createElement(s),
                  dl=l!='dataLayer'?'&l='+l:'';

              j.async=true;
              j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;

              f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-N6D7HH8');
          `}
        </Script>

        {/* Google Tag Manager - NoScript */}
        <noscript suppressHydrationWarning>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-N6D7HH8"
            height="0"
            width="0"
            style={{
              display: "none",
              visibility: "hidden",
            }}
            title="Google Tag Manager"
          />
        </noscript>

        {children}
      </body>
    </html>
  );
}