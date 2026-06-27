/**
 * Uma linha em branco entre blocos logicos:
 * - const/let/export const no mesmo grupo
 * - cada useEffect / useLayoutEffect separado
 * - if / return / export function em blocos proprios
 */
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(
    path.resolve("gommo-frontend/node_modules/typescript/package.json"),
);
const ts = require("typescript");

const roots = ["gommo-frontend", "gommo-admin-frontend"];
const extensions = new Set([".ts", ".tsx"]);

function leadingSpaces(line) {
    return line.match(/^ */)?.[0].length ?? 0;
}

/** Remove linhas em branco indevidas; o espacamento correto e reaplicado depois. */
function stripIncorrectBlanks(sourceText) {
    const lines = sourceText.split("\n");
    const out = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.trim() !== "") {
            out.push(line);
            continue;
        }

        const prev = out[out.length - 1] ?? "";
        let j = i + 1;
        while (j < lines.length && lines[j].trim() === "") j++;
        const next = lines[j] ?? "";

        const prevTrim = prev.trim();
        const nextTrim = next.trim();
        const nextIndent = leadingSpaces(next);

        const keepAfterBrace =
            prevTrim.endsWith("}") &&
            (nextTrim.startsWith("if ") ||
                nextTrim.startsWith("else") ||
                nextTrim.startsWith("case ") ||
                nextTrim.startsWith("default"));

        const prevIsImport = prevTrim.startsWith("import ") || prevTrim.includes("} from ");
        const prevIsDirective = prevTrim.startsWith('"use ') || prevTrim.startsWith("'use ");
        const nextIsImport = nextTrim.startsWith("import ");

        // Preserva a linha em branco que separa o bloco de imports do entorno:
        // diretiva ("use client") -> imports, e ultimo import -> primeira declaracao.
        const keepImportBoundary =
            nextIndent === 0 &&
            nextTrim !== "" &&
            ((prevIsImport && !nextIsImport) || (prevIsDirective && nextIsImport));

        if (keepAfterBrace || keepImportBoundary) {
            out.push("");
        }
    }

    return `${out.join("\n").replace(/\n{3,}/g, "\n\n").trimEnd()}\n`;
}

function walk(dir, files = []) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        if (entry.name === "node_modules" || entry.name === ".next") continue;
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) walk(full, files);
        else if (extensions.has(path.extname(entry.name))) files.push(full);
    }
    return files;
}

function classifyStatement(stmt, sourceFile) {
    const text = stmt.getText(sourceFile).trimStart();

    if (ts.isImportDeclaration(stmt) || ts.isImportEqualsDeclaration(stmt)) return "import";
    if (ts.isVariableStatement(stmt)) return "const";

    if (ts.isExpressionStatement(stmt) && ts.isCallExpression(stmt.expression)) {
        const name = stmt.expression.expression.getText(sourceFile);
        if (name === "useEffect" || name === "useLayoutEffect") return "hook";
    }

    if (ts.isReturnStatement(stmt) || ts.isIfStatement(stmt) || ts.isThrowStatement(stmt)) {
        return "control";
    }

    if (ts.isExportDeclaration(stmt)) {
        if (/^export\s+(const|let)\b/.test(text)) return "const";
        return "export";
    }

    if (ts.isFunctionDeclaration(stmt) || ts.isClassDeclaration(stmt) || ts.isEnumDeclaration(stmt)) {
        return "export";
    }

    if (ts.isTypeAliasDeclaration(stmt) || ts.isInterfaceDeclaration(stmt)) return "type";

    return "other";
}

function buildGroups(statements, sourceFile) {
    const groups = [];
    let current = [];
    let currentKind = null;

    for (const stmt of statements) {
        const kind = classifyStatement(stmt, sourceFile);
        if (kind === "import") continue;

        const merge = kind === "const" && currentKind === "const";

        if (merge) {
            current.push(stmt);
        } else {
            if (current.length > 0) groups.push(current);
            current = [stmt];
            currentKind = kind;
        }
    }

    if (current.length > 0) groups.push(current);
    return groups;
}

