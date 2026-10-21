"use client";

import clsx from "clsx";
import {AnimatePresence, motion} from "framer-motion";
import {CalendarDays, Clock, EllipsisVertical, Sparkles} from "lucide-react";
import {useEffect, useRef, useState} from "react";

type HeaderMoreMenuProps = {
    onAgenda: () => void;
    onClock: () => void;
    onAiAssistant?: () => void;
    aiAssistantOpen?: boolean;
    showAiAssistant?: boolean;
};

/**
 * Agrupa ações secundárias do header em telas menores que lg (Agenda, Ponto, Assistente IA),
 * liberando espaço sem remover funcionalidade no mobile/tablet.
 */
export function HeaderMoreMenu({
    onAgenda,
    onClock,
    onAiAssistant,
    aiAssistantOpen = false,
    showAiAssistant = true,
}: HeaderMoreMenuProps) {
    const [open, setOpen] = useState(false);
    const rootRef = useRef<HTMLDivElement>(null);

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

    const run = (action: () => void) => {
        setOpen(false);
        action();
    };

    return (
        <div ref={rootRef} className="relative lg:hidden">
            <button
                type="button"
                aria-label="Mais ações"
                aria-expanded={open}
                aria-haspopup="menu"
                onClick={() => setOpen((value) => !value)}
                className={clsx(
                    "gesint-btn gesint-btn--ghost gesint-btn--icon-only text-base-content/55",
                    open && "bg-base-content/7 text-base-content/80",
                )}
            >
                <EllipsisVertical className="size-4" strokeWidth={2}/>
            </button>
            <AnimatePresence>
                {open ? (
                    <motion.div
                        role="menu"
                        aria-label="Ações do header"
                        initial={{opacity: 0, y: -4, scale: 0.98}}
                        animate={{opacity: 1, y: 0, scale: 1}}
                        exit={{opacity: 0, y: -4, scale: 0.98}}
                        transition={{duration: 0.14, ease: [0.22, 1, 0.36, 1]}}
                        className="absolute end-0 top-[calc(100%+0.35rem)] z-50 w-52 overflow-hidden rounded-xl border border-(--gesint-border) bg-base-100 py-1 shadow-(--gesint-shadow-md)"
                    >
                        <button
                            type="button"
                            role="menuitem"
                            onClick={() => run(onAgenda)}
                            className="flex w-full items-center gap-2.5 px-3 py-2.5 text-start text-[13px] text-base-content/80 transition-colors hover:bg-base-content/6"
                        >
                            <CalendarDays className="size-4 shrink-0 text-base-content/45" strokeWidth={2}/>
                            Agenda
                        </button>
                        <button
                            type="button"
                            role="menuitem"
                            onClick={() => run(onClock)}
                            className="flex w-full items-center gap-2.5 px-3 py-2.5 text-start text-[13px] text-base-content/80 transition-colors hover:bg-base-content/6"
                        >
                            <Clock className="size-4 shrink-0 text-base-content/45" strokeWidth={2}/>
                            Registro de ponto
                        </button>
                        {showAiAssistant && onAiAssistant ? (
                            <button
                                type="button"
                                role="menuitem"
                                onClick={() => run(onAiAssistant)}
                                className={clsx(
                                    "flex w-full items-center gap-2.5 px-3 py-2.5 text-start text-[13px] transition-colors hover:bg-base-content/6",
                                    aiAssistantOpen ? "text-primary" : "text-base-content/80",
                                )}
                            >
                                <Sparkles
                                    className={clsx("size-4 shrink-0", aiAssistantOpen ? "text-primary" : "text-base-content/45")}
                                    strokeWidth={2}
                                />
                                Assistente IA
                            </button>
                        ) : null}
                    </motion.div>
                ) : null}
            </AnimatePresence>
        </div>
    );
}
