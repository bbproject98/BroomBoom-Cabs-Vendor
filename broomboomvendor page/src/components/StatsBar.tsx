import React from "react";

// ===== Yellow theme colors =====
// stroke: #E6A700 (deep yellow)
// fill:   #FFF3CD (light yellow)
// accent: #E6A700

// MakeMyTrip style custom service icons — ALL YELLOW
const HolidayPackagesIcon: React.FC = () => (
  <svg
    viewBox="0 0 48 48"
    fill="none"
    className="w-8 h-8"
    stroke="#E6A700"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <ellipse cx="24" cy="38" rx="14" ry="2.5" fill="#FFF3CD" fillOpacity="0.9" stroke="#E6A700" strokeWidth="1.8" />
    <path d="M23 37c0-6 1-12 3-17" stroke="#E6A700" strokeWidth="2.5" />
    <path d="M21 32h3" strokeWidth="1.5" stroke="#E6A700" />
    <path d="M22 27h3" strokeWidth="1.5" stroke="#E6A700" />
    <path d="M26 20c-3-5-8-6-13-4 3 3 4 6 5 9" fill="#FFF3CD" fillOpacity="0.8" stroke="#E6A700" />
    <path d="M26 20c3-5 8-6 13-4-3 3-4 6-5 9" fill="#FFF3CD" fillOpacity="0.8" stroke="#E6A700" />
    <path d="M26 20c-1-6-4-8-8-9 1 3 2 6 3 9" stroke="#E6A700" />
    <path d="M26 20c1-6 4-8 8-9-1 3-2 6-3 9" stroke="#E6A700" />
    <path d="M10 41c3.5-1.2 7-1.2 10.5 0s7 1.2 10.5 0 5-1.2 7 0" stroke="#E6A700" strokeWidth="1.8" />
    <path d="M12 44c3-1 6-1 9 0s6 1 9 0 5-1 7 0" stroke="#E6A700" strokeWidth="1.5" />
  </svg>
);

const FlightsIcon: React.FC = () => (
  <svg
    viewBox="0 0 48 48"
    fill="none"
    className="w-8 h-8"
    stroke="#E6A700"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path
      d="M15 34l3.5-6 16-10.5c1.8-1.2 3.8-.5 4.8 1.2s.5 3.8-1.2 4.8L23 31l-3.5 7-5 1.5 1.5-5.5z"
      fill="#FFF3CD"
      fillOpacity="0.8"
      stroke="#E6A700"
    />
    <path d="M21 27l-7.5-3.5-2.5 2.5 4 3.5 7-1.5z" fill="#FFF3CD" fillOpacity="0.9" stroke="#E6A700" />
    <path d="M27 22.5l9-9.5 3 1.5-5 10.5z" fill="#FFF3CD" fillOpacity="0.9" stroke="#E6A700" />
  </svg>
);

const HotelsIcon: React.FC = () => (
  <svg
    viewBox="0 0 48 48"
    fill="none"
    className="w-8 h-8"
    stroke="#E6A700"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polygon points="16,11 17,13.2 19.5,13.5 17.7,15.2 18.2,17.6 16,16.4 13.8,17.6 14.3,15.2 12.5,13.5 15,13.2" fill="#E6A700" stroke="none" />
    <polygon points="24,8.5 25,10.7 27.5,11 25.7,12.7 26.2,15.1 24,13.9 21.8,15.1 22.3,12.7 20.5,11 23,10.7" fill="#E6A700" stroke="none" />
    <polygon points="32,11 33,13.2 35.5,13.5 33.7,15.2 34.2,17.6 32,16.4 29.8,17.6 30.3,15.2 28.5,13.5 31,13.2" fill="#E6A700" stroke="none" />
    <rect x="14" y="18" width="20" height="24" rx="2" fill="#FFF3CD" fillOpacity="0.8" stroke="#E6A700" strokeWidth="2.2" />
    <rect x="18" y="22" width="2.5" height="2.5" rx="0.5" fill="#E6A700" stroke="none" />
    <rect x="23" y="22" width="2.5" height="2.5" rx="0.5" fill="#E6A700" stroke="none" />
    <rect x="28" y="22" width="2.5" height="2.5" rx="0.5" fill="#E6A700" stroke="none" />
    <rect x="18" y="27" width="2.5" height="2.5" rx="0.5" fill="#E6A700" stroke="none" />
    <rect x="23" y="27" width="2.5" height="2.5" rx="0.5" fill="#E6A700" stroke="none" />
    <rect x="28" y="27" width="2.5" height="2.5" rx="0.5" fill="#E6A700" stroke="none" />
    <rect x="18" y="32" width="2.5" height="2.5" rx="0.5" fill="#E6A700" stroke="none" />
    <rect x="23" y="32" width="2.5" height="2.5" rx="0.5" fill="#E6A700" stroke="none" />
    <rect x="28" y="32" width="2.5" height="2.5" rx="0.5" fill="#E6A700" stroke="none" />
    <path d="M21 42v-5h6v5" stroke="#E6A700" strokeWidth="2" fill="#E6A700" />
  </svg>
);

