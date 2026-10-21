import fs from "node:fs";
import path from "node:path";

const root = new URL("../src", import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1");

function walk(dir, out = []) {
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, ent.name);
        if (ent.isDirectory()) walk(p, out);
        else if (ent.name.endsWith("FormClient.tsx")) out.push(p);
    }
    return out;
}

let count = 0;
for (const file of walk(root)) {
    let content = fs.readFileSync(file, "utf8");
    if (!content.includes("useCrudScreen") || !content.includes("goToList")) continue;
    const before = content;

    if (!content.includes("returnToList")) {
        content = content.replace(
            /(\bconst \{)([^}]*\bgoToList\b)([^}]*)(\} = useCrudScreen\(\);)/,
            (match, start, middle, tail, end) => {
                if (tail.includes("returnToList")) return match;
                return `${start}${middle}, returnToList${tail}${end}`;
            },
        );
    }

    content = content.replace(
        /(\bonSuccess:\s*(?:async\s*)?\([^)]*\)\s*=>\s*\{[\s\S]*?)\bgoToList\(\)/g,
        "$1returnToList()",
    );

    if (content !== before) {
        fs.writeFileSync(file, content);
        count++;
    }
}

console.log(`Updated ${count} files`);
