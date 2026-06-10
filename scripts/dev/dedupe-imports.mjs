import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(
    path.resolve("gommo-frontend/node_modules/typescript/package.json"),
);
const ts = require("typescript");

const roots = ["gommo-frontend", "gommo-admin-frontend"];

function walk(dir, files = []) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        if (entry.name === "node_modules" || entry.name === ".next") continue;
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) walk(full, files);
        else if (/\.(ts|tsx)$/.test(entry.name)) files.push(full);
    }
    return files;
}

function importModuleKey(stmt, sourceFile) {
    if (ts.isImportDeclaration(stmt)) {
        return stmt.moduleSpecifier.getText(sourceFile);
    }
    if (ts.isImportEqualsDeclaration(stmt) && ts.isExternalModuleReference(stmt.moduleReference)) {
        return stmt.moduleReference.expression.getText(sourceFile);
    }
    return null;
}

function dedupeFile(filePath) {
    const original = fs.readFileSync(filePath, "utf8");
    const kind = filePath.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
    const sourceFile = ts.createSourceFile(filePath, original, ts.ScriptTarget.Latest, true, kind);

    const removals = [];
    const seenModules = new Set();

    for (const stmt of sourceFile.statements) {
        if (!ts.isImportDeclaration(stmt) && !ts.isImportEqualsDeclaration(stmt)) {
            continue;
        }

        const moduleKey = importModuleKey(stmt, sourceFile);
        if (!moduleKey) continue;

        if (seenModules.has(moduleKey)) {
            removals.push([stmt.getStart(sourceFile), stmt.getEnd()]);
        } else {
            seenModules.add(moduleKey);
        }
    }

    if (removals.length === 0) return false;

    removals.sort((a, b) => b[0] - a[0]);
    let next = original;
    for (const [start, end] of removals) {
        next = next.slice(0, start) + next.slice(end);
    }

    next = next.replace(/\n{3,}/g, "\n\n");
    fs.writeFileSync(filePath, next.endsWith("\n") ? next : `${next}\n`, "utf8");
    return true;
}

let changed = 0;
for (const root of roots) {
    const absRoot = path.resolve(root);
    if (!fs.existsSync(absRoot)) continue;
    for (const file of walk(absRoot)) {
        if (dedupeFile(file)) changed++;
    }
}

console.log(`dedupe-imports: updated ${changed} files`);