function collectSpacingEdits(statements, sourceFile, sourceText) {
    const edits = [];
    const groups = buildGroups(statements, sourceFile);
    if (groups.length <= 1) return edits;

    for (let i = 1; i < groups.length; i++) {
        const prev = groups[i - 1][groups[i - 1].length - 1];
        const curr = groups[i][0];
        const prevEnd = prev.getEnd();
        const currStart = curr.getStart();

        // Seguranca: nunca editar um intervalo que contenha outra instrucao (ex.:
        // imports, que sao ignorados ao montar os grupos). Sem isso, o slice entre
        // dois grupos nao adjacentes engole o codigo intermediario — apagando imports.
        const spansOtherStatement = statements.some(
            (stmt) => stmt !== prev && stmt !== curr && stmt.getStart() >= prevEnd && stmt.getEnd() <= currStart,
        );
        if (spansOtherStatement) continue;

        const between = sourceText.slice(prevEnd, currStart);

        if (!between.includes("\n\n")) {
            edits.push({ start: prevEnd, end: currStart, text: "\n\n" });
        } else if (/\n{3,}/.test(between)) {
            edits.push({ start: prevEnd, end: currStart, text: "\n\n" });
        }
    }

    return edits;
}

function isFunctionBodyBlock(block, parent) {
    if (!parent) return false;
    if ((ts.isFunctionDeclaration(parent) || ts.isMethodDeclaration(parent)) && parent.body === block) {
        return true;
    }
    if ((ts.isFunctionExpression(parent) || ts.isArrowFunction(parent)) && parent.body === block) {
        return true;
    }
    return false;
}

function isReactComponentBody(fnNode, parent) {
    if (ts.isFunctionDeclaration(fnNode) && fnNode.name) {
        return /^[A-Z]/.test(fnNode.name.text);
    }
    if (
        (ts.isArrowFunction(fnNode) || ts.isFunctionExpression(fnNode)) &&
        parent &&
        ts.isVariableDeclaration(parent) &&
        ts.isIdentifier(parent.name)
    ) {
        return /^[A-Z]/.test(parent.name.text);
    }
    return false;
}

function processSourceFile(sourceFile, sourceText) {
    const edits = [];

    function visit(node, parent, grandparent) {
        if (ts.isSourceFile(node) && node.statements.length > 1) {
            edits.push(...collectSpacingEdits(node.statements, sourceFile, sourceText));
        } else if (
            ts.isBlock(node) &&
            isFunctionBodyBlock(node, parent) &&
            isReactComponentBody(parent, grandparent) &&
            node.statements.length > 1
        ) {
            edits.push(...collectSpacingEdits(node.statements, sourceFile, sourceText));
        }
        ts.forEachChild(node, (child) => visit(child, node, parent));
    }

    visit(sourceFile, undefined, undefined);

    if (edits.length === 0) return sourceText;

    const unique = [];
    const seen = new Set();
    for (const edit of edits.sort((a, b) => a.start - b.start)) {
        const key = `${edit.start}:${edit.end}`;
        if (seen.has(key)) continue;
        seen.add(key);
        unique.push(edit);
    }

    unique.sort((a, b) => b.start - a.start);
    let result = sourceText;
    for (const edit of unique) {
        result = result.slice(0, edit.start) + edit.text + result.slice(edit.end);
    }
    return result;
}

function normalizeFile(filePath) {
    const original = fs.readFileSync(filePath, "utf8");
    const stripped = stripIncorrectBlanks(original);
    const kind = filePath.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
    const sourceFile = ts.createSourceFile(filePath, stripped, ts.ScriptTarget.Latest, true, kind);
    const next = processSourceFile(sourceFile, stripped);
    if (next !== original) {
        fs.writeFileSync(filePath, next, "utf8");
        return true;
    }
    return false;
}

let changed = 0;
for (const root of roots) {
    const absRoot = path.resolve(root);
    if (!fs.existsSync(absRoot)) continue;
    for (const file of walk(absRoot)) {
        if (normalizeFile(file)) changed++;
    }
}

console.log(`normalize-block-spacing: updated ${changed} files`);
