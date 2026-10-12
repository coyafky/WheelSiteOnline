/**
 * P3 SSR 探针 —— Card / ClickableCard / MetadataList / Table
 *
 * 用 react-dom/server 的 renderToStaticMarkup 直接渲染候选原语，看真实 DOM 标签。
 * 输出写入 ssr-probe-output.txt。
 *
 * 运行：node outputs/reports/astryx-p3-evidence-2026-10-11/ssr-probe.mjs
 */
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Theme } from "@astryxdesign/core/theme";
import { Card } from "@astryxdesign/core/Card";
import { ClickableCard } from "@astryxdesign/core/ClickableCard";
import { MetadataList, MetadataListItem } from "@astryxdesign/core/MetadataList";
import { Table } from "@astryxdesign/core/Table";
import { LinkProvider } from "@astryxdesign/core/Link";
import { neutralTheme } from "@astryxdesign/theme-neutral/built";

const h = React.createElement;

function render(name, node) {
  let out;
  try {
    out = renderToStaticMarkup(h(Theme, { theme: neutralTheme, mode: "light" }, node));
  } catch (error) {
    out = `THREW: ${error && error.message ? error.message : String(error)}`;
  }
  return `\n=== ${name} ===\n${out}\n`;
}

/** 模拟 Next Link 的组件占位（通过 LinkProvider 注入）。 */
function FakeNextLink({ href, children, ...rest }) {
  return h("a", { href, "data-next-link": "1", ...rest }, children);
}

const results = [];

/* 1. Card —— 纯容器，服务端安全？ */
results.push(
  render(
    "Card (static, padding=4, variant=default)",
    h(Card, { padding: 4 }, h("p", null, "Recorded process: Flow Formed")),
  ),
);

/* 2. ClickableCard —— 隐藏交互元素、a 还是 button、有没有 href */
results.push(
  render(
    "ClickableCard href=/products/wheels/hp12 label=HP12",
    h(
      ClickableCard,
      { href: "/products/wheels/hp12", label: "HP12" },
      h("p", null, "HP12"),
      h("p", null, "Flow Formed"),
    ),
  ),
);

/* 3. ClickableCard 通过 LinkProvider 是否走 Next Link */
results.push(
  render(
    "ClickableCard + LinkProvider(FakeNextLink)",
    h(
      LinkProvider,
      { component: FakeNextLink },
      h(
        ClickableCard,
        { href: "/products/wheels/hp12", label: "HP12" },
        h("p", null, "HP12"),
      ),
    ),
  ),
);

/* 4. ClickableCard 内嵌 button 是否独立 */
results.push(
  render(
    "ClickableCard with nested button (cart CTA)",
    h(
      ClickableCard,
      { href: "/products/wheels/hp12", label: "HP12" },
      h("p", null, "HP12"),
      h("button", { type: "button" }, "Add to enquiry"),
    ),
  ),
);

/* 5. MetadataList —— 语义 dt/dd？服务端安全？ */
results.push(
  render(
    "MetadataList columns=1 label=start",
    h(
      MetadataList,
      { columns: 1, label: { position: "start" } },
      h(MetadataListItem, { label: "Diameter" }, '18", 19"'),
      h(MetadataListItem, { label: "PCD" }, "5x112 · 5x114.3"),
      h(MetadataListItem, { label: "Configurations" }, "12 recorded configurations"),
    ),
  ),
);

/* 6. MetadataList multi 列 + maxNumOfItems 折叠 */
results.push(
  render(
    "MetadataList columns=multi maxNumOfItems=2",
    h(
      MetadataList,
      { columns: "multi", maxNumOfItems: 2 },
      h(MetadataListItem, { label: "A" }, "1"),
      h(MetadataListItem, { label: "B" }, "2"),
      h(MetadataListItem, { label: "C" }, "3"),
    ),
  ),
);

/* 7. MetadataList title */
results.push(
  render(
    "MetadataList title=Recorded production configurations",
    h(
      MetadataList,
      { title: "Recorded production configurations" },
      h(MetadataListItem, { label: "Size" }, '18x8.5"'),
    ),
  ),
);

/* 8. Table —— 数据驱动、客户端、caption 能力 */
const columns = [
  { id: "code", header: "Production code", renderCell: (row) => row.code },
  { id: "size", header: "Size", renderCell: (row) => row.size },
];
const data = [{ id: "1", code: "FH-002-1885", size: '18x8.5"' }];
results.push(
  render(
    "Table data-driven columns",
    h(Table, { columns, data }),
  ),
);
results.push(
  render(
    "Table with caption",
    h(Table, {
      columns,
      data,
      caption: "Recorded production configurations",
    }),
  ),
);

process.stdout.write(results.join(""));
