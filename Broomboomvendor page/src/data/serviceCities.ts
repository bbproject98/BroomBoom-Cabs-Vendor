import type { Metadata } from "next";

export interface ServiceCity {
  slug: string;
  name: string;
  displayName: string;
  state: string;
  hubTagline: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
}

export const SERVICE_CITIES: ServiceCity[] = [
  {
    slug: "kolkata",
    name: "Kolkata",
    displayName: "Kolkata",
    state: "West Bengal",
    hubTagline: "Eastern India Fleet & Airport Hub",
    metaTitle:
      "Cab Vendor Registration in Kolkata | Attach Your Car – BroomBoom Vendor",
    metaDescription:
      "Register as a cab vendor with BroomBoom in Kolkata. Attach your car, taxi or fleet for outstation, local, airport and corporate booking opportunities across Kolkata. Join as a fleet partner.",
    keywords: [
        "attach car with cab company in kolkata",
    "taxi vendor registration in kolkata",
    "cab partner registration in kolkata",
    "outstation cab vendor in kolkata",
    "taxi fleet partner in kolkata",
    "driver partner registration in kolkata",
    "commercial vehicle attachment in kolkata",
    "cab booking company for drivers in kolkata",
    ],
  },
  {
    slug: "delhi",
    name: "Delhi",
    displayName: "Delhi",
    state: "Delhi",
    hubTagline: "Capital Region & IGI Airport Hub",
    metaTitle:
      "Cab Vendor Registration in Delhi | Attach Your Car – BroomBoom Vendor",
    metaDescription:
      "Register as a cab vendor with BroomBoom in Delhi. Attach your car, taxi or fleet for outstation, local, airport and corporate booking opportunities across Delhi. Join as a fleet partner.",
    keywords: [
      "attach car with cab company in delhi",
    "taxi vendor registration in delhi",
    "cab partner registration in delhi",
    "outstation cab vendor in delhi",
    "taxi fleet partner in delhi",
    "driver partner registration in delhi",
    "commercial vehicle attachment in delhi",
    "cab booking company for drivers in delhi",
    ],
  },
  {
    slug: "mumbai",
    name: "Mumbai",
    displayName: "Mumbai",
    state: "Maharashtra",
    hubTagline: "Western Metro & Corporate Fleet Hub",
    metaTitle:
      "Cab Vendor Registration in Mumbai | Attach Your Car – BroomBoom Vendor",
    metaDescription:
      "Register as a cab vendor with BroomBoom in Mumbai. Attach your car, taxi or fleet for outstation, local, airport and corporate booking opportunities across Mumbai. Join as a fleet partner.",
    keywords: [
      "attach car with cab company in mumbai",
    "taxi vendor registration in mumbai",
    "cab partner registration in mumbai",
    "outstation cab vendor in mumbai",
    "taxi fleet partner in mumbai",
    "driver partner registration in mumbai",
    "commercial vehicle attachment in mumbai",
    "cab booking company for drivers in mumbai",
    ],
  },
  {
    slug: "bangalore",
    name: "Bangalore",
    displayName: "Bangalore",
    state: "Karnataka",
    hubTagline: "Tech Corridor & KIA Airport Hub",
    metaTitle:
      "Cab Vendor Registration in Bangalore | Attach Your Car – BroomBoom Vendor",
    metaDescription:
      "Register as a cab vendor with BroomBoom in Bangalore. Attach your car, taxi or fleet for outstation, local, airport and corporate booking opportunities across Bangalore. Join as a fleet partner.",
    keywords: [
      "attach car with cab company in bangalore",
    "taxi vendor registration in bangalore",
    "cab partner registration in bangalore",
    "outstation cab vendor in bangalore",
    "taxi fleet partner in bangalore",
    "driver partner registration in bangalore",
    "commercial vehicle attachment in bangalore",
    "cab booking company for drivers in bangalore",
    ],
  },
  {
    slug: "pune",
    name: "Pune",
    displayName: "Pune",
    state: "Maharashtra",
    hubTagline: "Expressway & Outstation Travel Hub",
    metaTitle:
      "Cab Vendor Registration in Pune | Attach Your Car – BroomBoom Vendor",
    metaDescription:
      "Register as a cab vendor with BroomBoom in Pune. Attach your car, taxi or fleet for outstation, local, airport and corporate booking opportunities across Pune. Join as a fleet partner.",
    keywords: [
      "attach car with cab company in pune",
    "taxi vendor registration in pune",
    "cab partner registration in pune",
    "outstation cab vendor in pune",
    "taxi fleet partner in pune",
    "driver partner registration in pune",
    "commercial vehicle attachment in pune",
    "cab booking company for drivers in pune",
    ],
  },
  {
    slug: "hyderabad",
    name: "Hyderabad",
    displayName: "Hyderabad",
    state: "Telangana",
    hubTagline: "HITEC City & RGIA Airport Hub",
    metaTitle:
      "Cab Vendor Registration in Hyderabad | Attach Your Car – BroomBoom Vendor",
    metaDescription:
      "Register as a cab vendor with BroomBoom in Hyderabad. Attach your car, taxi or fleet for outstation, local, airport and corporate booking opportunities across Hyderabad. Join as a fleet partner.",
    keywords: [
      "attach car with cab company in hyderabad",
      "taxi vendor registration in hyderabad",
      "cab partner registration in hyderabad",
      "outstation cab vendor in hyderabad",
      "taxi fleet partner in hyderabad",
      "driver partner registration in hyderabad",
      "commercial vehicle attachment in hyderabad",
      "cab booking company for drivers in hyderabad",
    ],
  },
];

export function getServiceCityBySlug(slug?: string): ServiceCity | undefined {
  if (!slug) return undefined;
  const clean = slug.trim().toLowerCase();
  return SERVICE_CITIES.find((c) => c.slug === clean);
}

/**
 * Generates unique SEO, OpenGraph, Twitter, and Canonical metadata for a city service page.
 */
export function getCityMetadata(slug: string): Metadata {
  const city = getServiceCityBySlug(slug);
  if (!city) {
    return {
      title: "Service City Not Found | BroomBoom Vendor Partner",
    };
  }

  const canonicalUrl = `https://vendor.broomboomcabs.com/${city.slug}`;

  return {
    title: city.metaTitle,
    description: city.metaDescription,
    keywords: city.keywords,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: city.metaTitle,
      description: city.metaDescription,
      url: canonicalUrl,
      siteName: "BroomBoom Vendor",
      images: [
        {
          url: "/logo.png",
          width: 764,
          height: 1024,
          alt: `BroomBoom Vendor Partner in ${city.displayName}`,
        },
      ],
      locale: "en_IN",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: city.metaTitle,
      description: city.metaDescription,
      images: ["/logo.png"],
    },
  };
}
