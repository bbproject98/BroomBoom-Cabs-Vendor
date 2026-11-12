export interface ServiceCity {
  slug: string;
  name: string;
  state: string;
  hubTagline: string;
}

export const SERVICE_CITIES: ServiceCity[] = [
  {
    slug: "kolkata",
    name: "Kolkata",
    state: "West Bengal",
    hubTagline: "Eastern India Fleet & Airport Hub",
  },
  {
    slug: "delhi",
    name: "Delhi",
    state: "Delhi NCR",
    hubTagline: "Capital Region & IGI Airport Hub",
  },
  {
    slug: "mumbai",
    name: "Mumbai",
    state: "Maharashtra",
    hubTagline: "Western Metro & Corporate Fleet Hub",
  },
  {
    slug: "bangalore",
    name: "Bangalore",
    state: "Karnataka",
    hubTagline: "Tech Corridor & KIA Airport Hub",
  },
  {
    slug: "pune",
    name: "Pune",
    state: "Maharashtra",
    hubTagline: "Expressway & Outstation Travel Hub",
  },
  {
    slug: "hyderabad",
    name: "Hyderabad",
    state: "Telangana",
    hubTagline: "HITEC City & RGIA Airport Hub",
  },
];

export function getServiceCityBySlug(slug?: string): ServiceCity | undefined {
  if (!slug) return undefined;
  const clean = slug.trim().toLowerCase();
  return SERVICE_CITIES.find((c) => c.slug === clean);
}
