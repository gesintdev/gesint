/**
 * Restaura imports removidos indevidamente (ex.: eslint --fix agressivo).
 * Compara com HEAD do git e reinsere import declarations ausentes.
 */
import { execSync } from "node:child_process";
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

function gitShow(repoPath) {
    try {
        return execSync(`git show HEAD:${repoPath.replace(/\\/g, "/")}`, {
            encoding: "utf8",
            stdio: ["ignore", "pipe", "ignore"],
        });
    } catch {
        return null;
    }
}

function parseImports(content, scriptKind) {
    const sourceFile = ts.createSourceFile("file.ts", content, ts.ScriptTarget.Latest, true, scriptKind);
    return sourceFile.statements
        .filter((s) => ts.isImportDeclaration(s) || ts.isImportEqualsDeclaration(s))
        .map((s) => content.slice(s.getStart(sourceFile), s.getEnd()).trim());
}

function normalizeImport(stmt) {
    return stmt.replace(/\s+/g, " ").trim();
}

function restoreImports(filePath) {
    const repoPath = path.relative(process.cwd(), filePath).replace(/\\/g, "/");
    const gitContent = gitShow(repoPath);
    if (!gitContent) return false;

    const current = fs.readFileSync(filePath, "utf8");
    const kind = filePath.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS;

    const gitImports = parseImports(gitContent, kind);
    const currentImports = new Set(parseImports(current, kind).map(normalizeImport));

    const missing = gitImports.filter((imp) => {
        const normalized = normalizeImport(imp);
        if (currentImports.has(normalized)) return false;
        // Evita duplicar quando simple-import-sort reformata o mesmo import.
        const fromMatch = normalized.match(/from\s+["']([^"']+)["']/);
        if (!fromMatch) return true;
        for (const existing of currentImports) {
            if (existing.includes(`from "${fromMatch[1]}"`) || existing.includes(`from '${fromMatch[1]}'`)) {
                return false;
            }
        }
        return true;
    });
    if (missing.length === 0) return false;

    const lines = current.split("\n");
    let insertAt = 0;

    if (lines[0]?.trim().match(/^["']use (client|server)["'];?$/)) {
        insertAt = 1;
        while (insertAt < lines.length && lines[insertAt].trim() === "") insertAt++;
    }

    const block = `${missing.join("\n")}\n\n`;
    const next = [...lines.slice(0, insertAt), block.trimEnd(), "", ...lines.slice(insertAt)].join("\n");

    fs.writeFileSync(filePath, next.endsWith("\n") ? next : `${next}\n`, "utf8");
    return true;
}

let changed = 0;
for (const root of roots) {
    const absRoot = path.resolve(root);
    if (!fs.existsSync(absRoot)) continue;
    for (const file of walk(absRoot)) {
        if (restoreImports(file)) {
            changed++;
            console.log(`restored imports: ${path.relative(process.cwd(), file)}`);
        }
    }
}

console.log(`restore-stripped-imports: updated ${changed} files`);
