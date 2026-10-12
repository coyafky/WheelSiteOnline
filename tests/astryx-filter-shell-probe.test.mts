import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { CheckboxInput } from "@astryxdesign/core/CheckboxInput";
import { Theme } from "@astryxdesign/core/theme";
import { neutralTheme } from "@astryxdesign/theme-neutral/built";

test("Astryx CheckboxInput 的布尔 value 不承载筛选项业务值", () => {
  const ThemeWithoutChildren = Theme as unknown as React.ComponentType<{
    theme: typeof neutralTheme;
    mode: "light";
  }>;
  const html = renderToStaticMarkup(
    React.createElement(
      ThemeWithoutChildren,
      {
      theme: neutralTheme,
      mode: "light",
      },
      React.createElement(CheckboxInput, {
        label: '18"',
        value: true,
        htmlName: "diameter",
      }),
    ),
  );

  assert.match(html, /class="[^\"]*astryx-checkbox-input/);
  assert.match(html, /name="diameter"/);
  assert.match(html, /checked/);
  assert.doesNotMatch(html, /value="18"/);
});
