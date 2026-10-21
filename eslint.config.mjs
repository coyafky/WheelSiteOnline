import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Underscore-prefixed parameters/variables are intentionally unused
  // (e.g. the inquiry `assignOwner` seam keeps its full signature for the
  // real routing implementation). Respect the convention instead of
  // sprinkling eslint-disable directives.
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
  // 性能审计脚本由 Node 直接执行，文件格式是 CommonJS；仅对这些文件允许 require。
  {
    files: ["qa-audit/perf/**/*.cjs"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Astryx CLI output is checked for freshness by `npm run theme:check`.
    "src/theme/fenghuai-neutral/neutral.d.ts",
    "src/theme/fenghuai-neutral/neutral.variants.d.ts",
    "src/theme/fenghuai-neutral/neutral.js",
    // Third-party skill assets — copied from a sibling project, not our source.
    // Linting them reports their style, not our code. See SKILLS/README.md.
    "SKILLS/**",
    // Read-only data pack (JSON + images). Not source.
    "assets/**",
    "resources/**",
    // Audit probe scripts kept as evidence under outputs/reports/. They are
    // throwaway instruments recorded to show how a measurement was taken,
    // not source we maintain; linting them reports their scratch style.
    "outputs/reports/**/scripts/**",
    // Playwright generated HTML/trace bundles are third-party build output.
    "playwright-report/**",
    "test-results/**",
    // Local WordPress runtime/data mirror. It contains upstream WordPress
    // bundles and is never part of the Next.js source tree.
    "local-wp/**",
  ]),
]);

export default eslintConfig;
