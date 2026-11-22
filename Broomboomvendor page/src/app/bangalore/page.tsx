import React from "react";
import type { Metadata } from "next";
import { LandingPageContent } from "@/components/LandingPageContent";

export const metadata: Metadata = {
  title: "BroomBoom Vendor Partner in Bangalore | Attach Your Cabs & Fleet",
  description:
    "Attach your commercial cabs, sedans, SUVs, and fleet with BroomBoom in Bangalore (Karnataka). Explore Silver, Gold, and Platinum vendor packages, zero commission options, and daily direct bank settlements.",
};

export default function BangalorePage() {
  return <LandingPageContent cityName="Bangalore" />;
}
