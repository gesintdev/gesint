"use client";

import clsx from "clsx";
import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import type { AcquisitionPeriodOption } from "@/modules/rh/person/vacation/lib/vacation-rules";
import type { VacationPeriodStatus } from "@/modules/rh/person/vacation/types/vacation.types";

const STATUS_LABEL: Record<VacationPeriodStatus, string> = {
    ACQUIRING: "Em aquisição",
    AVAILABLE: "Direito adquirido",
    CONCESSIVE: "Período concessivo",
    EXPIRED: "Férias vencidas",
    FORFEITED: "Sem direito",
};

type Props = {
    open: boolean;
    options: AcquisitionPeriodOption[];
    selectedAcquisitionStart?: string | null;
    onClose: () => void;
    onSelect: (acquisitionStart: string) => void;
};

function formatDate(iso: string | undefined | null): string {
    if (!iso) return "—";
    return iso.split("-").reverse().join("/");
}

function formatRange(start: string | undefined, end: string | undefined): string {
    if (!start || !end) return "—";
    return `${formatDate(start)} → ${formatDate(end)}`;
}

export function VacationAcquisitionPeriodModal({
    open,
    options,
    selectedAcquisitionStart,
    onClose,
    onSelect,
}: Props) {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;
        if (open) dialog.showModal();
        else if (dialog.open) dialog.close();
    }, [open]);

    if (!mounted) return null;

    return createPortal(
        <dialog
            ref={dialogRef}
            className="modal"
            onClose={onClose}
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div className="modal-box flex max-h-[85vh] w-full max-w-lg flex-col gap-0 p-0">
                <div className="flex items-start justify-between gap-3 border-b border-base-content/8 px-5 py-4">
                    <div className="min-w-0">
                        <h3 className="text-base font-semibold text-base-content">Período aquisitivo</h3>
                        <p className="mt-0.5 text-xs text-base-content/50">
                            Escolha em qual período aquisitivo as férias serão lançadas. Faltas, saldo e concessivo serão
                            recalculados.
                        </p>
                    </div>
                    <button
                        type="button"
                        className="btn btn-ghost btn-sm btn-circle shrink-0"
                        aria-label="Fechar"
                        onClick={onClose}
                    >
                        <X className="size-4" />
                    </button>
                </div>
                <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
                    <div className="grid gap-2">
                        {options.map((option) => {
                            const selected = selectedAcquisitionStart === option.acquisition.start;
                            return (
                                <button
                                    key={option.acquisition.start}
                                    type="button"
                                    className={clsx(
                                        "rounded-xl border px-3 py-3 text-left transition-colors",
                                        selected
                                            ? "border-primary/40 bg-primary/5"
                                            : "border-base-300/70 bg-base-100 hover:border-base-content/20 hover:bg-base-200/40",
                                    )}
                                    onClick={() => {
                                        onSelect(option.acquisition.start);
                                        onClose();
                                    }}
                                >
                                    <div className="flex items-center justify-between gap-3">
                                        <span className="text-sm font-semibold text-base-content">
                                            {option.periodIndex + 1}º período aquisitivo
                                        </span>
                                        <span className="text-xs font-medium text-base-content/55">
                                            {STATUS_LABEL[option.status]}
                                        </span>
                                    </div>
                                    <p className="mt-1 text-xs text-base-content/60">
                                        Aquisitivo: {formatRange(option.acquisition.start, option.acquisition.end)}
                                    </p>
                                    <p className="mt-0.5 text-xs text-base-content/60">
                                        Concessivo: {formatRange(option.concessive.start, option.concessive.end)}
                                    </p>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
            <button type="button" className="modal-backdrop" aria-label="Fechar modal" onClick={onClose} />
        </dialog>,
        document.body,
    );
}
