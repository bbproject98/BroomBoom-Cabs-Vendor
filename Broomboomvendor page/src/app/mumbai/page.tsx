import React from "react";
import type { Metadata } from "next";
import { LandingPageContent } from "@/components/LandingPageContent";
import { getCityMetadata } from "@/data/serviceCities";

export const metadata: Metadata = getCityMetadata("mumbai");

export default function MumbaiPage() {
  return <LandingPageContent cityName="Mumbai" />;
}
