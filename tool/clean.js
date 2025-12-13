import { rmSync } from "node:fs";

rmSync("dest", {
  recursive: true,
  force: true,
});
