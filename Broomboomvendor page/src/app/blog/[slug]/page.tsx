"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  MapPin,
  User,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { VendorLoginModal } from "@/components/VendorLoginModal";
import { BrochureModal } from "@/components/BrochureModal";
import { FloatingCta } from "@/components/FloatingCta";
import { BLOG_POSTS, getBlogPostBySlug } from "@/data/blogPosts";

interface BlogArticlePageProps {
  params: {
    slug: string;
  };
}

export default function BlogArticlePage({ params }: BlogArticlePageProps) {
  const post = getBlogPostBySlug(params.slug);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isBrochureModalOpen, setIsBrochureModalOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState("gold");

  if (!post) {
    notFound();
  }

  const handleOpenLoginModal = (packageId: string = "gold") => {
    setSelectedPackage(packageId);
    setIsLoginModalOpen(true);
  };

  const relatedPosts = BLOG_POSTS.filter((item) => item.slug !== post.slug).slice(
    0,
    3
  );

  return (
    <div className="min-h-screen flex flex-col bg-puja-cream text-slate-900 selection:bg-brand-yellow selection:text-black font-sans">
      <Navbar
        onOpenApplyModal={handleOpenLoginModal}
        onOpenBrochureModal={() => setIsBrochureModalOpen(true)}
      />

      <main className="flex-1 pb-20 md:pb-10">
        <article className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 hover:text-amber-950 mb-5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Vendor Guides</span>
          </Link>

          <div className="flex flex-wrap items-center gap-2.5 text-xs font-bold text-amber-900 mb-3">
            <span className="bg-amber-100 border border-amber-300 px-3 py-1 rounded-full">
              {post.category}
            </span>
            <span className="inline-flex items-center gap-1 text-slate-600">
              <MapPin className="w-3.5 h-3.5 text-amber-600" />
              {post.cityFocus}
            </span>
            <span className="inline-flex items-center gap-1 text-slate-600">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              {post.readTime}
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-slate-950 tracking-tight leading-tight mb-4">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 pb-6 border-b border-amber-200/80 mb-6">
            <span className="inline-flex items-center gap-1.5 font-bold text-slate-900">
              <User className="w-4 h-4 text-amber-600" />
              {post.author}
            </span>
            <span>&bull;</span>
            <span>{post.authorRole}</span>
            <span>&bull;</span>
            <span>{post.publishedAt}</span>
          </div>

          <div className="relative h-64 sm:h-96 w-full rounded-3xl overflow-hidden border border-amber-200 shadow-card mb-8">
            <Image
              src={post.image}
              alt={post.title}
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* Key Takeaways Box */}
          <div className="rounded-2xl bg-amber-50/90 border border-amber-300 p-5 sm:p-6 mb-8">
            <h2 className="text-sm font-black uppercase tracking-wider text-amber-950 mb-3">
              Key Takeaways
            </h2>
            <ul className="space-y-2.5">
              {post.keyTakeaways.map((point) => (
                <li
                  key={point}
                  className="flex items-start gap-2.5 text-sm text-slate-800 font-medium"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Article Body Sections */}
          <div className="space-y-7 bg-white rounded-3xl border border-amber-200/80 p-6 sm:p-8 shadow-sm">
            {post.sections.map((section) => (
              <section key={section.heading} className="space-y-3">
                <h2 className="text-xl sm:text-2xl font-black text-slate-950">
                  {section.heading}
                </h2>
                {section.paragraphs.map((paragraph) => (
                  <p
                    key={paragraph}
                    className="text-sm sm:text-base text-slate-700 leading-relaxed"
                  >
                    {paragraph}
                  </p>
                ))}
              </section>
            ))}

            <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-black text-slate-950">
                  Start Earning With BroomBoom Cabs Vendor Network
                </h3>
                <p className="text-xs text-slate-600">
                  Check Silver, Gold, or Platinum partner availability for your pincode.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleOpenLoginModal("gold")}
                className="inline-flex items-center gap-2 bg-brand-yellow hover:bg-brand-yellow-hover text-slate-950 font-black text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-sm transition-all cursor-pointer"
              >
                <span>JOIN NOW</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </article>

        {/* Related Guides */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-12">
          <h2 className="text-xl sm:text-2xl font-black text-slate-950 mb-5">
            More Vendor Playbooks
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {relatedPosts.map((item) => (
              <Link
                key={item.slug}
                href={`/blog/${item.slug}`}
                className="group bg-white rounded-2xl border border-amber-200 hover:border-brand-yellow p-5 shadow-sm hover:shadow-card transition-all flex flex-col justify-between"
              >
                <div>
                  <span className="inline-block text-[10px] font-black uppercase bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full mb-2">
                    {item.category}
                  </span>
                  <h3 className="text-base font-black text-slate-950 group-hover:text-amber-700 transition-colors mb-2">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-600 line-clamp-2">
                    {item.excerpt}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-amber-800">
                  <span>{item.readTime}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>
            ))}
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
