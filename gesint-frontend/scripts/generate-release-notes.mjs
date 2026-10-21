// Gera as notas de versao a partir do historico first-parent da main.
// Uso: node scripts/generate-release-notes.mjs [ref]   (padrao: origin/main, senao HEAD)
// Cada commit first-parent da ref = uma versao (SemVer via Conventional Commits):
//   BREAKING CHANGE / "tipo!:" -> major | feat -> minor | demais -> patch
// Commits "chore(release)" sao ignorados (gerados pelo workflow release-notes.yml).
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(scriptDir, "../src/generated");

const FIELD = "\x1f";
const RECORD = "\x1e";
const BASE_VERSION = { major: 1, minor: 0, patch: 0 };

function git(args) {
    return execFileSync("git", ["-c", "i18n.logOutputEncoding=UTF-8", ...args], {
        cwd: scriptDir,
        encoding: "utf8",
        maxBuffer: 64 * 1024 * 1024,
    });
}

function refExists(ref) {
    try {
        git(["rev-parse", "--verify", "--quiet", `${ref}^{commit}`]);
        return true;
    } catch {
        return false;
    }
}

function resolveRef() {
    const explicit = process.argv[2];
    if (explicit) return explicit;
    return refExists("origin/main") ? "origin/main" : "HEAD";
}

function cleanText(value) {
    return value.replace(/^[\uFEFF@\s]+/, "").trim();
}

function cleanBody(body) {
    return body
        .split(/\r?\n/)
        .filter((line) => !/^(Co-authored-by|Signed-off-by):/i.test(line.trim()))
        .filter((line) => !/^#/.test(line))
        .join("\n")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
}

function parseConventional(title) {
    const match = /^(\w+)(?:\(([^)]*)\))?(!)?:\s*(.+)$/.exec(title);
    if (!match) return { type: null, scope: null, breaking: false, description: title };
    return {
        type: match[1].toLowerCase(),
        scope: match[2]?.trim() || null,
        breaking: Boolean(match[3]),
        description: match[4].trim(),
    };
}

function capitalize(text) {
    return text ? text.charAt(0).toUpperCase() + text.slice(1) : text;
}

function mergedCommitTitles(hash, firstParent) {
    const out = git(["log", "--no-merges", "--reverse", "--format=%s", `${firstParent}..${hash}`]);
    return out.split(/\r?\n/).map(cleanText).filter(Boolean);
}

function describeMerge(subject, body) {
    const pr = /^Merge pull request #(\d+) from (\S+)/.exec(subject);
    if (pr) {
        const [firstLine = "", ...rest] = body.split(/\r?\n/);
        return {
            title: cleanText(firstLine) || `Pull request #${pr[1]}`,
            body: rest.join("\n"),
            pullRequest: Number(pr[1]),
        };
    }
    const branch = /^Merge branch '?([^'\s]+)'?/.exec(subject);
    if (branch) return { title: `Integra ${branch[1]}`, body, pullRequest: null };
    return { title: subject, body, pullRequest: null };
}

function bump(version, kind) {
    if (kind === "major") return { major: version.major + 1, minor: 0, patch: 0 };
    if (kind === "minor") return { major: version.major, minor: version.minor + 1, patch: 0 };
    return { major: version.major, minor: version.minor, patch: version.patch + 1 };
}

function formatVersion(version) {
    return `${version.major}.${version.minor}.${version.patch}`;
}

function readCommits(ref) {
    const format = ["%H", "%P", "%aI", "%s", "%b"].join("%x1f") + "%x1e";
    return git(["log", "--first-parent", "--reverse", `--format=${format}`, ref])
        .split(RECORD)
        .map((record) => record.replace(/^\r?\n/, ""))
        .filter((record) => record.trim())
        .map((record) => {
            const [hash, parents, date, subject, body = ""] = record.split(FIELD);
            return { hash, parents: parents.split(" ").filter(Boolean), date, subject: cleanText(subject), body };
        })
        .filter((commit) => !/^chore\(release\)/i.test(commit.subject));
}

function buildReleases(commits) {
    let version = null;
    const releases = [];

    for (const commit of commits) {
        const isMerge = commit.parents.length > 1;
        const merge = isMerge
            ? describeMerge(commit.subject, commit.body)
            : { title: commit.subject, body: commit.body, pullRequest: null };

        const parsed = parseConventional(merge.title);
        const included = isMerge ? mergedCommitTitles(commit.hash, commit.parents[0]) : [];
        const includedParsed = included.map(parseConventional);
        const breaking =
            parsed.breaking || /BREAKING[ -]CHANGE/.test(merge.body) || includedParsed.some((item) => item.breaking);
        const hasFeature = parsed.type === "feat" || includedParsed.some((item) => item.type === "feat");

        let body = cleanBody(merge.body);
        if (included.length > 0) {
            const list = included.map((title) => `- ${title}`).join("\n");
            body = `${body ? `${body}\n\n` : ""}**Commits incluídos**\n\n${list}`;
        }

        const type = parsed.type ?? (isMerge ? "merge" : null);
        const kind = breaking ? "major" : hasFeature ? "minor" : "patch";
        version = version === null ? { ...BASE_VERSION } : bump(version, kind);

        releases.push({
            version: formatVersion(version),
            hash: commit.hash.slice(0, 8),
            date: commit.date,
            type,
            scope: parsed.scope,
            breaking,
            title: capitalize(parsed.description),
            body,
            pullRequest: merge.pullRequest,
        });
    }

    return releases.reverse();
}

function writeJson(fileName, data) {
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.join(outDir, fileName), `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

const ref = resolveRef();
const releases = buildReleases(readCommits(ref));
const latest = releases[0] ?? null;

writeJson("release-version.json", {
    version: latest?.version ?? formatVersion(BASE_VERSION),
    hash: latest?.hash ?? null,
    date: latest?.date ?? null,
});
writeJson("release-notes.json", { releases });

console.log(`Release notes: v${latest?.version ?? "-"} (${releases.length} versoes a partir de ${ref})`);
