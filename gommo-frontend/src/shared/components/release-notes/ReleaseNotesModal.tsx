"use client";

import { useQuery } from "@tanstack/react-query";
import clsx from "clsx";
import { ChevronRight, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { loadReleaseNotes, releaseNotesKeys } from "@/shared/components/release-notes/release-notes.query";
import { type ReleaseNote, releaseTypeMeta } from "@/shared/components/release-notes/release-notes.types";
import { MarkdownContent } from "@/shared/components/ui/MarkdownContent";

type ReleaseNotesModalProps = {
    open: boolean;
    currentVersion: string;
    onClose: () => void;
};

const dateFormatter = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });

function ReleaseNoteItem({ note, expanded, onToggle }: { note: ReleaseNote; expanded: boolean; onToggle: () => void }) {
    const meta = releaseTypeMeta(note);
    const contentId = `release-note-${note.hash}`;

    return (
        <li className="border-b border-(--gommo-border-subtle) last:border-b-0">
            <button
                type="button"
                aria-expanded={expanded}
                aria-controls={contentId}
                onClick={onToggle}
                className="flex w-full items-start gap-2.5 px-4 py-3 text-left transition-colors duration-150 hover:bg-base-200/50"
            >
                <ChevronRight
                    className={clsx(
                        "mt-0.5 size-4 shrink-0 text-base-content/40 transition-transform duration-150",
                        expanded && "rotate-90",
                    )}
                    strokeWidth={2}
                />
                <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-base-content">{note.title}</p>
                    <p className="mt-0.5 text-xs text-base-content/50">
                        <span className="font-mono">v{note.version}</span>
                        <span aria-hidden> · </span>
                        {dateFormatter.format(new Date(note.date))}
                        {note.scope ? (
                            <>
                                <span aria-hidden> · </span>
                                {note.scope}
                            </>
                        ) : null}
                    </p>
                </div>
                <span className={clsx("gommo-badge shrink-0", meta.badgeClass)}>{meta.label}</span>
            </button>
            {expanded ? (
                <div id={contentId} className="px-4 pb-4 ps-10.5">
                    <MarkdownContent value={note.body} emptyFallback="Sem descrição detalhada." />
                    <p className="mt-3 text-[11px] text-base-content/40">
                        Commit <span className="font-mono">{note.hash}</span>
                        {note.pullRequest ? <> · PR #{note.pullRequest}</> : null}
                    </p>
                </div>
            ) : null}
        </li>
    );
}

export function ReleaseNotesModal({ open, currentVersion, onClose }: ReleaseNotesModalProps) {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const [mounted, setMounted] = useState(false);
    const [expandedHash, setExpandedHash] = useState<string | null>(null);

    const notesQuery = useQuery({
        queryKey: releaseNotesKeys.all,
        queryFn: loadReleaseNotes,
        enabled: open,
        staleTime: Infinity,
    });

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;
        if (open) {
            if (!dialog.open) dialog.showModal();
        } else if (dialog.open) {
            dialog.close();
            setExpandedHash(null);
        }
    }, [open, mounted]);

    if (!mounted) return null;

    const notes = notesQuery.data ?? [];

    return createPortal(
        <dialog ref={dialogRef} className="modal" onClose={onClose}>
            <div className="modal-box flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl p-0">
                <div className="flex items-center justify-between gap-3 border-b border-base-content/10 px-4 py-3">
                    <div>
                        <h3 className="text-base font-semibold">Novidades do sistema</h3>
                        <p className="text-xs text-base-content/55">
                            Versão atual <span className="font-mono">v{currentVersion}</span>
                        </p>
                    </div>
                    <button
                        type="button"
                        aria-label="Fechar"
                        className="gommo-btn gommo-btn--ghost gommo-btn--icon-only text-base-content/50"
                        onClick={onClose}
                    >
                        <X className="size-4" strokeWidth={2} />
                    </button>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto">
                    {notesQuery.isPending ? (
                        <p className="px-4 py-6 text-sm text-base-content/50">Carregando...</p>
                    ) : notesQuery.isError ? (
                        <p className="px-4 py-6 text-sm font-medium text-error">
                            Não foi possível carregar as novidades.
                        </p>
                    ) : notes.length === 0 ? (
                        <p className="px-4 py-6 text-sm text-base-content/50">Nenhuma alteração registrada.</p>
                    ) : (
                        <ul>
                            {notes.map((note) => (
                                <ReleaseNoteItem
                                    key={note.hash}
                                    note={note}
                                    expanded={expandedHash === note.hash}
                                    onToggle={() =>
                                        setExpandedHash((current) => (current === note.hash ? null : note.hash))
                                    }
                                />
                            ))}
                        </ul>
                    )}
                </div>
            </div>
            <form method="dialog" className="modal-backdrop">
                <button type="submit" aria-label="Fechar">
                    fechar
                </button>
            </form>
        </dialog>,
        document.body,
    );
}
