import { readdir, readFile, writeFile, stat } from "node:fs/promises";
import { join } from "node:path";

async function processFile(path) {
    let code = await readFile(path, "utf8");
    code = code.replace(/;(?=\s*$)/, "");
    await writeFile(path, code);
}

async function walk(dir) {
    for (const entry of await readdir(dir)) {
        const full = join(dir, entry);
        const s = await stat(full);
        if (s.isDirectory()) {
            await walk(full);
        } else if (full.endsWith(".jsx")) {
            await processFile(full);
        }
    }
}

walk("dest/lib");
