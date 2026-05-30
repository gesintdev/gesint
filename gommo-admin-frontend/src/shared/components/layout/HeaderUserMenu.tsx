"use client";

import clsx from "clsx";
import {AnimatePresence, motion} from "framer-motion";
import {ChevronDown, LogOut, Settings} from "lucide-react";
import {signOut, useSession} from "next-auth/react";
import {useEffect, useRef, useState} from "react";
import {userInitials} from "@/shared/lib/user-display";

function UserIdentity({
                          name,
                          email,
                          compact = false,
                      }: {
    name: string;
    email?: string | null;
    compact?: boolean;
}) {
    return (
        <span className={clsx("min-w-0 text-left", compact ? "hidden sm:block" : "block")}>
            <span className="block truncate text-[13px] font-semibold leading-tight text-base-content">
                {name}
            </span>
            {email ? (
                <span className="mt-0.5 block truncate text-[11px] leading-tight text-base-content/45">
                    {email}
                </span>
            ) : null}
        </span>
    );
}

export function HeaderUserMenu() {
    const {data: session} = useSession();
    const [open, setOpen] = useState(false);
    const rootRef = useRef<HTMLDivElement>(null);

    const name = session?.user?.name ?? "Usuário";
    const email = session?.user?.email;
    const initials = userInitials(name);

    useEffect(() => {
        if (!open) return;

        const onPointerDown = (e: MouseEvent) => {
            if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") setOpen(false);
        };

        document.addEventListener("mousedown", onPointerDown);
        document.addEventListener("keydown", onKeyDown);
        return () => {
            document.removeEventListener("mousedown", onPointerDown);
            document.removeEventListener("keydown", onKeyDown);
        };
    }, [open]);

    return (
        <div ref={rootRef} className="relative ms-0.5 sm:ms-1">
            <button
                type="button"
                aria-label="Menu do usuário"
                aria-expanded={open}
                aria-haspopup="menu"
                onClick={() => setOpen((v) => !v)}
                className={clsx(
                    "flex items-center gap-2 rounded-[10px] py-1 ps-1 pe-2.5 transition-colors duration-150",
                    open ? "bg-primary/8" : "hover:bg-base-200/70 dark:hover:bg-base-300/40",
                )}
            >
                <span
                    className="flex size-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white"
                    style={{
                        background:
                            "linear-gradient(135deg, var(--gommo-primary-light) 0%, var(--gommo-primary-dark) 100%)",
                    }}
                >
                    {initials}
                </span>
                <UserIdentity name={name} email={email} compact/>
                <ChevronDown
                    className={clsx(
                        "hidden size-3 shrink-0 text-base-content/35 transition-transform duration-200 sm:block",
                        open && "rotate-180",
                    )}
                />
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        role="menu"
                        aria-label="Conta do usuário"
                        initial={{opacity: 0, y: -5, scale: 0.97}}
                        animate={{opacity: 1, y: 0, scale: 1}}
                        exit={{opacity: 0, y: -5, scale: 0.97}}
                        transition={{duration: 0.18, ease: [0.22, 1, 0.36, 1]}}
                        className="surface-popover absolute right-0 z-50 mt-2 min-w-[14rem] origin-top-right p-1.5"
                    >
                        <div className="flex items-center gap-3 rounded-[10px] px-3 py-2.5">
                            <span
                                className="flex size-9 shrink-0 items-center justify-center rounded-full text-[12px] font-bold text-white"
                                style={{
                                    background:
                                        "linear-gradient(135deg, var(--gommo-primary-light) 0%, var(--gommo-primary-darker) 100%)",
                                    boxShadow: "var(--gommo-shadow-sm)",
                                }}
                            >
                                {initials}
                            </span>
                            <UserIdentity name={name} email={email}/>
                        </div>

                        <div className="my-1 h-px bg-base-content/8"/>

                        <button
                            type="button"
                            role="menuitem"
                            className="nav-item gap-2.5 !px-3 text-left text-[13px]"
                        >
                            <Settings className="size-[15px] shrink-0 text-base-content/38" strokeWidth={2}/>
                            Configurações
                        </button>

                        <div className="my-1 h-px bg-base-content/8"/>

                        <button
                            type="button"
                            role="menuitem"
                            className="nav-item gap-2.5 !px-3 text-left text-[13px] text-error hover:bg-error/8 hover:text-error"
                            onClick={() => signOut({callbackUrl: "/login"})}
                        >
                            <LogOut className="size-[15px] shrink-0" strokeWidth={2}/>
                            Sair da conta
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
