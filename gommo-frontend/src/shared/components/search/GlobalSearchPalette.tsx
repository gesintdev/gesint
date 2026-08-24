"use client";

import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import {
    Briefcase,
    FileText,
    LayoutGrid,
    Network,
    Search,
    UserPlus,
    UserRound,
    type LucideIcon,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

import { APP_ROUTES, flattenRoutes, type AppRoute } from "@/config/routes";
import type { GlobalSearchGroup, GlobalSearchItem } from "@/modules/root/search/dto/global-search.dto";
import { globalSearchService } from "@/modules/root/search/services/global-search.service";
import { useSessionPermissions } from "@/shared/auth/permissions";
import { canAccessRoute } from "@/shared/auth/route-access";
import { useWorkspaceNavigation } from "@/shared/workspace/useWorkspaceNavigation";
import { defaultShortLabel, findRouteByHref } from "@/shared/workspace/workspace-routes";

const MIN_CHARS = 2;
const DEBOUNCE_MS = 250;
const LIMIT_PER_TYPE = 5;
const MAX_NAV_RESULTS = 6;
const FLOATING_WIDTH_PX = 320;
const FLOATING_MAX_WIDTH = "calc(100vw - 7rem)";

type FlatNavRoute = AppRoute & { searchLabel: string };

type PaletteEntry =
    | { kind: "nav"; key: string; route: FlatNavRoute }
    | { kind: "entity"; key: string; groupType: string; item: GlobalSearchItem };

const TYPE_ICONS: Record<string, LucideIcon> = {
    PERSON: UserRound,
    ADMISSION: UserPlus,
    DEPARTMENT: Network,
    JOB_POSITION: Briefcase,
};

function isAbortError(error: unknown): boolean {
    return error instanceof DOMException
        ? error.name === "AbortError"
        : typeof error === "object"
          && error !== null
          && "name" in error
          && (error as { name?: string }).name === "AbortError";
}

export function GlobalSearchPalette() {
    const permissions = useSessionPermissions();
    const { openRouteModule, openRouteRecord } = useWorkspaceNavigation();
    const rootRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const abortRef = useRef<AbortController | null>(null);

    const [query, setQuery] = useState("");
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [groups, setGroups] = useState<GlobalSearchGroup[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);

    const navRoutes = useMemo(() => {
        const seen = new Set<string>();
        return flattenRoutes(APP_ROUTES).filter((route) => {
            if (!route.href || route.children?.length) return false;
            if (!canAccessRoute(route, permissions)) return false;
            if (seen.has(route.id)) return false;
            seen.add(route.id);
            return true;
        });
    }, [permissions]);

    const navMatches = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return [] as FlatNavRoute[];
        return navRoutes
            .filter((route) => route.searchLabel.toLowerCase().includes(q) || route.label.toLowerCase().includes(q))
            .slice(0, MAX_NAV_RESULTS);
    }, [navRoutes, query]);

    const entries = useMemo((): PaletteEntry[] => {
        const result: PaletteEntry[] = navMatches.map((route) => ({
            kind: "nav" as const,
            key: `nav:${route.id}`,
            route,
        }));
        for (const group of groups) {
            for (const item of group.items) {
                result.push({
                    kind: "entity",
                    key: `entity:${group.type}:${item.id}`,
                    groupType: group.type,
                    item,
                });
            }
        }
        return result;
    }, [groups, navMatches]);

    const closePalette = useCallback(() => {
        setOpen(false);
        setActiveIndex(0);
        abortRef.current?.abort();
        inputRef.current?.blur();
    }, []);

    const focusSearch = useCallback(() => {
        setOpen(true);
        requestAnimationFrame(() => inputRef.current?.focus());
    }, []);

    useEffect(() => {
        if (!open) return;
        inputRef.current?.focus();
    }, [open]);

    const toggleSearch = useCallback(() => {
        if (open) {
            closePalette();
            return;
        }
        focusSearch();
    }, [closePalette, focusSearch, open]);

    const selectEntry = useCallback(
        (entry: PaletteEntry) => {
            setQuery("");
            setGroups([]);
            closePalette();
            if (entry.kind === "nav") {
                openRouteModule(entry.route);
                return;
            }
            const route = findRouteByHref(entry.item.href);
            if (!route) return;
            openRouteRecord(route, entry.item.id, {
                titleSuffix: entry.item.title,
                shortLabel: defaultShortLabel(entry.item.title),
            });
        },
        [closePalette, openRouteModule, openRouteRecord],
    );

    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if (!(event.altKey && !event.ctrlKey && !event.metaKey && event.key.toLowerCase() === "s")) {
                return;
            }
            const target = event.target as HTMLElement | null;
            if (target?.closest("input, textarea, [contenteditable='true']") && target !== inputRef.current) {
                return;
            }
            event.preventDefault();
            focusSearch();
        };
        document.addEventListener("keydown", onKeyDown);
        return () => document.removeEventListener("keydown", onKeyDown);
    }, [focusSearch]);

    useEffect(() => {
        if (!open) return;
        const onPointerDown = (event: MouseEvent) => {
            if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
                closePalette();
            }
        };
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                closePalette();
                inputRef.current?.blur();
            }
        };
        document.addEventListener("mousedown", onPointerDown);
        document.addEventListener("keydown", onKeyDown);
        return () => {
            document.removeEventListener("mousedown", onPointerDown);
            document.removeEventListener("keydown", onKeyDown);
        };
    }, [closePalette, open]);

    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        abortRef.current?.abort();

        const trimmed = query.trim();
        if (trimmed.length < MIN_CHARS) {
            setGroups([]);
            setLoading(false);
            return;
        }

        debounceRef.current = setTimeout(() => {
            const controller = new AbortController();
            abortRef.current = controller;
            setLoading(true);
            void globalSearchService
                .search(trimmed, LIMIT_PER_TYPE, controller.signal)
                .then((response) => {
                    if (controller.signal.aborted) return;
                    setGroups(response.groups ?? []);
                    setActiveIndex(0);
                })
                .catch((error: unknown) => {
                    if (isAbortError(error) || controller.signal.aborted) return;
                    setGroups([]);
                })
                .finally(() => {
                    if (!controller.signal.aborted) setLoading(false);
                });
        }, DEBOUNCE_MS);

        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [query]);

    useEffect(() => {
        setActiveIndex(0);
    }, [entries.length]);

    const showPanel = open && (query.trim().length > 0 || loading);
    const hasResults = entries.length > 0;

    return (
        <div ref={rootRef} className="relative shrink-0">
            <button
                type="button"
                aria-label="Buscar no sistema"
                aria-expanded={open}
                aria-haspopup="listbox"
                aria-controls="global-search-palette"
                onClick={toggleSearch}
                className={clsx(
                    "gommo-btn gommo-btn--ghost gommo-btn--icon-only relative z-20 text-base-content/55",
                    open && "!bg-transparent text-primary hover:!bg-transparent active:!bg-transparent",
                )}
            >
                <Search className="size-4" strokeWidth={2} />
            </button>

            <AnimatePresence>
                {open ? (
                    <motion.div
                        key="global-search-float"
                        initial={{ opacity: 0, width: 36 }}
                        animate={{ opacity: 1, width: FLOATING_WIDTH_PX }}
                        exit={{ opacity: 0, width: 36 }}
                        transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                        style={{ maxWidth: FLOATING_MAX_WIDTH }}
                        className="absolute right-0 top-0 z-10 overflow-hidden"
                    >
                        <label className="gommo-field cursor-text shadow-[var(--gommo-shadow-md)]">
                            <input
                                ref={inputRef}
                                type="search"
                                value={query}
                                placeholder="Buscar no sistema..."
                                className="placeholder:text-base-content/32"
                                aria-label="Buscar no sistema"
                                aria-expanded={showPanel}
                                aria-controls="global-search-palette"
                                aria-autocomplete="list"
                                onChange={(event) => {
                                    setQuery(event.target.value);
                                    setOpen(true);
                                }}
                                onKeyDown={(event) => {
                                    if (!showPanel || entries.length === 0) return;
                                    if (event.key === "ArrowDown") {
                                        event.preventDefault();
                                        setActiveIndex((index) => (index + 1) % entries.length);
                                    } else if (event.key === "ArrowUp") {
                                        event.preventDefault();
                                        setActiveIndex((index) => (index - 1 + entries.length) % entries.length);
                                    } else if (event.key === "Enter") {
                                        event.preventDefault();
                                        const entry = entries[activeIndex];
                                        if (entry) selectEntry(entry);
                                    }
                                }}
                            />
                            <kbd className="ms-auto hidden shrink-0 sm:flex">Alt+S</kbd>
                            <span className="w-6 shrink-0" aria-hidden />
                        </label>
                    </motion.div>
                ) : null}
            </AnimatePresence>

            <AnimatePresence>
                {showPanel ? (
                    <motion.div
                        id="global-search-palette"
                        role="listbox"
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.14 }}
                        style={{ width: FLOATING_WIDTH_PX, maxWidth: FLOATING_MAX_WIDTH }}
                        className="surface-popover absolute right-0 top-full z-50 mt-2 overflow-hidden"
                    >
                        <div className="max-h-[min(24rem,70vh)] overflow-y-auto py-1.5">
                            {loading && query.trim().length >= MIN_CHARS ? (
                                <p className="px-3 py-2 text-xs text-base-content/45">Buscando...</p>
                            ) : null}

                            {!loading && query.trim().length > 0 && query.trim().length < MIN_CHARS ? (
                                <p className="px-3 py-2 text-xs text-base-content/45">
                                    Digite ao menos {MIN_CHARS} caracteres.
                                </p>
                            ) : null}

                            {!loading && query.trim().length >= MIN_CHARS && !hasResults ? (
                                <p className="px-3 py-2 text-xs text-base-content/45">Nenhum resultado encontrado.</p>
                            ) : null}

                            {navMatches.length > 0 ? (
                                <PaletteSection label="Páginas" icon={LayoutGrid}>
                                    {navMatches.map((route) => {
                                        const entryKey = `nav:${route.id}`;
                                        const index = entries.findIndex((entry) => entry.key === entryKey);
                                        return (
                                            <PaletteRow
                                                key={entryKey}
                                                active={index === activeIndex}
                                                icon={route.icon ?? FileText}
                                                title={route.label}
                                                subtitle={route.searchLabel}
                                                onMouseEnter={() => setActiveIndex(index)}
                                                onClick={() =>
                                                    selectEntry({ kind: "nav", key: entryKey, route })
                                                }
                                            />
                                        );
                                    })}
                                </PaletteSection>
                            ) : null}

                            {groups.map((group) => {
                                const Icon = TYPE_ICONS[group.type] ?? FileText;
                                return (
                                    <PaletteSection key={group.type} label={group.label} icon={Icon}>
                                        {group.items.map((item) => {
                                            const entryKey = `entity:${group.type}:${item.id}`;
                                            const index = entries.findIndex((entry) => entry.key === entryKey);
                                            return (
                                                <PaletteRow
                                                    key={entryKey}
                                                    active={index === activeIndex}
                                                    icon={Icon}
                                                    title={item.title}
                                                    subtitle={item.subtitle ?? undefined}
                                                    onMouseEnter={() => setActiveIndex(index)}
                                                    onClick={() =>
                                                        selectEntry({
                                                            kind: "entity",
                                                            key: entryKey,
                                                            groupType: group.type,
                                                            item,
                                                        })
                                                    }
                                                />
                                            );
                                        })}
                                    </PaletteSection>
                                );
                            })}
                        </div>
                    </motion.div>
                ) : null}
            </AnimatePresence>
        </div>
    );
}

