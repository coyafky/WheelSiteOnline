import type { Metadata } from "next";
import { draftMode } from "next/headers";
import { LegalDocumentPage } from "@/components/legal-document";
import { PreviewBanner } from "@/components/preview-banner";
import { getInquiryContent } from "@/lib/wordpress/inquiry-content";
import { getLegalDocumentContent } from "@/lib/wordpress/legal";
import { getWordpressPageDocument } from "@/lib/wordpress/pages";

export async function generateMetadata(): Promise<Metadata> {
  const { isEnabled: preview } = await draftMode();
  const page = await getWordpressPageDocument("privacy", { preview });
  return {
    title: page?.seoTitle || "Privacy Policy",
    description:
      page?.seoDescription ||
      "Privacy policy template for enquiry data, consent and customer rights.",
    robots: { index: false, follow: false },
  };
}

/**
 * Thin route: the document body is read from Headless WordPress (page key
 * `legal-privacy`) through `@/lib/wordpress/legal`, which falls back to the
 * checked-in English constant. The shared renderer handles structure, the
 * draft-pending-legal-review notice and cross-navigation. Nothing is
 * duplicated across the five support routes.
 *
 * The `privacy` page key read in `generateMetadata` above is a DIFFERENT
 * record: it carries the contact-page metadata, not this policy body.
 */
export default async function Page() {
  const { isEnabled: preview } = await draftMode();
  const doc = await getLegalDocumentContent("privacy");
  const inquiry = await getInquiryContent({ preview });

  return (
    <>
      <PreviewBanner enabled={preview} exitHref="/support/privacy" />
      <PrivacyTemplatePanel
        preview={preview}
        version={inquiry.privacy.version}
        consentText={inquiry.privacy.consentText}
        linkLabel={inquiry.privacy.linkLabel}
        linkHref={inquiry.privacy.linkHref}
      />
      <LegalDocumentPage doc={doc} />
    </>
  );
}

function PrivacyTemplatePanel({
  preview,
  version,
  consentText,
  linkLabel,
  linkHref,
}: {
  preview: boolean;
  version: string;
  consentText: string;
  linkLabel: string;
  linkHref: string;
}) {
  return (
    <section
      aria-labelledby="privacy-template-title"
      className="border-b border-forge/25 bg-forge/8 pb-10 pt-[118px] lg:pb-12 lg:pt-[140px]"
    >
      <div className="container-fh">
        <div className="max-w-[760px]">
          <p className="eyebrow text-forge-deep">{preview ? "前台预览" : "询盘模板"}</p>
          <h2
            id="privacy-template-title"
            className="mt-3 font-display text-[clamp(1.45rem,3vw,2rem)] font-800 uppercase leading-tight text-ink"
          >
            询盘隐私版本与同意文本
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-steel">
            {preview
              ? "这是 WordPress 草稿在前台的预览。保存为正式政策前，访客不会看到该草稿，询盘提交也保持关闭。"
              : "此处展示当前询盘入口使用的模板字段；正式版本须经公司与法务确认。"}
          </p>

          <dl className="mt-7 grid gap-5 border-t border-forge/20 pt-6 sm:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)]">
            <div>
              <dt className="font-display text-xs font-700 uppercase tracking-[0.14em] text-steel">
                版本号
              </dt>
              <dd className="mt-2 font-mono text-sm text-ink">
                {version || "待公司确认（表单保持关闭）"}
              </dd>
            </div>
            <div>
              <dt className="font-display text-xs font-700 uppercase tracking-[0.14em] text-steel">
                提交时显示的同意文本
              </dt>
              <dd className="mt-2 text-sm leading-relaxed text-ink">{consentText}</dd>
            </div>
          </dl>

          <p className="mt-6 text-sm text-steel">
            链接：{" "}
            <a href={linkHref} className="text-forge-deep underline underline-offset-4">
              {linkLabel}
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
