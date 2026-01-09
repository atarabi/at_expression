import { readdir, readFile, writeFile, stat } from "node:fs/promises";
import { join } from "node:path";

async function walk(dir, predicate, processor) {
    for (const entry of await readdir(dir)) {
        const full = join(dir, entry);
        const s = await stat(full);

        if (s.isDirectory()) {
            await walk(full, predicate, processor);
        } else if (predicate(full)) {
            await processor(full);
        }
    }
}

async function removeExport(path) {
    let code = await readFile(path, "utf8");
    code = code
        .split(/\r?\n/)
        .filter(line => !/^\s*export\s*\{\s*\};\s*$/.test(line))
        .join("\n");
    await writeFile(path, code);
}

async function removeTrailingSemicolon(path) {
    let code = await readFile(path, "utf8");

    code = code.replace(/;(?=\s*$)/, "");

    await writeFile(path, code);
}

await walk("dest/example", p => p.endsWith(".jsx"), removeExport);
await walk("dest/lib", p => p.endsWith(".jsx"), removeTrailingSemicolon);
