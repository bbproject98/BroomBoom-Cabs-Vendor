"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { StatsBar } from "@/components/StatsBar";
import { PackagesSection } from "@/components/PackagesSection";
import { VendorOverview } from "@/components/VendorOverview";
import { WhyBroomBoom } from "@/components/WhyBroomBoom";
import { JourneySection } from "@/components/JourneySection";
import { TestimonialsSection } from "@/components/TestimonialsSection";
import { FaqSection } from "@/components/FaqSection";
import { Footer } from "@/components/Footer";
import { BrochureModal } from "@/components/BrochureModal";
import { FloatingCta } from "@/components/FloatingCta";
import { PwaInstallPrompt } from "@/components/PwaInstallPrompt";
import { VendorLoginModal } from "@/components/VendorLoginModal";

export default function Home() {
  const router = useRouter();
  const [isBrochureModalOpen, setIsBrochureModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<string>("gold");

  const handleOpenLoginModal = (packageId: string = "gold") => {
    setSelectedPackage(packageId);
    setIsLoginModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-puja-cream text-slate-900 selection:bg-brand-yellow selection:text-black font-sans">
      {/* Top Navbar */}
      <Navbar
        onOpenApplyModal={handleOpenLoginModal}
        onOpenBrochureModal={() => setIsBrochureModalOpen(true)}
      />

      {/* Main Content Sections in Exact Same Sequence as Franchise Page */}
      <main className="flex-1">
        {/* Hero Section with Banner */}
        <HeroSection
          selectedPackage={selectedPackage ?? "gold"}
          onOpenApplyModal={handleOpenLoginModal}
        />

        {/* The 3 Packages Section (Market Trends) */}
        <PackagesSection onSelectPackage={handleOpenLoginModal} />

        {/* What a BroomBoom Vendor Does & Services (Overview) */}
        <VendorOverview />

        {/* Scaled Network Stats Bar (Overlapping Dark Section) */}
        <StatsBar />

        {/* Why BroomBoom (6 Full-Bleed Benefit Cards) */}
        <WhyBroomBoom onOpenApplyModal={handleOpenLoginModal} />

        {/* Begin Your Journey Now (4-Step Onboarding Roadmap) */}
        <JourneySection onOpenApplyModal={handleOpenLoginModal} />

        {/* Words from our Partners (Success Stories) */}
        <TestimonialsSection onOpenApplyModal={handleOpenLoginModal} />

        {/* Comprehensive FAQ Accordion */}
        <FaqSection onContactClick={() => handleOpenLoginModal("gold")} />
      </main>

      {/* Corporate & Legal Footer */}
      <Footer
        onOpenApplyModal={handleOpenLoginModal}
        onOpenBrochureModal={() => setIsBrochureModalOpen(true)}
      />

      {/* PWA Smart Auto-Install Mobile Banner & Event Handler */}
      <PwaInstallPrompt />

      {/* Sticky Mobile Conversion Bar */}
      <FloatingCta onApplyClick={() => handleOpenLoginModal(selectedPackage)} />

      {/* Fast-Track Partner Login & Lead Registration Modal */}
      <VendorLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        defaultPackage={selectedPackage}
      />

      {/* Official Brochure Prospectus Modal */}
      <BrochureModal
        isOpen={isBrochureModalOpen}
        onClose={() => setIsBrochureModalOpen(false)}
      />
    </div>
  );
}
