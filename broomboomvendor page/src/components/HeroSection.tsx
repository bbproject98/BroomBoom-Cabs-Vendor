"use client";

import React from "react";
import Image from "next/image";

interface HeroSectionProps {
  selectedPackage?: string;
  selectedTier?: string;
  onApplySuccess?: (data?: any) => void;
  onOpenApplyModal?: (packageId?: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  selectedPackage = "gold",
  selectedTier = "gold",
  onOpenApplyModal,
}) => {
  const targetId = selectedPackage || selectedTier || "gold";

  return (
    <section className="relative w-full">
      <div
        onClick={() => onOpenApplyModal?.(targetId)}
        className="block relative cursor-pointer"
        title="Click to Apply for BroomBoom Vendor Partner"
      >
        {/* Laptop & Desktop View */}
        <div className="hidden md:block relative w-full">
          <Image
            src="/hero-banner-v2.png"
            alt="Let's Make Travel Dreams Come True Together! Become a Proud Broom Boom Cabs Vendor Partner Today"
            width={1920}
            height={600}
            className="w-full h-auto object-cover"
            priority
          />
        </div>

        {/* Mobile View: Dedicated clean mobile banner matching reference screenshot */}
        <div className="md:hidden relative w-full overflow-hidden bg-[#7dc3db]">
          <Image
            src="/hero-banner-mobile-v2.png"
            alt="Let's Make Travel Dreams Come True Together! Become a Proud Broom Boom Cabs Vendor Partner Today"
            width={920}
            height={616}
            className="w-full h-auto object-cover"
            priority
          />
        </div>
      </div>
    </section>
  );
};
