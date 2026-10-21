import type { ReleaseNote } from "@/shared/components/release-notes/release-notes.types";

export const releaseNotesKeys = {
    all: ["release-notes"] as const,
};

export async function loadReleaseNotes(): Promise<ReleaseNote[]> {
    const data = await import("@/generated/release-notes.json");
    return data.default.releases as ReleaseNote[];
}
