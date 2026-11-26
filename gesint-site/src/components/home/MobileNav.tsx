"use client";

import {AnimatePresence, motion} from "framer-motion";
import {SmartLink} from "@/components/SmartLink";
import {useEffect, useState} from "react";

import {EASE} from "@/components/motion";
import {ButtonLink} from "@/components/ui";
import {links, navItems} from "@/lib/links";

/** Menu do celular: abre sob o botão e fecha ao escolher um destino ou apertar Esc. */
export function MobileNav() {
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (!open) return;
        const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open]);

    const close = () => setOpen(false);

    return (
        <div className="relative lg:hidden">
            <button
                type="button"
                aria-label={open ? "Fechar menu" : "Abrir menu"}
                aria-expanded={open}
                aria-controls="menu-celular"
                onClick={() => setOpen((value) => !value)}
                className="flex size-11 cursor-pointer items-center justify-center rounded-[5px] text-ink"
            >
                <span className="relative block h-3 w-5">
                    <span className={`absolute inset-x-0 top-0 h-px bg-current transition-transform duration-300 ${open ? "translate-y-1.5 rotate-45" : ""}`}/>
                    <span className={`absolute inset-x-0 bottom-0 h-px bg-current transition-transform duration-300 ${open ? "-translate-y-[5px] -rotate-45" : ""}`}/>
                </span>
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        id="menu-celular"
                        initial={{opacity: 0, y: -6}}
                        animate={{opacity: 1, y: 0}}
                        exit={{opacity: 0, y: -6}}
                        transition={{duration: 0.25, ease: EASE}}
                        className="absolute right-0 top-full z-20 mt-2 flex w-64 flex-col gap-1 rounded-md bg-white p-3 shadow-[0_12px_32px_rgba(17,29,39,0.12)]"
                    >
                        {navItems.map((item) => (
                            <SmartLink key={item.href} href={item.href} onClick={close} className="rounded px-3 py-2.5 text-[15px] text-ink hover:bg-surface">
                                {item.label}
                            </SmartLink>
                        ))}
                        <SmartLink href={links.login} onClick={close} className="rounded px-3 py-2.5 text-[14px] text-muted hover:bg-surface">
                            Entrar
                        </SmartLink>
                        <ButtonLink href={links.contact} onClick={close} className="mt-1 justify-center">
                            Fale com a Gesint
                        </ButtonLink>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
