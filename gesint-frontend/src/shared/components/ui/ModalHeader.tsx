"use client";

import {X} from "lucide-react";
import type {ReactNode} from "react";

type ModalHeaderProps = {
    title: ReactNode;
    subtitle?: ReactNode;
    /** Ícone Lucide (size-4). O componente desenha a marca ao lado do título. */
    icon?: ReactNode;
    /** Ações à esquerda do fechar. O botão de fechar não se troca. */
    actions?: ReactNode;
    onClose: () => void;
    closeDisabled?: boolean;
};

/**
 * Cabeçalho padrão de modal. Título e fechar saem só daqui —
 * não monte outro X com btn-circle, btn-square ou botão solto.
 */
export function ModalHeader({title, subtitle, icon, actions, onClose, closeDisabled = false}: ModalHeaderProps) {
    return (
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-base-content/8 px-4 py-3">
            <div className="flex min-w-0 items-center gap-3">
                {icon ? (
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        {icon}
                    </span>
                ) : null}
                <div className="min-w-0">
                    <h3 className="text-[15px] font-semibold leading-snug text-base-content">{title}</h3>
                    {subtitle != null && subtitle !== false && subtitle !== "" ? (
                        <div className="mt-0.5 text-xs text-base-content/50">{subtitle}</div>
                    ) : null}
                </div>
            </div>
            <div className="flex shrink-0 items-center gap-1">
                {actions}
                <button
                    type="button"
                    className="gesint-btn gesint-btn--ghost gesint-btn--icon-only text-base-content/50"
                    aria-label="Fechar"
                    onClick={(event) => {
                        event.stopPropagation();
                        onClose();
                    }}
                    disabled={closeDisabled}
                >
                    <X className="size-4" strokeWidth={2} />
                </button>
            </div>
        </header>
    );
}
