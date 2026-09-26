"use client";

import React, { useState } from "react";
import Link from "next/link";
import { FAQ_ITEMS } from "@/data/vendorData";
import { ChevronDown, HelpCircle, PhoneCall } from "lucide-react";

interface FaqSectionProps {
  onContactClick?: () => void;
}

export const FaqSection: React.FC<FaqSectionProps> = ({ onContactClick }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const categories = ["All", "General", "Attachment", "Operations", "Earnings"];

  const filteredFaqs =
    selectedCategory === "All"
      ? FAQ_ITEMS
      : FAQ_ITEMS.filter((item) => {
          if (selectedCategory === "Attachment") return item.category === "Attachment" || item.category === "Documents";
          if (selectedCategory === "Operations") return item.category === "Fleet Ops" || item.category === "Operations";
          if (selectedCategory === "Earnings") return item.category === "Payouts" || item.category === "Earnings";
          return item.category === selectedCategory;
        });

  const toggleFaq = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-5 sm:py-6 bg-puja-cream text-slate-900 relative border-t border-amber-200/80">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-3 sm:mb-4">
          <div className="inline-flex items-center gap-2 bg-white border border-amber-300 text-amber-900 font-bold text-xs px-3 py-1 rounded-full uppercase tracking-wider mb-1.5 shadow-sm">
            <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
            Clear Answers
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-950 tracking-tight">
            Frequently Asked <span className="text-yellow-gradient">Questions</span>
          </h2>
          <p className="mt-1.5 text-sm sm:text-base text-slate-600">
            Have questions before applying? Here are answers to common questions about our 3 packages, investments, and daily operations.
          </p>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-3">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setOpenIndex(0);
              }}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                selectedCategory === cat
                  ? "bg-brand-yellow text-black shadow-sm"
                  : "bg-white text-slate-700 border border-amber-200 hover:border-amber-400"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Accordion List */}
        <div className="space-y-2">
          {filteredFaqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-amber-200 overflow-hidden shadow-sm transition-all duration-200"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full text-left px-4 sm:px-6 py-3 sm:py-3.5 flex items-center justify-between gap-3 sm:gap-4 font-bold text-slate-900 text-sm sm:text-base hover:text-amber-800 transition-colors"
                >
                  <span>{faq.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-amber-600" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-4 sm:px-6 pb-3 sm:pb-4 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-amber-100 bg-amber-50/20">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Still have questions banner */}
        <div className="mt-4 sm:mt-5 bg-white rounded-2xl p-3.5 sm:p-4 border border-amber-200 text-center space-y-2 shadow-sm">
          <p className="text-xs sm:text-sm font-bold text-slate-900">
            Still have specific questions about your city or territory exclusivity?
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <a
              href="tel:62899524182706600"
              className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-amber-900 border border-slate-300 px-3.5 sm:px-4 py-2 rounded-xl"
            >
              <PhoneCall className="w-3.5 h-3.5 text-amber-600" />
              Call Hotline: 6289952418-BROOM-BOOM
            </a>
            <Link
              href="/apply?package=gold"
              className="inline-flex items-center gap-2 bg-brand-yellow hover:bg-brand-yellow-hover text-black text-xs font-black px-4 sm:px-5 py-2.5 rounded-xl transition-all shadow-sm"
            >
              Apply for Vendor Partner Online &rarr;
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
