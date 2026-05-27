"use client";

import clsx from "clsx";
import {motion} from "framer-motion";
import type {ReactNode} from "react";

type PageTransitionProps = {
    children: ReactNode;
    /** Preenche a altura disponível (páginas de cadastro com CrudScreen). */
    fillHeight?: boolean;
    /** Desliga animação de entrada (evita jump ao trocar abas do workspace). */
    animate?: boolean;
};

export function PageTransition({children, fillHeight = false, animate = true}: PageTransitionProps) {
    const className = clsx(fillHeight ? "flex min-h-0 flex-1 flex-col" : "grid gap-3");

    if (!animate) {
        return <div className={className}>{children}</div>;
    }

    return (
        <motion.div
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            transition={{duration: 0.2, ease: [0.22, 1, 0.36, 1]}}
            className={className}
        >
            {children}
        </motion.div>
    );
}
