/**
 * SSR 探针 2：Tab/TabList、Collapsible、TopNav、MobileNav、Button as=Link、ClickableCard。
 * 一次性探针，证据落在 outputs/reports/astryx-p0-probes/。不改业务代码。
 */
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

function show(name, html) {
  console.log(`\n### ${name}\nOK. len=${html.length}`);
  const tags = html.match(/<[a-zA-Z][a-zA-Z0-9-]*/g) || [];
  const counts = {};
  for (const t of tags) counts[t] = (counts[t] || 0) + 1;
  console.log("tags:", JSON.stringify(counts));
  console.log("body:", html.replace(/\s+/g, " ").slice(0, 460));
}

async function run(name, build) {
  try {
    const html = renderToStaticMarkup(build());
    show(name, html);
  } catch (e) {
    console.log(`\n### ${name}\nFAIL: ${e.message.split("\n")[0].slice(0, 250)}`);
  }
}

const TabMod = await import("@astryxdesign/core/TabList");
const { TabList, Tab } = TabMod;

await run("TabList+Tab(button)", () =>
  React.createElement(
    TabList,
    { value: "a", onChange: () => {} },
    React.createElement(Tab, { value: "a", label: "A" }),
    React.createElement(Tab, { value: "b", label: "B" })
  ));

await run("TabList+Tab(href)", () =>
  React.createElement(
    TabList,
    { value: "a", onChange: () => {} },
    React.createElement(Tab, { value: "a", label: "A", href: "/insights?category=fitment" })
  ));

const ColMod = await import("@astryxdesign/core/Collapsible");
await run("Collapsible default(closed)", () =>
  React.createElement(
    ColMod.Collapsible,
    { trigger: React.createElement("span", null, "Q"), value: "x" },
    React.createElement("p", null, "Answer text")
  ));
await run("Collapsible defaultIsOpen", () =>
  React.createElement(
    ColMod.Collapsible,
    { trigger: React.createElement("span", null, "Q"), value: "x", defaultIsOpen: true },
    React.createElement("p", null, "Answer text")
  ));

const TN = await import("@astryxdesign/core/TopNav");
await run("TopNav", () =>
  React.createElement(TN.TopNav, { label: "Main" }, React.createElement("a", { href: "/" }, "Home")));

const MN = await import("@astryxdesign/core/MobileNav");
await run("MobileNav closed", () =>
  React.createElement(
    MN.MobileNav,
    { isOpen: false, onOpenChange: () => {} },
    React.createElement("a", { href: "/" }, "Home")
  ));

const B = await import("@astryxdesign/core/Button");
const FakeNextLink = React.forwardRef(function FL(props, ref) {
  const { href, children, ...rest } = props;
  return React.createElement("a", { ref, href, "data-next-link": "1", ...rest }, children);
});
await run("Button as=NextLink href", () =>
  React.createElement(B.Button, { label: "Go", href: "/products/wheels", as: FakeNextLink }));

const CC = await import("@astryxdesign/core/ClickableCard");
await run("ClickableCard href", () =>
  React.createElement(
    CC.ClickableCard,
    { label: "Open", href: "/products/wheels" },
    React.createElement("span", null, "body")
  ));
