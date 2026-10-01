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

/**
 * Single client-side shell for the homepage so the "Check Availability"
 * dialog's open/close state can be shared between the header CTA, hero
 * CTA, and mobile bottom bar without prop-drilling through the server
 * page component. app/page.tsx itself stays a Server Component so
 * metadata/SEO export correctly — it fetches faqs/reviews/gallery from
 * Firestore and passes them down here.
 */
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
  const openInquiry = () => setInquiryOpen(true);

  return (
    <>
      <SplashIntro />
      <SiteHeader onCheckAvailability={openInquiry} />

      <main className="flex-1 pb-20 md:pb-0">
        <Hero onCheckAvailability={openInquiry} aboutText={venueInfo.aboutText} />
        <Pillars venueInfo={venueInfo} />
        <FacilitiesServices services={services} facilities={facilities} />
        <GallerySection categories={galleryCategories} images={galleryImages} />
        <VirtualTourSlot tour={tour} />
        <ReviewsSection reviews={reviews} />
        <FaqAccordion faqs={faqs} />
        <ContactSection />
      </main>

      <SiteFooter />
      <MobileBottomBar onCheckAvailability={openInquiry} />
      <InquiryDialog open={inquiryOpen} onOpenChange={setInquiryOpen} />
    </>
  );
}
