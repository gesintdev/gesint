"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, Check, Clock } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import type { SystemNotification } from "@/modules/cfg/settings/notification/dto/notification.dto";
import { notificationKeys } from "@/modules/cfg/settings/notification/notification.query";
import { systemNotificationService } from "@/modules/cfg/settings/notification/services/notification.service";
import { useHasPermission } from "@/shared/auth/permissions";
import { Button } from "@/shared/components/ui/Button";
import { ExceptionCapture } from "@/shared/exceptions";

function formatDueDate(value?: string) {
    if (!value) return null;
    return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" }).format(
        new Date(`${value}T00:00:00`),
    );
}

function NotificationRow({
    notification,
    onRead,
    loading,
}: {
    notification: SystemNotification;
    onRead: (_id: string) => void;
    loading: boolean;
}) {
    const dueDate = formatDueDate(notification.referenceDueDate);
    const unread = !notification.readAt;

    return (
        <div className="grid gap-2 rounded-lg px-3 py-2.5 transition-colors hover:bg-base-200/60">
            <div className="flex items-start gap-2.5">
                <span
                    className={clsx(
                        "mt-1 size-2 shrink-0 rounded-full",
                        unread ? "bg-error" : "bg-base-content/18",
                    )}
                />
                <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-semibold text-base-content">{notification.title}</p>
                    <p className="mt-0.5 text-xs leading-5 text-base-content/58">{notification.message}</p>
                    {dueDate ? (
                        <span className="mt-1 inline-flex items-center gap-1 text-[11px] text-base-content/45">
                            <Clock className="size-3" strokeWidth={2} />
                            Vencimento em {dueDate}
                        </span>
                    ) : null}
                </div>
            </div>
            {unread ? (
                <div className="flex justify-end">
                    <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        loading={loading}
                        leftIcon={<Check className="size-3.5" strokeWidth={2} />}
                        onClick={() => onRead(notification.id)}
                    >
                        Marcar como lida
                    </Button>
                </div>
            ) : null}
        </div>
    );
}

export function HeaderNotifications() {
    const queryClient = useQueryClient();
    const canReadNotifications = useHasPermission("notification:read");
    const [open, setOpen] = useState(false);
    const [ringing, setRinging] = useState(false);
    const rootRef = useRef<HTMLDivElement>(null);

    const summaryQuery = useQuery({
        queryKey: notificationKeys.summary,
        queryFn: () => systemNotificationService.getSummary(),
        enabled: canReadNotifications,
        refetchInterval: 60_000,
        staleTime: 30_000,
    });
    const unreadCount = summaryQuery.data?.unreadCount ?? 0;
    const notifications = summaryQuery.data?.notifications ?? [];

    const markReadMutation = useMutation({
        mutationFn: (id: string) => systemNotificationService.markAsRead(id),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: notificationKeys.summary });
        },
        onError: (err: unknown) => {
            ExceptionCapture.handle(err, { fallbackMessage: "Não foi possível atualizar a notificação." });
        },
    });

    useEffect(() => {
        if (!open) return;
        const onPointerDown = (event: MouseEvent) => {
            if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") setOpen(false);
        };
        document.addEventListener("mousedown", onPointerDown);
        document.addEventListener("keydown", onKeyDown);
        return () => {
            document.removeEventListener("mousedown", onPointerDown);
            document.removeEventListener("keydown", onKeyDown);
        };
    }, [open]);

    useEffect(() => {
        if (!canReadNotifications || unreadCount <= 0) {
            setRinging(false);
            return;
        }
        const interval = window.setInterval(() => {
            setRinging(true);
            window.setTimeout(() => setRinging(false), 820);
        }, 2000);
        return () => window.clearInterval(interval);
    }, [canReadNotifications, unreadCount]);

    if (!canReadNotifications) {
        return null;
    }

    return (
        <div ref={rootRef} className="relative">
            <button
                type="button"
                aria-label="Notificações"
                aria-expanded={open}
                aria-haspopup="menu"
                className={clsx(
                    "gommo-btn gommo-btn--ghost gommo-btn--icon-only relative text-base-content/50",
                    open && "bg-primary/8 text-primary",
                )}
                onClick={() => setOpen((value) => !value)}
            >
                <motion.span
                    animate={
                        ringing
                            ? {
                                  rotate: [0, -22, 20, -15, 11, -6, 0],
                                  scale: [1, 1.22, 1.22, 1.16, 1.1, 1.04, 1],
                              }
                            : { rotate: 0, scale: 1 }
                    }
                    transition={{ duration: 0.82, ease: "easeInOut" }}
                    className="flex origin-top"
                >
                    <Bell className="size-4.25" strokeWidth={2} />
                </motion.span>
                {unreadCount > 0 ? (
                    <span className="absolute -right-1 -top-1 grid min-h-4 min-w-4 place-items-center rounded-full bg-error px-1 text-[9px] font-semibold leading-none text-white ring-2 ring-base-100">
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                ) : null}
            </button>

            <AnimatePresence>
                {open ? (
                    <motion.div
                        role="menu"
                        aria-label="Notificações"
                        initial={{ opacity: 0, y: -5, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -5, scale: 0.97 }}
                        transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                        className="surface-popover absolute right-0 z-50 mt-2 flex max-h-[28rem] w-[22rem] origin-top-right flex-col overflow-hidden p-1.5"
                    >
                        <div className="flex items-center justify-between gap-3 px-3 py-2">
                            <div>
                                <p className="text-[13px] font-semibold text-base-content">Notificações</p>
                                <p className="text-[11px] text-base-content/45">
                                    {unreadCount > 0
                                        ? `${unreadCount} não ${unreadCount === 1 ? "lida" : "lidas"}`
                                        : "Tudo em dia"}
                                </p>
                            </div>
                        </div>
                        <div className="h-px bg-base-content/8" />
                        <div className="min-h-0 overflow-auto py-1">
                            {summaryQuery.isLoading ? (
                                <div className="grid gap-2 p-3">
                                    {Array.from({ length: 3 }).map((_, index) => (
                                        <div key={index} className="skeleton-shimmer h-12 rounded-lg" />
                                    ))}
                                </div>
                            ) : notifications.length > 0 ? (
                                notifications.map((notification) => (
                                    <NotificationRow
                                        key={notification.id}
                                        notification={notification}
                                        loading={markReadMutation.isPending}
                                        onRead={(id) => markReadMutation.mutate(id)}
                                    />
                                ))
                            ) : (
                                <p className="px-3 py-8 text-center text-sm text-base-content/45">
                                    Nenhuma notificação por enquanto.
                                </p>
                            )}
                        </div>
                    </motion.div>
                ) : null}
            </AnimatePresence>
        </div>
    );
}
