"use client";

import React, { useState } from "react";
import { Phone, Plus, Minus } from "lucide-react";

interface FaqSectionProps {
  onContactClick?: () => void;
  cityName?: string;
}

export const FaqSection: React.FC<FaqSectionProps> = ({
  onContactClick,
}) => {
  // ReviewsPage FAQ accordion state
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <section
      id="faqs"
      className="bg-[#F8FAFC] py-16 border-t border-slate-200"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-3 gap-12">
        {/* Left Sticky Column */}
        <div className="md:sticky md:top-28 md:self-start">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            Frequently Asked Questions About Cab Vendor Registration
          </h2>
          <p className="text-slate-600 text-sm mb-8">
            Find answers to common questions about onboarding, earnings, and
            operational policies.
          </p>

          <div className="bg-white rounded-2xl p-4 border border-slate-200 flex items-center gap-4 hover:shadow-md transition-shadow mb-6">
            <div className="w-10 h-10 rounded-full bg-[#FBBF24]/20 text-[#D97706] flex items-center justify-center shrink-0">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500">
                Still have a question? Call
              </p>
              <a
                href="tel:+916289952418"
                className="text-sm font-bold text-slate-900 hover:underline"
              >
                +91 6289952418, any time.
              </a>
            </div>
          </div>

          <div className="bg-[#111111] text-white rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#FBBF24] opacity-10 blur-2xl rounded-full" />
            <h3 className="font-bold text-lg mb-2 relative z-10">
              Join BroomBoom and grow your cab business with more booking
              opportunities across India.
            </h3>
            <button
              onClick={() => onContactClick?.()}
              className="mt-4 bb-btn-shine bg-[#FBBF24] text-black px-4 py-2 rounded-xl text-sm font-bold w-full hover:bg-yellow-500 transition-colors relative z-10"
            >
              Register as a Vendor
            </button>
          </div>
        </div>

        {/* Right Scrollable Column — 24-item accordion */}
        <div className="md:col-span-2 space-y-2">
          {[
            {
              q: "How can I attach my car to a cab company?",
              a: (
                <div className="space-y-2">
                  <p>
                    You can register your travel agency, fleet or individual
                    vehicle through the BroomBoom Vendor Portal. Visit{" "}
                    <a
                      href="https://vendor.broomboomcabs.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      vendor.broomboomcabs.com
                    </a>{" "}
                    and complete the vendor registration process with your
                    business, vehicle and contact details.
                  </p>
                  <p>
                    Individual cab owners and drivers can also register
                    without owning a travel agency.
                  </p>
                </div>
              ),
            },
            {
              q: " Can I join a cab booking company with one car?",
              a: (
                <div className="space-y-2">
                  <p>
                    You may be required to submit the following documents for
                    verification:
                  </p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Aadhaar Card or valid identity proof</li>
                    <li>PAN Card</li>
                    <li>Agency or business details (if applicable)</li>
                    <li>Vehicle Registration Certificate (RC)</li>
                    <li>Valid vehicle insurance</li>
                    <li>Fitness Certificate and Permit, as applicable</li>
                    <li>Pollution Under Control (PUC) Certificate</li>
                    <li>Driving Licence of the assigned driver</li>
                    <li>Bank account details for payment settlements</li>
                    <li>Vehicle photographs, if requested</li>
                  </ul>
                  <p>All documents must be valid and legible for verification.</p>
                </div>
              ),
            },
            {
              q: "Can individual drivers register as vendors?",
              a: "Yes. BroomBoom welcomes individual vehicle owners, independent drivers, travel agencies and fleet operators. You do not necessarily need to own a large fleet or operate a registered travel agency to explore vendor opportunities.",
            },
            {
              q: "How can taxi operators get outstation bookings?",
              a: "Approval time depends on document verification and the completeness of the submitted information. Our team may contact you if any additional documents or clarification are required.",
            },
            {
              q: "What commission does BroomBoom charge?",
              a: "You can access booking opportunities once your vendor account and relevant vehicle/driver details have been verified and approved. Booking acceptance is subject to vehicle category, availability, service location and applicable platform requirements.",
            },
            {
              q: "How long does vendor verification take?",
              a: (
                <div className="space-y-2">
                  <p>
                    BroomBoom Vendor provides business opportunities across
                    multiple travel categories, including:
                  </p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Outstation one-way trips</li>
                    <li>Outstation round trips</li>
                    <li>Local hourly rentals</li>
                    <li>Airport pickup and drop</li>
                    <li>Corporate transportation</li>
                    <li>Sightseeing and tour packages</li>
                    <li>
                      Special travel requirements, including pet-friendly
                      bookings where applicable
                    </li>
                  </ul>
                </div>
              ),
            },
            {
              q: "Can I register multiple vehicles?",
              a: "Eligible vendors can access booking opportunities through the BroomBoom Vendor Portal. Booking details, including pickup location, destination, travel date, vehicle category and applicable vendor fare, are provided for evaluation before accepting a trip.",
            },
            {
              q: "Can I work with other cab companies?",
              a: "Your earnings depend on the number of bookings completed, vehicle category, route, distance, trip type and applicable vendor fare. You can increase your earning potential by keeping your vehicle available and accepting suitable booking opportunities.",
            },
            {
              q: "What is the payment structure for vendor bookings?",
              a: "The applicable vendor payment and settlement terms are communicated for the respective booking. Vendors should review the trip fare and payment instructions before accepting a booking.",
            },
            {
              q: "Can I charge night charges separately from the customer?",
              a: "Yes. Night charges are payable separately wherever applicable, as per the booking terms and agreed rate. Vendors and drivers should verify the applicable night-charge conditions before accepting the booking and collect the eligible amount accordingly.",
            },
            {
              q: "Are toll charges included in the vendor booking price?",
              a: "Toll charges are payable separately by the customer/vendor arrangement, as applicable to the booking. Drivers can collect applicable toll charges separately based on actual toll expenses and valid receipts. Always check the individual booking instructions before starting the trip.",
            },
            {
              q: "Are state taxes and permits included in the booking fare?",
              a: "State taxes, permit charges, border taxes and other applicable government fees may be additional depending on the route and booking terms. These should be handled as specified in the booking details and supported by valid receipts wherever applicable.",
            },
            {
              q: "Can I collect parking charges from customers?",
              a: "Yes. Actual parking charges, airport parking fees and other applicable parking expenses can be collected separately wherever they are excluded from the agreed booking fare. Valid receipts should be provided whenever available.",
            },
            {
              q: "What happens if a customer requests extra kilometres?",
              a: "If a customer travels beyond the included kilometre limit, applicable extra-kilometre charges can be collected as per the rate specified in the booking. Drivers should maintain accurate trip kilometre records and report the additional distance through the prescribed process.",
            },
            {
              q: "Can I refuse a booking after accepting it?",
              a: "Once a booking is accepted, vendors are expected to fulfil the commitment. Unjustified cancellations, driver unavailability or failure to report at the pickup location may result in penalties or other action as per BroomBoom's vendor agreement and policies.",
            },
            {
              q: "What happens if my vehicle breaks down before the trip?",
              a: "Immediately inform the BroomBoom operations team. Vendors are expected to arrange a suitable replacement vehicle of the same or an approved higher category, subject to customer approval and BroomBoom's confirmation. Failure to arrange an alternative may attract applicable penalties.",
            },
            {
              q: "Can I send a different driver for an accepted booking?",
              a: "Only an approved and eligible driver should operate the assigned vehicle. Any driver replacement must be communicated to and approved by BroomBoom before the trip. Sending an unauthorised driver may result in booking cancellation or vendor account action.",
            },
            {
              q: "Can I send a different vehicle instead of the assigned vehicle?",
              a: "Vehicle substitution is subject to prior approval from BroomBoom and, wherever required, customer consent. The replacement vehicle must meet or exceed the agreed vehicle category and service standards.",
            },
            {
              q: "What if the customer changes the pickup location or destination?",
              a: "Any change in pickup location, destination, route or trip duration should be communicated to the BroomBoom operations team. Additional distance or expenses will be handled according to the applicable booking terms.",
            },
            {
              q: "When will I receive customer and trip details?",
              a: "Eligible trip and customer details are shared through the prescribed booking communication process. Drivers should verify the pickup location, contact information and trip instructions before reporting for duty.",
            },
            {
              q: "Does BroomBoom Vendor panel provide regular booking opportunities?",
              a: "BroomBoom vendor is India's largest online vendor and driver network web portal that operates across multiple travel categories and locations in India. Booking opportunities depend on customer demand, vendor availability, vehicle category, location and operational requirements. We do not guarantee a fixed number of bookings or daily earnings.",
            },
            {
              q: "Can I work with other cab companies while attached to BroomBoom Vendor?",
              a: "Yes, unless a separate written agreement specifies exclusivity. However, once you accept a BroomBoom booking, you must honour that commitment and must not divert the customer or booking to another platform.",
            },
            {
              q: "What are the responsibilities of a BroomBoom vendor?",
              a: (
                <div className="space-y-2">
                  <p>Every vendor is responsible for:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Maintaining vehicles in good and hygienic condition.</li>
                    <li>Providing valid vehicle and driver documents.</li>
                    <li>Ensuring drivers hold valid driving licences.</li>
                    <li>Reporting on time for every accepted booking.</li>
                    <li>Maintaining professional behaviour with customers.</li>
                    <li>
                      Following traffic rules and applicable transport
                      regulations.
                    </li>
                    <li>Not demanding unauthorised additional payments.</li>
                    <li>
                      Completing accepted trips without unauthorised
                      cancellations.
                    </li>
                    <li>
                      Reporting complaints, accidents or trip-related issues
                      immediately.
                    </li>
                  </ul>
                </div>
              ),
            },
            {
              q: "How can I contact BroomBoom for vendor support?",
              a: "For vendor registration, booking assistance, payment-related queries or operational support, please contact the BroomBoom vendor support team through the Vendor Portal or the official communication channels shared during registration.",
            },
          ].map((faq, idx) => (
            <div
              key={idx}
              className="bg-transparent border-b border-slate-200 py-2"
            >
              {/* ✅ FAQ question now rendered in an <h3> */}
              <h3 className="m-0">
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  aria-expanded={openFaq === idx}
                  className="w-full flex items-center justify-between py-4 text-left text-base font-bold text-slate-900 hover:text-blue-600 transition-colors"
                >
                  <span>{faq.q}</span>
                  <div
                    className={`w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center shrink-0 transition-all duration-300 ${
                      openFaq === idx ? "rotate-180 bg-[#FBBF24]/30" : ""
                    }`}
                  >
                    {openFaq === idx ? (
                      <Minus className="w-4 h-4" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                  </div>
                </button>
              </h3>
              <div
                className={`grid transition-all duration-300 ease-out ${
                  openFaq === idx
                    ? "grid-rows-[1fr] opacity-100"
                    : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden">
                  <div className="pb-4 text-sm text-slate-600 leading-relaxed pr-8">
                    {faq.a}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};