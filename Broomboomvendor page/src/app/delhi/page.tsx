import React from "react";
import type { Metadata } from "next";
import { LandingPageContent } from "@/components/LandingPageContent";
import { getCityMetadata } from "@/data/serviceCities";

export const metadata: Metadata = getCityMetadata("delhi");

export default function DelhiPage() {
  return <LandingPageContent cityName="Delhi" />;
}
