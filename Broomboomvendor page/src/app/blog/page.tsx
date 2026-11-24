"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock,
  MapPin,
  Search,
  Sparkles,
  User,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { VendorLoginModal } from "@/components/VendorLoginModal";
import { BrochureModal } from "@/components/BrochureModal";
import { FloatingCta } from "@/components/FloatingCta";
import { BLOG_CATEGORIES, BLOG_POSTS } from "@/data/blogPosts";

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isBrochureModalOpen, setIsBrochureModalOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState("gold");

  const handleOpenLoginModal = (packageId: string = "gold") => {
    setSelectedPackage(packageId);
    setIsLoginModalOpen(true);
  };

  const featuredPost = useMemo(
    () => BLOG_POSTS.find((post) => post.featured) || BLOG_POSTS[0],
    []
  );

  const filteredPosts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return BLOG_POSTS.filter((post) => {
      const matchesCategory =
        selectedCategory === "All" || post.category === selectedCategory;
      const matchesSearch =
        !q ||
        post.title.toLowerCase().includes(q) ||
        post.excerpt.toLowerCase().includes(q) ||
        post.cityFocus.toLowerCase().includes(q) ||
        post.category.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);
  return (
    <div className="min-h-screen flex flex-col bg-puja-cream text-slate-900 selection:bg-brand-yellow selection:text-black font-sans">
      <Navbar
        onOpenApplyModal={handleOpenLoginModal}
        onOpenBrochureModal={() => setIsBrochureModalOpen(true)}
      />

      <main className="flex-1 pb-20 md:pb-8">
        {/* Hero Header */}
        <section className="relative overflow-hidden bg-puja-gradient-hero border-b border-amber-200/70 py-12 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold uppercase tracking-wider mb-4 shadow-sm">
              <BookOpen className="w-3.5 h-3.5 text-amber-700" />
              <span>BroomBoom Vendor Knowledge Hub</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight mb-4">
              Fleet Growth <span className="text-yellow-gradient">Playbooks &amp; Insights</span>
            </h1>
            <p className="max-w-2xl mx-auto text-sm sm:text-lg text-slate-600 mb-7">
              Practical strategies on pincode-wise dispatch, airport kiosk utilization, outstation return-leg profits, and 0% commission corporate fleet scaling across India.
            </p>

            {/* Search Input */}
            <div className="max-w-xl mx-auto relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles by city, commission, airport, outstation..."
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white border border-amber-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-yellow shadow-sm"
              />
            </div>
          </div>
        </section>

        {/* Featured Story */}
        {selectedCategory === "All" && !searchQuery.trim() && featuredPost && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-10">
            <Link
              href={`/blog/${featuredPost.slug}`}
              className="group grid grid-cols-1 lg:grid-cols-12 rounded-3xl overflow-hidden bg-white border border-amber-200 shadow-card hover:shadow-card-hover transition-all duration-300"
            >
              <div className="relative h-64 sm:h-80 lg:h-auto lg:col-span-6 overflow-hidden">
                <Image
                  src={featuredPost.image}
                  alt={featuredPost.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  priority
                />
                <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 bg-slate-950/90 text-amber-400 border border-amber-400/50 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider">
                  <Sparkles className="w-3 h-3" />
                  <span>Featured Playbook</span>
                </div>
              </div>

              <div className="lg:col-span-6 p-6 sm:p-8 flex flex-col justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-amber-800 mb-3">
                    <span className="bg-amber-100 border border-amber-300 px-2.5 py-0.5 rounded-full">
                      {featuredPost.category}
                    </span>
                    <span className="text-slate-400">&bull;</span>
                    <span className="inline-flex items-center gap-1 text-slate-600">
                      <MapPin className="w-3.5 h-3.5 text-amber-600" />
                      {featuredPost.cityFocus}
                    </span>
                    <span className="text-slate-400">&bull;</span>
                    <span className="inline-flex items-center gap-1 text-slate-600">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      {featuredPost.readTime}
                    </span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-black text-slate-950 group-hover:text-amber-700 transition-colors leading-snug mb-3">
                    {featuredPost.title}
                  </h2>

                  <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-5">
                    {featuredPost.excerpt}
                  </p>

                  <ul className="space-y-2 mb-6">
                    {featuredPost.keyTakeaways.map((point) => (
                      <li
                        key={point}
                        className="flex items-start gap-2 text-xs sm:text-sm text-slate-700"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-2 text-xs text-slate-600 font-semibold">
                    <User className="w-4 h-4 text-amber-600" />
                    <span>{featuredPost.author}</span>
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-sm font-black text-amber-800 group-hover:translate-x-1 transition-transform">
                    <span>Read Full Article</span>
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </Link>
          </section>
        )}

        {/* Category Filter Tabs + Posts Grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div className="flex flex-wrap items-center gap-2">
              {BLOG_CATEGORIES.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    selectedCategory === category
                      ? "bg-brand-yellow text-slate-950 shadow-sm font-black"
                      : "bg-white text-slate-700 border border-amber-200 hover:border-amber-400"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
            <span className="text-xs font-bold text-slate-500">
              Showing {filteredPosts.length} article{filteredPosts.length === 1 ? "" : "s"}
            </span>
          </div>

          {filteredPosts.length === 0 ? (
            <div className="bg-white border border-amber-200 rounded-2xl p-10 text-center">
              <p className="text-base font-bold text-slate-900 mb-2">
                No articles match &ldquo;{searchQuery}&rdquo;
              </p>
              <p className="text-xs text-slate-500 mb-4">
                Try clearing your search or switching category tabs above.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("All");
                }}
                className="px-4 py-2 rounded-xl bg-brand-yellow text-slate-950 font-black text-xs cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group flex flex-col justify-between rounded-2xl bg-white border border-amber-200/90 hover:border-brand-yellow overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-200"
                >
                  <div>
                    <div className="relative h-48 w-full overflow-hidden">
                      <Image
                        src={post.image}
                        alt={post.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm text-amber-900 border border-amber-300 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full">
                        {post.category}
                      </span>
                    </div>

                    <div className="p-5">
                      <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold mb-2">
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-amber-600" />
                          {post.cityFocus}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-600" />
                          {post.readTime}
                        </span>
                      </div>

                      <h3 className="text-lg font-black text-slate-950 group-hover:text-amber-700 transition-colors leading-snug mb-2">
                        {post.title}
                      </h3>

                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-3">
                        {post.excerpt}
                      </p>
                    </div>
                  </div>

                  <div className="px-5 py-3.5 border-t border-slate-100 flex items-center justify-between text-xs font-black text-slate-900 bg-puja-cream/50">
                    <span className="text-slate-500 font-semibold">
                      {post.publishedAt}
                    </span>
                    <span className="inline-flex items-center gap-1 text-amber-800 group-hover:translate-x-0.5 transition-transform">
                      <span>Read Guide</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Bottom Partner CTA Banner */}
          <div className="mt-12 rounded-3xl bg-slate-950 text-white p-6 sm:p-10 border border-amber-400/40 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <span className="inline-block bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full mb-2">
                Ready to Launch Your Hub?
              </span>
              <h3 className="text-2xl sm:text-3xl font-black tracking-tight">
                Lock In Your City Territory With Silver, Gold, or Platinum
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
                Connect with our onboarding desk to verify pincode availability and activate daily automated bookings on your fleet.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleOpenLoginModal("gold")}
              className="shrink-0 inline-flex items-center gap-2 bg-brand-yellow hover:bg-brand-yellow-hover text-slate-950 font-black text-sm px-6 py-3.5 rounded-xl shadow-yellow-glow transition-all cursor-pointer"
            >
              <span>Apply as a Vendor Partner</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>
      </main>

      <Footer
        onOpenApplyModal={handleOpenLoginModal}
        onOpenBrochureModal={() => setIsBrochureModalOpen(true)}
      />

      <FloatingCta onApplyClick={() => handleOpenLoginModal("gold")} />

      <VendorLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        defaultPackage={selectedPackage}
      />

      <BrochureModal
        isOpen={isBrochureModalOpen}
        onClose={() => setIsBrochureModalOpen(false)}
      />
    </div>
  );
}
