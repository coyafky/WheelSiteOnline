/**
 * SSR 探针：用 react-dom/server 渲染 Astryx 0.6.7 原语，观察服务端是否产出真实 DOM。
 * 这是 P0 兼容性基线的一次性探针，放在 outputs/reports/astryx-p0-probes/ 作为可复现证据。
 * 不修改任何业务代码。
 */
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

async function probe(name, fn) {
  try {
    const mod = await import(name);
    const Comp = mod[Object.keys(mod).find((k) => /^[A-Z]/.test(k) && typeof mod[k] === "function")];
    const el = fn(mod, Comp);
    const html = renderToStaticMarkup(el);
    console.log(`\n### ${name}\nOK renders. html(len=${html.length}):`);
    console.log(html.slice(0, 400).replace(/\s+/g, " "));
  } catch (e) {
    console.log(`\n### ${name}\nFAIL: ${e.constructor.name}: ${e.message.split("\n")[0].slice(0, 300)}`);
  }
}

// Card：无 "use client" → 期望服务端可渲染
await probe("@astryxdesign/core/Card", (m, C) => React.createElement(C, null, "card child"));

// Button with href：期望产出 <a href>
await probe("@astryxdesign/core/Button", (m, B) =>
  React.createElement(B, { label: "Go", href: "/products/wheels" }));

// EmptyState / Badge：无 use client
await probe("@astryxdesign/core/EmptyState", (m, C) => React.createElement(C, { title: "None" }));
await probe("@astryxdesign/core/Badge", (m, C) => React.createElement(C, null, "New"));

// client 组件：期望 SSR 也能产出 HTML（React 允许 server 渲染 client 组件）
await probe("@astryxdesign/core/CheckboxInput", (m, C) =>
  React.createElement(C, { label: "x", htmlName: "pcd", value: "5x120" }));
await probe("@astryxdesign/core/Pagination", (m, C) =>
  React.createElement(C, { page: 1, totalPages: 5, onChange: () => {} }));
await probe("@astryxdesign/core/TabList", (m, C) =>
  React.createElement(C, { value: "a", onChange: () => {} }, "t"));
