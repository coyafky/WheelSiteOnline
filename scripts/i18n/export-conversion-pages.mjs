import { writeFileSync } from "node:fs";
import { conversionPageSeed } from "../../src/content/conversion-pages.ts";

const output = process.argv[2];
if (!output || !output.startsWith("/tmp/fh-conversion-pages-")) {
  throw new Error("输出路径必须是 /tmp/fh-conversion-pages-* 文件");
}
writeFileSync(output, `${JSON.stringify(conversionPageSeed, null, 2)}\n`, { flag: "wx", mode: 0o600 });
console.log(`已导出四语业务正文：${output}`);
