"use client";

import { useRef, useState } from "react";
import { Button } from "@astryxdesign/core/Button";
import { Dialog, DialogHeader } from "@astryxdesign/core/Dialog";
import { Layout, LayoutContent } from "@astryxdesign/core/Layout";
import { NumberInput } from "@astryxdesign/core/NumberInput";
import { Theme } from "@astryxdesign/core/theme";
import { neutralTheme } from "@/theme/fenghuai-neutral/neutral";

import { InquiryForm } from "@/components/inquiry-form";
import { wheelDetailEnquiryContext } from "@/content/wheel-detail";
import { inquiryFormUiFor, inquiryPreparationFor } from "@/lib/i18n/inquiry-form-copy";
import { wheelEnquiryCopyFor, wheelEnquiryFormCopyFor } from "@/lib/i18n/wheel-enquiry-copy";
import type { Locale } from "@/lib/i18n/types";
import type { InquiryContext } from "@/lib/inquiry/types";

export function DirectWheelInquiryDialog({
  model,
  productionCode,
  selectedSummary,
  locale,
  privacyVersion,
  privacyConsent,
  privacyLinkLabel,
  privacyLinkHref,
}: {
  model: string;
  productionCode?: string;
  selectedSummary?: string;
  locale: Locale;
  privacyVersion: string;
  privacyConsent: string;
  privacyLinkLabel: string;
  privacyLinkHref: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const contentRef = useRef<HTMLDivElement>(null);
  const hasConfiguration = Boolean(productionCode);
  const copy = wheelEnquiryCopyFor(locale);
  const formUi = {
    ...inquiryFormUiFor(locale),
    privacyConsent,
    privacyLinkLabel,
    privacyHref: privacyLinkHref,
  };
  const triggerLabel = hasConfiguration ? copy.cta : copy.modelCta;
  const context: InquiryContext = {
    model,
    productLine: wheelDetailEnquiryContext.productLine,
    intent: wheelDetailEnquiryContext.intent,
    ...(productionCode ? { productionCode } : {}),
  };

  return (
    <Theme theme={neutralTheme} mode="light">
      <Button
        label={triggerLabel}
        variant="primary"
        size="lg"
        onClick={() => setIsOpen(true)}
      />
      <Dialog
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        purpose="form"
        width={760}
        maxHeight="calc(100dvh - 32px)"
      >
        <Layout
          height="fill"
          defaultHasDividers
          header={
            <DialogHeader
              title={hasConfiguration ? copy.dialogTitle : copy.dialogModelTitle}
              subtitle={
                hasConfiguration && selectedSummary
                  ? copy.dialogSelectedSubtitle(selectedSummary)
                  : copy.dialogModelSubtitle(model)
              }
              onOpenChange={setIsOpen}
            />
          }
          content={
            <LayoutContent ref={contentRef}>
              {productionCode ? (
                <div className="mb-6 rounded-lg border border-forge/35 bg-forge-soft p-4">
                  <p className="font-mono text-sm leading-relaxed text-ink">
                    {selectedSummary}
                  </p>
                  <div className="mt-4 max-w-[320px]">
                    <NumberInput
                      label={copy.configurationQuantityLabel}
                      description={copy.configurationQuantityHelp}
                      min={1}
                      step={1}
                      isIntegerOnly
                      hasNumberSteppers
                      value={quantity}
                      width="100%"
                      onChange={setQuantity}
                    />
                  </div>
                </div>
              ) : null}
              <InquiryForm
                locale={locale}
                mode="direct"
                copy={wheelEnquiryFormCopyFor(locale)}
                ui={formUi}
                preparation={inquiryPreparationFor(locale)}
                privacyVersion={privacyVersion}
                context={context}
                onSuccess={() => contentRef.current?.scrollTo({ top: 0 })}
                item={
                  productionCode
                    ? { model, productionCode, quantity }
                    : undefined
                }
              />
            </LayoutContent>
          }
        />
      </Dialog>
    </Theme>
  );
}
