import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LandingPageContent } from "@/components/LandingPageContent";
import { SERVICE_CITIES, getServiceCityBySlug } from "@/data/serviceCities";

interface CityServicePageProps {
  params: {
    city: string;
  };
}

export function generateStaticParams() {
  return SERVICE_CITIES.map((city) => ({
    city: city.slug,
  }));
}

export function generateMetadata({ params }: CityServicePageProps): Metadata {
  const cityData = getServiceCityBySlug(params.city);

  if (!cityData) {
    return {
      title: "Service City Not Found | BroomBoom Vendor Partner",
    };
  }

  return {
    title: `BroomBoom Vendor Partner in ${cityData.name} | Attach Your Cabs & Fleet`,
    description: `Attach your commercial cabs, sedans, SUVs, and fleet with BroomBoom in ${cityData.name} (${cityData.state}). Explore Silver, Gold, and Platinum vendor packages, zero commission options, and daily direct bank settlements.`,
  };
}

export default function CityServicePage({ params }: CityServicePageProps) {
  const cityData = getServiceCityBySlug(params.city);

  if (!cityData) {
    notFound();
  }

  return <LandingPageContent cityName={cityData.name} />;
}
