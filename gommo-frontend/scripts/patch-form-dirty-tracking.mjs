import fs from "node:fs";
import path from "node:path";

const root = path.resolve("src");

function walk(dir, out = []) {
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, ent.name);
        if (ent.isDirectory()) walk(p, out);
        else if (ent.name.endsWith("FormClient.tsx")) out.push(p);
    }
    return out;
}

function extractMapperSymbols(content) {
    const match = content.match(/import\s*\{([^}]+)\}\s*from\s*"[^"]+\.mapper";/);
    if (!match) return null;
    const names = match[1].split(",").map((s) => s.trim()).filter(Boolean);
    const emptyForm = names.find((n) => /^empty\w+Form$/.test(n));
    const toFormDto = names.find((n) => /\w+ToFormDto$/.test(n));
    if (!emptyForm || !toFormDto) return null;
    return { emptyForm, toFormDto };
}

let count = 0;
for (const file of walk(root)) {
    let content = fs.readFileSync(file, "utf8");
    if (!content.includes("detailQuery.data") || content.includes("useTrackedCrudFormDirty")) continue;
    const symbols = extractMapperSymbols(content);
    if (!symbols) continue;

    if (!content.includes("useTrackedCrudFormDirty")) {
        content = content.replace(
            /import \{useCrudScreen\} from "@\/shared\/components\/crud\/CrudScreen";/,
            'import {useCrudScreen} from "@/shared/components/crud/CrudScreen";\nimport {useTrackedCrudFormDirty} from "@/shared/components/crud/useTrackedCrudFormDirty";',
        );
        if (!content.includes("useTrackedCrudFormDirty")) {
            content = content.replace(
                /import \{ useCrudScreen \} from "@\/shared\/components\/crud\/CrudScreen";/,
                'import { useCrudScreen } from "@/shared/components/crud/CrudScreen";\nimport { useTrackedCrudFormDirty } from "@/shared/components/crud/useTrackedCrudFormDirty";',
            );
        }
    }

    const hasBranch = content.includes("activeBranchId");
    const emptyFormCall = hasBranch ? `${symbols.emptyForm}(activeBranchId)` : `${symbols.emptyForm}()`;

    const hookBlock = `
    useTrackedCrudFormDirty({
        form,
        isEditing,
        detailData: detailQuery.data,
        toFormDto: ${symbols.toFormDto},
        getEmptyForm: () => ${emptyFormCall},
    });
`;

    const effectEnd = content.search(/\n\s*const saveMutation = useMutation/);
    if (effectEnd === -1) continue;

    content = `${content.slice(0, effectEnd)}${hookBlock}${content.slice(effectEnd)}`;
    fs.writeFileSync(file, content);
    count++;
}

console.log(`Injected dirty tracking into ${count} files`);
