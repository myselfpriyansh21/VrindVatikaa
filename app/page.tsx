import type { Metadata } from "next";
import { HomeExperience } from "@/components/marketing/home-experience";
import { LocalBusinessJsonLd } from "@/components/shared/json-ld";
import { getPublishedFaqs, getPublishedReviews, getPublishedGallery, getPublishedServices, getPublishedFacilities, getBusinessSettings, getVirtualTour, getVenueInfo } from "@/services/public-content.service";
import { siteConfig } from "@/config/site";

/**
 * Incremental revalidation: the page is served statically (fast) but
 * regenerated in the background at most once a minute, so edits the
 * owner makes in /admin appear on the public site within ~60 seconds
 * without a redeploy.
 */
export const revalidate = 60;

export const metadata: Metadata = {
  title: `${siteConfig.name} | Banquet Hall & Lawn in Telibagh, Lucknow`,
  description: siteConfig.description,
  alternates: { canonical: siteConfig.url },
};

export default async function HomePage() {
  const [faqs, reviews, gallery, services, facilities, settings, tour, venueInfo] = await Promise.all([
    getPublishedFaqs(),
    getPublishedReviews(),
    getPublishedGallery(),
    getPublishedServices(),
    getPublishedFacilities(),
    getBusinessSettings(),
    getVirtualTour(),
    getVenueInfo(),
  ]);

  return (
    <>
      <LocalBusinessJsonLd settings={settings} />
      <HomeExperience
        faqs={faqs}
        reviews={reviews}
        galleryCategories={gallery.categories}
        galleryImages={gallery.images}
        services={services}
        facilities={facilities}
        tour={tour}
        venueInfo={venueInfo}
      />
    </>
  );
}
