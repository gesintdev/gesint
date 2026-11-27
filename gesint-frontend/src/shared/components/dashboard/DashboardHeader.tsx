"use client";

import clsx from "clsx";
import { motion } from "framer-motion";
import { RefreshCw } from "lucide-react";
import type { ReactNode } from "react";

import { DASHBOARD_EASE_OUT } from "@/shared/components/dashboard/dashboard-motion";
import { Button } from "@/shared/components/ui/Button";

const timeFormatter = new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" });

/** Cabeçalho de página do dashboard: título, "Atualizado às HH:mm" ao vivo, meta e ações. */
export function DashboardHeader({
    title,
    updatedAt,
    isFetching,
    onRefresh,
    meta,
    actions,
}: {
    title: string;
    updatedAt: number;
    isFetching: boolean;
    onRefresh: () => void;
    meta?: ReactNode;
    actions?: ReactNode;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: DASHBOARD_EASE_OUT }}
            className="flex flex-wrap items-center justify-between gap-4"
        >
            <div className="min-w-0">
                <h1 className="gesint-dash-title">{title}</h1>
                <p className="gesint-dash-subtitle">
                    {updatedAt > 0 ? (
                        <span className="inline-flex items-center gap-1.5">
                            <span className={clsx("gesint-dash-live", isFetching && "gesint-dash-live--busy")} />
                            Atualizado às {timeFormatter.format(updatedAt)}
                        </span>
                    ) : (
                        "Carregando indicadores"
                    )}
                    {meta ? (
                        <>
                            <span className="text-base-content/25">·</span>
                            {meta}
                        </>
                    ) : null}
                </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
                {actions}
                <Button
                    variant="primary"
                    size="sm"
                    aria-label="Atualizar dashboard"
                    leftIcon={<RefreshCw className={clsx("size-3.5", isFetching && "animate-spin")} strokeWidth={2.25} />}
                    disabled={isFetching}
                    onClick={onRefresh}
                >
                    Atualizar
                </Button>
            </div>
        </motion.div>
    );
}
