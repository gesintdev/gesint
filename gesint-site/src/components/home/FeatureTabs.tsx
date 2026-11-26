"use client";

import {AnimatePresence, motion} from "framer-motion";
import {useId, useState} from "react";

import {EASE} from "@/components/motion";

export type FeatureTab = {
    id: string;
    label: string;
    summary: string;
    items: {title: string; description: string}[];
};

/**
 * Abas de recursos. No desktop a lista de abas fica à esquerda, com um filete azul que desliza até a ativa;
 * no celular vira uma fileira rolável acima do conteúdo. O conteúdo troca com um fade curto.
 */
export function FeatureTabs({tabs}: {tabs: FeatureTab[]}) {
    const [active, setActive] = useState(tabs[0].id);
    const baseId = useId();
    const current = tabs.find((tab) => tab.id === active) ?? tabs[0];

    return (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,300fr)_minmax(0,944fr)] lg:gap-5">
            <div
                role="tablist"
                aria-label="Módulos"
                className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] md:-mx-10 md:px-10 lg:mx-0 lg:flex-col lg:gap-0 lg:overflow-visible lg:px-0"
            >
                {tabs.map((tab, index) => {
                    const selected = tab.id === active;
                    return (
                        <button
                            key={tab.id}
                            type="button"
                            role="tab"
                            id={`${baseId}-tab-${tab.id}`}
                            aria-selected={selected}
                            aria-controls={`${baseId}-panel`}
                            onClick={() => setActive(tab.id)}
                            className={`relative flex shrink-0 items-baseline gap-4 rounded-[5px] px-4 py-3 text-left transition-colors duration-500 lg:rounded-none lg:border-b lg:border-line lg:px-0 lg:py-[22px] ${
                                selected ? "bg-white text-ink lg:bg-transparent" : "text-muted hover:text-ink"
                            }`}
                        >
                            <span className="text-[12px] text-muted">{String(index + 1).padStart(2, "0")}</span>
                            <span className="whitespace-nowrap text-[16px] lg:text-[20px] lg:font-light">{tab.label}</span>
                            {selected && (
                                <motion.span
                                    layoutId={`${baseId}-indicator`}
                                    aria-hidden
                                    className="absolute inset-x-0 -bottom-px hidden h-px bg-brand lg:block"
                                    transition={{duration: 0.6, ease: EASE}}
                                />
                            )}
                        </button>
                    );
                })}
            </div>

            <div id={`${baseId}-panel`} role="tabpanel" aria-labelledby={`${baseId}-tab-${current.id}`} className="rounded-md bg-white px-5 pt-6 pb-8 md:px-8 md:pt-7">
                <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                        key={current.id}
                        initial={{opacity: 0, y: 10}}
                        animate={{opacity: 1, y: 0}}
                        exit={{opacity: 0, y: -6}}
                        transition={{duration: 0.35, ease: EASE}}
                    >
                        <p className="max-w-[560px] text-[20px] font-light text-ink md:text-[22px]">{current.summary}</p>
                        <div aria-hidden className="mt-6 h-px bg-line"/>
                        <ul className="mt-2 grid gap-x-10 sm:grid-cols-2">
                            {current.items.map((item, index) => (
                                <motion.li
                                    key={item.title}
                                    initial={{opacity: 0, y: 8}}
                                    animate={{opacity: 1, y: 0}}
                                    transition={{duration: 0.45, ease: EASE, delay: 0.04 * index}}
                                    className="group flex gap-4 border-b border-line py-[18px] last:border-b-0 sm:[&:nth-last-child(2):nth-child(odd)]:border-b-0"
                                >
                                    <span aria-hidden className="w-[18px] shrink-0 pt-px text-brand transition-transform duration-500 group-hover:translate-x-0.5">
                                        —
                                    </span>
                                    <div>
                                        <p className="text-[15px] font-medium text-ink">{item.title}</p>
                                        <p className="mt-1 text-[14px] text-muted">{item.description}</p>
                                    </div>
                                </motion.li>
                            ))}
                        </ul>
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
