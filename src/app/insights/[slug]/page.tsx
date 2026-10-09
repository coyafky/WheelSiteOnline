import type { Metadata } from "next";
import { draftMode } from "next/headers";
import { notFound } from "next/navigation";
import { guides } from "@/content/resources";
import { ProseArticle } from "@/components/prose-article";
import { DealerCta } from "@/components/sections/dealer-cta";
import { PreviewBanner } from "@/components/preview-banner";
import {
  getInsightGuideDocument,
  getInsightGuideDocuments,
} from "@/lib/wordpress/insights";

type GuidePageProps = {
  params: Promise<{ slug: string }>;
};

/** Build every guide article at build time. */
export function generateStaticParams() {
  return guides.map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata({
  params,
}: GuidePageProps): Promise<Metadata> {
  const { slug } = await params;
  const { isEnabled: preview } = await draftMode();
  const document = await getInsightGuideDocument(slug, { preview });

  if (!document) {
    return { title: "Guide not found" };
  }

  return {
    title: document.seoTitle,
    description: document.seoDescription,
    robots: { index: false, follow: true },
  };
}

/**
 * Insights guide article (`/insights/[slug]`).
 *
 * Thin wrapper over the shared `ProseArticle` renderer, which owns structure,
 * the conditional verification notice, the table of contents and the related-
 * guides footer. Keeps every route in lockstep.
 */
export default async function GuideArticlePage({ params }: GuidePageProps) {
  const { slug } = await params;
  const { isEnabled: preview } = await draftMode();
  const document = await getInsightGuideDocument(slug, { preview });

  if (!document) {
    notFound();
  }
  const guide = document.guide;
  const documents = await getInsightGuideDocuments({ preview });
  const liveGuides = documents.map((item) => item.guide);

  // Three siblings, preferring the same category so the footer stays relevant.
  const sameCategory = liveGuides.filter(
    (item) => item.slug !== guide.slug && item.category === guide.category,
  );
  const others = liveGuides.filter(
    (item) => item.slug !== guide.slug && item.category !== guide.category,
  );
  const related = [...sameCategory, ...others].slice(0, 3);

  return (
    <>
      <PreviewBanner enabled={preview} status={document.publicationStatus} />
      <ProseArticle guide={guide} related={related} heroMedia={document.media} />
      <DealerCta />
    </>
  );
}