function PaletteSection({
    label,
    icon: Icon,
    children,
}: {
    label: string;
    icon: LucideIcon;
    children: ReactNode;
}) {
    return (
        <div className="px-1.5 py-1">
            <div className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-base-content/40">
                <Icon className="size-3" strokeWidth={2} />
                {label}
            </div>
            <div className="grid gap-0.5">{children}</div>
        </div>
    );
}

function PaletteRow({
    active,
    icon: Icon,
    title,
    subtitle,
    onClick,
    onMouseEnter,
}: {
    active: boolean;
    icon: LucideIcon;
    title: string;
    subtitle?: string;
    onClick: () => void;
    onMouseEnter: () => void;
}) {
    return (
        <button
            type="button"
            role="option"
            aria-selected={active}
            onMouseDown={(event) => {
                event.preventDefault();
                onClick();
            }}
            onMouseEnter={onMouseEnter}
            className={clsx(
                "flex w-full items-start gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors",
                active ? "bg-primary/10 text-base-content" : "text-base-content/85 hover:bg-base-200/70",
            )}
        >
            <Icon className="mt-0.5 size-4 shrink-0 text-primary/60" strokeWidth={2} />
            <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-medium">{title}</span>
                {subtitle ? (
                    <span className="mt-0.5 block truncate text-[11px] text-base-content/45">{subtitle}</span>
                ) : null}
            </span>
        </button>
    );
}