const CorporateBookingsIcon: React.FC = () => (
  <svg
    viewBox="0 0 48 48"
    fill="none"
    className="w-8 h-8"
    stroke="#E6A700"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M19 19v-4.5c0-1.4 1.1-2.5 2.5-2.5h5c1.4 0 2.5 1.1 2.5 2.5V19" strokeWidth="2.2" stroke="#E6A700" />
    <rect x="11" y="19" width="26" height="19" rx="3.5" fill="#FFF3CD" fillOpacity="0.8" strokeWidth="2.2" stroke="#E6A700" />
    <line x1="11" y1="28" x2="37" y2="28" strokeDasharray="2.5 2" strokeWidth="1.5" stroke="#E6A700" />
    <rect x="22" y="26.5" width="4" height="4.5" rx="1" fill="#E6A700" stroke="none" />
  </svg>
);

const CruisesIcon: React.FC = () => (
  <svg
    viewBox="0 0 48 48"
    fill="none"
    className="w-8 h-8"
    stroke="#E6A700"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 12h4v4h-4z" fill="#E6A700" stroke="none" />
    <path d="M18 16h12v5H18z" fill="#FFF3CD" fillOpacity="0.9" strokeWidth="1.8" stroke="#E6A700" />
    <path d="M14 21h20l2.5 4H11.5l2.5-4z" fill="#FFF3CD" fillOpacity="0.8" strokeWidth="1.8" stroke="#E6A700" />
    <path d="M10 25l3 9.5c.8 1.5 2.3 2.5 4 2.5h14c1.7 0 3.2-1 4-2.5l3-9.5H10z" fill="#FFF3CD" fillOpacity="0.7" strokeWidth="2.2" stroke="#E6A700" />
    <circle cx="17" cy="29.5" r="1.2" fill="#E6A700" stroke="none" />
    <circle cx="22" cy="29.5" r="1.2" fill="#E6A700" stroke="none" />
    <circle cx="27" cy="29.5" r="1.2" fill="#E6A700" stroke="none" />
    <circle cx="32" cy="29.5" r="1.2" fill="#E6A700" stroke="none" />
    <path d="M8 39c3.5-1.2 7-1.2 10.5 0s7 1.2 10.5 0 5.5-1.2 8.5 0" strokeWidth="2" stroke="#E6A700" />
    <path d="M10 43c3-1 6-1 9 0s6 1 9 0 5-1 7 0" strokeWidth="1.5" stroke="#E6A700" />
  </svg>
);

export const StatsBar: React.FC = () => {
  const products = [
    { icon: <HolidayPackagesIcon />, label: "Holiday Packages" },
    { icon: <FlightsIcon />, label: "Flights" },
    { icon: <HotelsIcon />, label: "Hotels" },
    { icon: <CorporateBookingsIcon />, label: "Corporate Bookings" },
    { icon: <CruisesIcon />, label: "Cruises" },
  ];

  return (
    <section className="relative -mt-2.5 sm:-mt-3.5 mb-3.5 sm:mb-4 z-20 max-w-6xl mx-auto px-4 sm:px-6">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-slate-200/90 text-slate-900 overflow-hidden">
        {/* LAPTOP & DESKTOP: Clean 5-Column Grid with Dashed Dividers */}
        <div className="hidden md:grid md:grid-cols-5 divide-x divide-dashed divide-slate-300 py-3 sm:py-3.5 px-2 items-stretch">
          {products.map((product) => (
            <div
              key={product.label}
              className="flex flex-col items-center justify-center text-center px-2 py-1.5 group cursor-default"
            >
              <div className="w-12 h-12 lg:w-13 lg:h-13 rounded-full bg-[#FFF9E6] border border-[#F5E0A0] flex items-center justify-center mb-2 shadow-2xs group-hover:scale-105 group-hover:bg-[#FFF3CD] transition-all duration-200">
                {product.icon}
              </div>
              <span className="text-[#0F294D] font-extrabold text-xs lg:text-sm leading-snug tracking-tight text-center px-1 max-w-[130px] mx-auto">
                {product.label}
              </span>
            </div>
          ))}
        </div>

        {/* MOBILE VIEW: All 5 services in one frame (no horizontal swipe) */}
        <div className="md:hidden p-2 sm:p-2.5">
          <div className="grid w-full grid-cols-5 divide-x divide-dashed divide-slate-300 items-stretch">
            {products.map((product) => {
              const words = product.label.split(" ");
              return (
                <div
                  key={product.label}
                  className="flex min-w-0 flex-col items-center justify-start text-center px-0.5 py-1"
                >
                  <div className="w-9 h-9 rounded-full bg-[#FFF9E6] border border-[#F5E0A0] flex items-center justify-center mb-1 shadow-2xs">
                    {product.icon}
                  </div>
                  <span className="text-[#0F294D] font-extrabold text-[9px] leading-tight tracking-tight break-words max-w-full">
                    {words.map((word, i) => (
                      <React.Fragment key={i}>
                        {word}
                        {i < words.length - 1 && <br />}
                      </React.Fragment>
                    ))}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
