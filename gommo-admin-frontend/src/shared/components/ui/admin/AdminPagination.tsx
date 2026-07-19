"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { AdminBtn } from "@/shared/components/ui/admin/AdminBtn";

export function AdminPagination({
    page,
    total,
    perPage,
    onChange,
}: {
    page: number;
    total: number;
    perPage: number;
    onChange: (page: number) => void;
}) {
    const pages = Math.max(1, Math.ceil(total / perPage));
    const from = total === 0 ? 0 : (page - 1) * perPage + 1;
    const to = Math.min(page * perPage, total);

    return (
        <div className="flex items-center justify-between pt-2.5">
            <span className="text-xs text-[var(--ga-text-muted)]">
                Exibindo {from}–{to} de {total} registros
            </span>
            <div className="flex gap-1">
                <AdminBtn
                    variant="secondary"
                    size="xs"
                    disabled={page <= 1}
                    onClick={() => onChange(page - 1)}
                    icon={<ChevronLeft size={12} />}
                />
                {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                    <button
                        key={p}
                        type="button"
                        onClick={() => onChange(p)}
                        style={{
                            minWidth: 26,
                            height: 24,
                            borderRadius: "var(--ga-radius-sm)",
                            border: p === page ? "1px solid var(--ga-primary)" : "1px solid var(--ga-border)",
                            background: p === page ? "var(--ga-primary)" : "var(--ga-surface)",
                            color: p === page ? "#fff" : "var(--ga-text)",
                            fontSize: 12,
                            cursor: "pointer",
                            padding: "0 4px",
                        }}
                    >
                        {p}
                    </button>
                ))}
                <AdminBtn
                    variant="secondary"
                    size="xs"
                    disabled={page >= pages}
                    onClick={() => onChange(page + 1)}
                    icon={<ChevronRight size={12} />}
                />
            </div>
        </div>
    );
}
