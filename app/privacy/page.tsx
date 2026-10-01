import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { getBusinessSettings } from "@/services/public-content.service";

/**
 * Incremental revalidation: the page is served statically (fast) but
 * regenerated in the background at most once a minute, so edits the
 * owner makes in /admin appear on the public site within ~60 seconds
 * without a redeploy.
 */
export const revalidate = 60;

export const metadata: Metadata = {
  title: "Privacy Policy",
  alternates: { canonical: `${siteConfig.url}/privacy` },
};

export default async function PrivacyPage() {
  const settings = await getBusinessSettings();
  return (
    <div className="mx-auto max-w-2xl px-6 py-20 sm:px-8">
      <h1 className="font-heading text-3xl text-vrind-text-primary">Privacy Policy</h1>
      <p className="mt-2 text-sm text-vrind-text-muted">Last updated: 2026</p>

      <div className="mt-8 space-y-6 text-sm leading-relaxed text-vrind-text-secondary">
        <p>
          {siteConfig.name} (&ldquo;we&rdquo;, &ldquo;us&rdquo;) operates this
          website to showcase our venue, restaurant and catering services, and
          to receive event inquiries from prospective customers.
        </p>

        <div>
          <h2 className="font-heading mb-2 text-lg text-vrind-text-primary">
            What information we collect
          </h2>
          <p>
            When you submit the &ldquo;Check Availability &amp; Get a
            Quote&rdquo; form, we collect your name, phone number, event
            details (type, date, guest count, requirements) and any message
            you choose to add.
          </p>
        </div>

        <div>
          <h2 className="font-heading mb-2 text-lg text-vrind-text-primary">
            Why we collect it
          </h2>
          <p>
            Solely to respond to your event inquiry — to confirm availability,
            discuss your requirements, and share pricing for your event.
          </p>
        </div>

        <div>
          <h2 className="font-heading mb-2 text-lg text-vrind-text-primary">
            How we use it
          </h2>
          <p>
            Your inquiry is stored securely and is visible only to authorized
            Vrind Vatikaa staff. We may contact you by phone or WhatsApp using
            the number you provide. We do not sell or share your information
            with third parties for marketing purposes.
          </p>
        </div>

        <div>
          <h2 className="font-heading mb-2 text-lg text-vrind-text-primary">
            No account, no public data
          </h2>
          <p>
            This website does not require you to create an account. Your
            inquiry details are never publicly visible on the website.
          </p>
        </div>

        <div>
          <h2 className="font-heading mb-2 text-lg text-vrind-text-primary">
            Contact us
          </h2>
          <p>
            For questions about this policy or your data, contact us at{" "}
            {settings.email} or {settings.phone}.
          </p>
        </div>
      </div>

      <Link href="/" className="mt-10 inline-block text-sm text-vrind-gold hover:text-vrind-gold-bright">
        ← Back to home
      </Link>
    </div>
  );
}
