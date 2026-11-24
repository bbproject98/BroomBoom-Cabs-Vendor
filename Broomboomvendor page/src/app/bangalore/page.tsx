import React from "react";
import type { Metadata } from "next";
import { LandingPageContent } from "@/components/LandingPageContent";
import { getCityMetadata } from "@/data/serviceCities";

export const metadata: Metadata = getCityMetadata("bangalore");

export default function BangalorePage() {
  return <LandingPageContent cityName="Bangalore" />;
}
