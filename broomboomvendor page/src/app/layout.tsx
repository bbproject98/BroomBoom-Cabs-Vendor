import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BroomBoom Vendor Partner | Attach Your Cabs & Fleet with India's Leading Network",
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
    index: false,
    follow: false,
  },

  icons: {
    icon: "/broomboom-logo.png",
    shortcut: "/broomboom-logo.png",
    apple: "/broomboom-logo.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
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