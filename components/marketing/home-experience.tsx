"use client";

import { useState } from "react";
import { SplashIntro } from "@/components/layout/splash-intro";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { MobileBottomBar } from "@/components/layout/mobile-bottom-bar";
import { InquiryDialog } from "@/components/inquiry/inquiry-dialog";
import { Hero } from "@/components/marketing/hero";
import { Pillars } from "@/components/marketing/pillars";
import { FacilitiesServices } from "@/components/marketing/facilities-services";
import { ContactSection } from "@/components/marketing/contact-section";
import { FaqAccordion } from "@/components/faq/faq-accordion";
import { ReviewsSection } from "@/components/reviews/reviews-section";
import { GallerySection } from "@/components/gallery/gallery-section";
import { VirtualTourSlot } from "@/components/marketing/virtual-tour-slot";
import type { VenueInfo } from "@/types/venue";
import type { Faq } from "@/types/faq";
import type { Review } from "@/types/review";
import type { GalleryCategory, GalleryImage } from "@/types/gallery";

export function HomeExperience({
  faqs,
  reviews,
  galleryCategories,
  galleryImages,
  services,
  facilities,
  tour,
  venueInfo,
}: {
  faqs: Faq[];
  reviews: Review[];
  galleryCategories: GalleryCategory[];
  galleryImages: GalleryImage[];
  services: { id: string; name: string; description: string }[];
  facilities: { id: string; name: string; note: string; chargeable: boolean }[];
  tour: { type: "youtube" | "video"; url: string } | null;
  venueInfo: VenueInfo;
}) {
  const [inquiryOpen, setInquiryOpen] = useState(false);
  const [inquiryMode, setInquiryMode] = useState<"quote" | "visit">("quote");
  const openInquiry = () => {
    setInquiryMode("quote");
    setInquiryOpen(true);
  };
  const openVisitRequest = () => {
    setInquiryMode("visit");
    setInquiryOpen(true);
  };

  return (
    <>
      <SplashIntro />
      <SiteHeader onCheckAvailability={openInquiry} />

      <main className="flex-1 pb-20 md:pb-0">
        <Hero
          onCheckAvailability={openInquiry}
          aboutText={venueInfo.aboutText}
          priceRangeText={venueInfo.priceRangeText}
          backgroundImages={galleryImages.filter((i) => i.featured).map((i) => i.secureUrl)}
        />
        <GallerySection categories={galleryCategories} images={galleryImages} />
        <Pillars venueInfo={venueInfo} />
        <FacilitiesServices services={services} facilities={facilities} />
        <VirtualTourSlot tour={tour} />
        <ReviewsSection reviews={reviews} />
        <FaqAccordion faqs={faqs} />
        <ContactSection onScheduleVisit={openVisitRequest} />
      </main>

      <SiteFooter />
      <MobileBottomBar onCheckAvailability={openInquiry} />
      <InquiryDialog open={inquiryOpen} onOpenChange={setInquiryOpen} mode={inquiryMode} />
    </>
  );
}