import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getGuide, guides } from "@/content/resources";
import { ProseArticle } from "@/components/prose-article";
import { DealerCta } from "@/components/sections/dealer-cta";

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
  const guide = getGuide(slug);

  if (!guide) {
    return { title: "Guide not found" };
  }

  return {
    title: `${guide.title} — ${guide.category} Guide`,
    description: guide.summary,
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
  const guide = getGuide(slug);

  if (!guide) {
    notFound();
  }

  // Three siblings, preferring the same category so the footer stays relevant.
  const sameCategory = guides.filter(
    (item) => item.slug !== guide.slug && item.category === guide.category,
  );
  const others = guides.filter(
    (item) => item.slug !== guide.slug && item.category !== guide.category,
  );
  const related = [...sameCategory, ...others].slice(0, 3);

  return (
    <>
      <ProseArticle guide={guide} related={related} />
      <DealerCta />
    </>
  );
}
