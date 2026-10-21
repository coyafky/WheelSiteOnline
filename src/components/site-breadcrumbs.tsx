"use client";

import { BreadcrumbItem, Breadcrumbs } from "@astryxdesign/core/Breadcrumbs";
import { Theme } from "@astryxdesign/core/theme";
import { neutralTheme } from "@/theme/fenghuai-neutral/neutral";

export type SiteBreadcrumbItem = {
  label: string;
  href?: string;
};

export function SiteBreadcrumbs({
  items,
  label,
  tone = "light",
}: {
  items: SiteBreadcrumbItem[];
  label: string;
  tone?: "light" | "dark";
}) {
  const trail = (
    <Breadcrumbs label={label} variant="supporting">
      {items.map((item, index) => {
        const isCurrent = index === items.length - 1;
        return (
          <BreadcrumbItem
            key={`${item.href ?? "current"}-${item.label}`}
            href={isCurrent ? undefined : item.href}
            isCurrent={isCurrent}
          >
            {item.label}
          </BreadcrumbItem>
        );
      })}
    </Breadcrumbs>
  );

  return tone === "dark" ? (
    <Theme theme={neutralTheme} mode="dark">
      <div data-site-breadcrumbs="dark">{trail}</div>
    </Theme>
  ) : (
    <div data-site-breadcrumbs="light">{trail}</div>
  );
}
