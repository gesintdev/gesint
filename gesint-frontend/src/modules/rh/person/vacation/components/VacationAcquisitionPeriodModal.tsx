"use client";

import clsx from "clsx";

import type { AcquisitionPeriodOption } from "@/modules/rh/person/vacation/lib/vacation-rules";
import type { VacationPeriodStatus } from "@/modules/rh/person/vacation/types/vacation.types";
import { Modal } from "@/shared/components/ui/Modal";

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
    return (
        <Modal
            open={open}
            onClose={onClose}
            title="Período aquisitivo"
            subtitle="Escolha em qual período aquisitivo as férias serão lançadas. Faltas, saldo e concessivo serão recalculados."
            size="md"
        >
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
        </Modal>
    );
}
