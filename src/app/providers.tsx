"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { LinkProvider } from "@astryxdesign/core/Link";
import { ToastViewport } from "@astryxdesign/core/Toast";
import { Theme } from "@astryxdesign/core/theme";
import {
  InternationalizationProvider,
  type Overrides,
  type ProviderMessagesByLocale,
} from "@astryxdesign/core/i18n";
import esES from "@astryxdesign/core/locales/es-ES.generated.js";
import zhCN from "@astryxdesign/core/locales/zh-CN.generated.js";
import type { Locale } from "@/lib/i18n/types";
import { neutralTheme } from "@/theme/fenghuai-neutral/neutral";

const ASTRYX_LOCALES: Record<Locale, string> = {
  en: "en",
  zh: "zh-CN",
  es: "es-ES",
  th: "th-TH",
};

const ASTRYX_MESSAGES: ProviderMessagesByLocale = {
  "zh-CN": zhCN,
  "es-ES": esES,
};

/** Astryx 尚未内置泰语包；只覆盖当前切片会显示或朗读的短语。 */
const ASTRYX_OVERRIDES: Overrides = {
  "th-TH": {
    "@astryx.button.loading": "กำลังโหลด",
    "@astryx.field.optional": "ไม่บังคับ",
    "@astryx.field.required": "จำเป็น",
  },
};

export function Providers({ children, locale }: { children: ReactNode; locale: Locale }) {
  const astryxLocale = ASTRYX_LOCALES[locale];

  return (
    <Theme theme={neutralTheme} mode="light">
      <InternationalizationProvider
        locale={astryxLocale}
        messages={ASTRYX_MESSAGES}
        overrides={ASTRYX_OVERRIDES}
        dir="ltr"
      >
        <LinkProvider component={Link}>
          <ToastViewport position="bottomEnd" maxVisible={3}>
            {children}
          </ToastViewport>
        </LinkProvider>
      </InternationalizationProvider>
    </Theme>
  );
}
