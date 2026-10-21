import type { HomepageModuleView } from "@/content/types";
import type { Locale } from "@/lib/i18n/types";
import { HomeClosing } from "@/components/home/home-closing";
import { HomeHero } from "@/components/home/hero/home-hero";
import { ProjectRouteSection } from "@/components/home/project-route-section";
import { ProductShowcase } from "@/components/sections/product-showcase";
import { TrustStrip } from "@/components/sections/trust-strip";

/**
 * Homepage module → component.
 *
 * Previously this was a `switch` inside the page. Two problems with that shape:
 *
 * 1. A module type the switch did not know about fell through to `undefined`,
 *    and React renders `undefined` as nothing — so a new CMS module silently
 *    disappeared from the page with no error and no log. The page still
 *    returned 200, so nothing caught it.
 * 2. Adding a module meant editing the page component itself, which also owns
 *    data loading and metadata.
 *
 * A registry fixes both: registration is one edit here, and an unknown type is
 * routed to a visible fallback instead of vanishing.
 */

type ModuleType = HomepageModuleView["type"];

/** Extract the props one module type needs. */
type ModuleProps<T extends ModuleType> = {
  content: Extract<HomepageModuleView, { type: T }>["content"];
  locale: Locale;
};

type ModuleRenderer<T extends ModuleType> = (
  props: ModuleProps<T> & { id: string },
) => React.ReactElement;

type Registry = {
  [T in ModuleType]: ModuleRenderer<T>;
};

export const HOME_MODULE_REGISTRY: Registry = {
  "home.hero": ({ id, content, locale }) => (
    <HomeHero key={id} hero={content} locale={locale} />
  ),
  "home.product-lines": ({ id, content, locale }) => (
    <ProductShowcase key={id} copy={content} locale={locale} />
  ),
  "home.capabilities": ({ id, content, locale }) => (
    <TrustStrip key={id} capabilities={content} locale={locale} />
  ),
  "home.delivery": ({ id, content, locale }) => (
    <ProjectRouteSection key={id} delivery={content} locale={locale} />
  ),
  "home.closing": ({ id, content, locale }) => (
    <HomeClosing key={id} closing={content} locale={locale} />
  ),
};

/**
 * Render an unknown module type.
 *
 * Deliberately visible: in development it says which type arrived so the
 * mismatch is obvious. In production it renders nothing but logs once, because
 * an unknown type is a deploy/CMS ordering problem, not something a visitor can
 * act on — and a visible error box on the homepage would be worse than a gap.
 */
function UnknownModule({ type, id }: { type: string; id: string }) {
  if (process.env.NODE_ENV !== "production") {
    return (
      <div
        data-unknown-module={type}
        style={{
          margin: "1rem 0",
          padding: "0.75rem 1rem",
          border: "1px dashed #c00",
          color: "#c00",
          font: "12px/1.5 ui-monospace, monospace",
        }}
      >
        未注册的首页模块：<code>{type}</code>（id: <code>{id}</code>）
      </div>
    );
  }

  console.error(
    `[home] unregistered module type "${type}" (id: ${id}) — nothing rendered. ` +
      "Add it to HOME_MODULE_REGISTRY or disable it in the CMS.",
  );
  return null;
}

export function isRegisteredModuleType(type: string): type is ModuleType {
  return Object.hasOwn(HOME_MODULE_REGISTRY, type);
}

/**
 * Render one module.
 *
 * The cast is contained here: the registry is keyed by the union, so a known
 * type always has a matching renderer, and the discriminated union guarantees
 * the content shape. Callers pass `module.type` through `isRegisteredModuleType`
 * first, so the unknown branch is only reachable for genuinely new types.
 */
export function renderHomeModule(module: HomepageModuleView, locale: Locale) {
  if (!isRegisteredModuleType(module.type)) {
    return <UnknownModule type={module.type} id={module.id} />;
  }
  const render = HOME_MODULE_REGISTRY[module.type] as ModuleRenderer<ModuleType>;
  return render({
    id: module.id,
    content: module.content as never,
    locale,
  });
}
