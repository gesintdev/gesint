"use client";

import {
    motion,
    useMotionTemplate,
    useReducedMotion,
    useScroll,
    useSpring,
    useTransform,
    type MotionValue,
} from "framer-motion";
import {Children, useRef, type ReactNode} from "react";

import {Reveal} from "@/components/motion";
import {DESKTOP_QUERY, useMediaQuery} from "@/lib/use-media-query";

/**
 * Cards de soluções como um baralho ligado à rolagem.
 *
 * Ao entrar na tela, os três estão recolhidos no centro, abertos em leque como cartas na mão.
 * Conforme a página desce, eles se espalham até o grid; ao subir, voltam ao leque.
 * Só no desktop (3 colunas). Abaixo disso, e com "reduzir movimento", o grid fica parado.
 */
export function SolutionDeck({children, className}: {children: ReactNode; className?: string}) {
    const ref = useRef<HTMLDivElement>(null);
    const reduce = useReducedMotion();
    const isDesktop = useMediaQuery(DESKTOP_QUERY);
    // Abre do momento em que os cards surgem até o topo deles chegar a 70% da tela.
    const {scrollYProgress} = useScroll({target: ref, offset: ["start 100%", "start 70%"]});
    const progress = useSpring(scrollYProgress, {stiffness: 170, damping: 26, mass: 0.5});
    const cards = Children.toArray(children);
    const animate = isDesktop && !reduce;

    return (
        <div ref={ref} className={className}>
            {cards.map((card, index) =>
                animate ? (
                    <DeckCard key={index} index={index} total={cards.length} progress={progress}>
                        {card}
                    </DeckCard>
                ) : (
                    <Reveal key={index} delay={index * 0.08}>
                        {card}
                    </Reveal>
                ),
            )}
        </div>
    );
}

function DeckCard({
    children,
    index,
    total,
    progress,
}: {
    children: ReactNode;
    index: number;
    total: number;
    progress: MotionValue<number>;
}) {
    const center = (total - 1) / 2;
    /** -1 para o da esquerda, 0 no meio, 1 para o da direita. */
    const side = index - center;

    // Recolhido: cada card de trás avança 55% da própria largura rumo ao meio (o leque fica bem à mostra).
    const x = useTransform(progress, [0, 1], [-side * 55, 0]);
    const y = useTransform(progress, [0, 1], [Math.abs(side) * 24 + 40, 0]);
    const rotate = useTransform(progress, [0, 1], [side * 5, 0]);
    const scale = useTransform(progress, [0, 1], [side === 0 ? 1 : 0.94, 1]);
    const opacity = useTransform(progress, [0, 0.25], [side === 0 ? 0.4 : 0, 1]);
    // O conteúdo dos cards de trás só aparece quando eles já se afastaram do meio.
    const contentOpacity = useTransform(progress, [side === 0 ? 0 : 0.3, side === 0 ? 0.3 : 0.8], [side === 0 ? 0.6 : 0.15, 1]);
    const shadowAlpha = useTransform(progress, [0, 1], [0.18, 0]);
    const boxShadow = useMotionTemplate`0 24px 48px -20px rgba(17, 29, 39, ${shadowAlpha})`;
    const xPercent = useMotionTemplate`${x}%`;

    return (
        <motion.div
            className="relative rounded-md bg-white will-change-transform"
            style={{
                x: xPercent,
                y,
                rotate,
                scale,
                opacity,
                boxShadow,
                zIndex: side === 0 ? 3 : 2,
                transformOrigin: "50% 100%",
            }}
        >
            <motion.div className="h-full" style={{opacity: contentOpacity}}>
                {children}
            </motion.div>
        </motion.div>
    );
}
