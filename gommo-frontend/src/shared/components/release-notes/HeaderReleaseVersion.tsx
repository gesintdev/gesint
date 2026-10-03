"use client";

import { useState } from "react";

import releaseVersion from "@/generated/release-version.json";
import { ReleaseNotesModal } from "@/shared/components/release-notes/ReleaseNotesModal";

export function HeaderReleaseVersion() {
    const [open, setOpen] = useState(false);

    return (
        <>
            <button
                type="button"
                aria-label={`Versão ${releaseVersion.version}. Ver novidades do sistema`}
                title="Ver novidades do sistema"
                onClick={() => setOpen(true)}
                className="shrink-0 rounded-md px-1.5 py-0.5 font-mono text-[11px] text-base-content/40 transition-colors duration-150 hover:bg-base-200/60 hover:text-base-content/70"
            >
                v{releaseVersion.version}
            </button>
            <ReleaseNotesModal open={open} currentVersion={releaseVersion.version} onClose={() => setOpen(false)} />
        </>
    );
}
