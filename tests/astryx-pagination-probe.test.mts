import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Pagination } from "@astryxdesign/core/Pagination";

test("Astryx Pagination 探针确认当前组件是客户端按钮而非服务端链接", () => {
  const html = renderToStaticMarkup(
    React.createElement(Pagination, {
      page: 2,
      totalPages: 5,
      label: "Catalogue pagination",
      onChange: () => undefined,
    }),
  );

  assert.match(html, /class="[^"]*astryx-pagination/);
  assert.match(html, /aria-current="page"/);
  assert.match(html, /<button[^>]+aria-label="Go to page 3"/);
  assert.doesNotMatch(html, /<a\b/);
});
