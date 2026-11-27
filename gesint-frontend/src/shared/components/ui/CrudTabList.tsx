"use client";

import clsx from "clsx";
import type { ReactNode } from "react";

export type CrudTabItem<T extends string> = {
    value: T;
    label: string;
    /** Contador ao lado do rótulo (ex.: pendências). */
    badge?: number | string | null;
    /** Frase curta que explica a aba (tooltip). */
    help?: string;
};

/**
 * Abas internas no padrão do CRUD (`.gesint-crud-tablist`): 32px, 12px, ativa só com cor +
 * sublinhado. Para filas e visões dentro de uma tela (ex.: Pendentes / Aprovadas / Reprovadas).
 */
export function CrudTabList<T extends string>({
    items,
    value,
    onChange,
    ariaLabel,
    trailing,
    className,
}: {
    items: CrudTabItem<T>[];
    value: T;
    onChange: (_value: T) => void;
    ariaLabel: string;
    /** Conteúdo alinhado à direita da trilha (ex.: aviso, ação). */
    trailing?: ReactNode;
    className?: string;
}) {
    return (
        <div className={clsx("gesint-crud-tablist", className)} role="tablist" aria-label={ariaLabel}>
            {items.map((item) => {
                const selected = item.value === value;
                return (
                    <button
                        key={item.value}
                        type="button"
                        role="tab"
                        aria-selected={selected}
                        title={item.help}
                        className={clsx("gesint-crud-tab", selected && "gesint-crud-tab--active")}
                        onClick={() => onChange(item.value)}
                    >
                        {item.label}
                        {item.badge != null && item.badge !== 0 && item.badge !== "" ? (
                            <span className="gesint-crud-tab-badge">{item.badge}</span>
                        ) : null}
                    </button>
                );
            })}
            {trailing ? <div className="ml-auto flex items-center self-center">{trailing}</div> : null}
        </div>
    );
}
