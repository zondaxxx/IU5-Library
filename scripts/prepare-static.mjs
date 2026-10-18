import { copyFile, mkdir } from "node:fs/promises";
import { join } from "node:path";

const output = "dist/spa";
await mkdir(join(output, "documents"), { recursive: true });
await Promise.all([
  copyFile("public/documents/index.json", join(output, "documents/index.json")),
  copyFile("public/favicon.ico", join(output, "favicon.ico")),
  copyFile("public/robots.txt", join(output, "robots.txt")),
]);
