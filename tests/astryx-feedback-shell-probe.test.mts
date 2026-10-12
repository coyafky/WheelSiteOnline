import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Banner } from "@astryxdesign/core/Banner";
import { FormLayout } from "@astryxdesign/core/FormLayout";
import { Theme } from "@astryxdesign/core/theme";
import { neutralTheme } from "@astryxdesign/theme-neutral/built";

function renderNeutral(child: React.ReactNode) {
  const ThemeWithoutChildren = Theme as unknown as React.ComponentType<{
    theme: typeof neutralTheme;
    mode: "light";
  }>;
  return renderToStaticMarkup(
    React.createElement(
      ThemeWithoutChildren,
      { theme: neutralTheme, mode: "light" },
      child,
    ),
  );
}

test("Astryx Banner 的信息提示是 status 而不是 alert", () => {
  const info = renderNeutral(
    React.createElement(Banner, {
      status: "info",
      title: "How filters combine",
      description: "Values in the same group add together.",
      collapsible: false,
    }),
  );
  const warning = renderNeutral(
    React.createElement(Banner, {
      status: "warning",
      title: "Needs attention",
      description: "Check the value.",
      collapsible: false,
    }),
  );

  assert.match(info, /role="status"/);
  assert.doesNotMatch(info, /role="alert"/);
  assert.match(info, /astryx-banner/);
  assert.match(warning, /role="alert"/);
});

test("Astryx FormLayout 只提供字段布局方向，不替换原生表单语义", () => {
  const html = renderNeutral(
    React.createElement(
      FormLayout,
      { direction: "vertical" },
      React.createElement("fieldset", null, React.createElement("legend", null, "Diameter")),
    ),
  );

  assert.match(html, /astryx-form-layout/);
  assert.match(html, /<fieldset><legend>Diameter<\/legend><\/fieldset>/);
  assert.doesNotMatch(html, /<form/);
});
