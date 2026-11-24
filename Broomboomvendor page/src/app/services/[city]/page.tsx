import React from "react";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { LandingPageContent } from "@/components/LandingPageContent";
import { SERVICE_CITIES, getCityMetadata, getServiceCityBySlug } from "@/data/serviceCities";

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
  return getCityMetadata(params.city);
}

export default function CityServicePage({ params }: CityServicePageProps) {
  const cityData = getServiceCityBySlug(params.city);

  if (!cityData) {
    notFound();
  }

  // Redirect /services/kolkata -> /kolkata
  redirect(`/${cityData.slug}`);
}
