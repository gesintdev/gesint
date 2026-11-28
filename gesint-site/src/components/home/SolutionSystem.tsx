"use client";

import {motion, useMotionTemplate, useReducedMotion, useScroll, useSpring, useTransform, type MotionValue} from "framer-motion";
import {useRef, type ReactNode} from "react";

import {Reveal} from "@/components/motion";
import {DESKTOP_QUERY, useMediaQuery} from "@/lib/use-media-query";

/** Espaço (px) entre o sistema e cada produto no desktop; é por onde passam as conexões. */
const GAP = 48;

type Direction = "left" | "right" | "down";

/**
 * Soluções como um sistema: a Gestão integrada no meio e os produtos saindo de dentro dela.
 *
 * Desktop: cruz de 3 colunas. Departamento pessoal sai para a esquerda, Recursos humanos para a
 * direita e Gestão de ponto para baixo, cada um ligado ao centro por uma conexão. Ligado à rolagem:
 * os produtos começam escondidos atrás do card do meio e deslizam para fora; ao subir, voltam.
 * Celular e "reduzir movimento": a mesma composição sem animação (no celular, empilhada).
 */
export function SolutionSystem({
    center,
    left,
    right,
    bottom,
}: {
    center: ReactNode;
    left: ReactNode;
    right: ReactNode;
    bottom: ReactNode;
}) {
    const ref = useRef<HTMLDivElement>(null);
    const reduce = useReducedMotion();
    const isDesktop = useMediaQuery(DESKTOP_QUERY);
    // Abre do momento em que o sistema surge até o topo dele passar de 45% da tela.
    const {scrollYProgress} = useScroll({target: ref, offset: ["start 92%", "start 40%"]});
    const progress = useSpring(scrollYProgress, {stiffness: 150, damping: 26, mass: 0.6});
    const animate = isDesktop === true && !reduce;

    return (
        <div
            ref={ref}
            className="mt-10 grid grid-cols-1 gap-4 lg:mt-[60px] lg:grid-cols-3 lg:gap-x-12 lg:gap-y-12"
        >
            <SystemCore animate={animate} progress={progress}>
                {center}
            </SystemCore>
            <Product direction="left" animate={animate} progress={progress} className="lg:col-start-1 lg:row-start-1">
                {left}
            </Product>
            <Product direction="right" animate={animate} progress={progress} className="lg:col-start-3 lg:row-start-1">
                {right}
            </Product>
            <Product direction="down" animate={animate} progress={progress} className="lg:col-start-2 lg:row-start-2">
                {bottom}
            </Product>
        </div>
    );
}

function SystemCore({children, animate, progress}: {children: ReactNode; animate: boolean; progress: MotionValue<number>}) {
    const scale = useTransform(progress, [0, 0.35], [0.96, 1]);
    const content = (
        <>
            <Connector direction="left" animate={animate} progress={progress}/>
            <Connector direction="right" animate={animate} progress={progress}/>
            <Connector direction="down" animate={animate} progress={progress}/>
            {children}
        </>
    );
    return (
        <div className="relative z-20 lg:col-start-2 lg:row-start-1">
            {animate ? (
                <motion.div className="relative h-full will-change-transform" style={{scale}}>
                    {content}
                </motion.div>
            ) : (
                <Reveal className="relative h-full">{content}</Reveal>
            )}
        </div>
    );
}

function Product({
    children,
    direction,
    animate,
    progress,
    className,
}: {
    children: ReactNode;
    direction: Direction;
    animate: boolean;
    progress: MotionValue<number>;
    className: string;
}) {
    // Recolhido: o produto fica inteiro atrás do sistema (a própria medida + o espaço entre eles).
    const percent = useTransform(progress, [0.12, 1], [100, 0]);
    const pixels = useTransform(progress, [0.12, 1], [GAP, 0]);
    const sign = direction === "right" || direction === "down" ? "-" : "";
    const offset = useMotionTemplate`calc(${sign}${percent}% ${sign ? "-" : "+"} ${pixels}px)`;
    const scale = useTransform(progress, [0.12, 1], [0.9, 1]);
    const opacity = useTransform(progress, [0.08, 0.4], [0, 1]);

    if (!animate) {
        return (
            <Reveal className={`relative z-10 ${className}`} delay={direction === "down" ? 0.16 : 0.08}>
                {children}
            </Reveal>
        );
    }
    return (
        <motion.div
            className={`relative z-10 will-change-transform ${className}`}
            style={{
                x: direction === "down" ? 0 : offset,
                y: direction === "down" ? offset : 0,
                scale,
                opacity,
            }}
        >
            {children}
        </motion.div>
    );
}

/** Ligação do sistema a um produto: linha tracejada que se desenha do centro para fora, com um nó na ponta. */
function Connector({direction, animate, progress}: {direction: Direction; animate: boolean; progress: MotionValue<number>}) {
    const draw = useTransform(progress, [0.45, 0.95], [0, 1]);
    const horizontal = direction !== "down";
    const position =
        direction === "left"
            ? "right-full top-[calc(50%-1px)]"
            : direction === "right"
              ? "left-full top-1/2 -translate-y-1/2"
              : "top-full left-[calc(50%-1px)]";
    const origin = direction === "left" ? "100% 50%" : direction === "right" ? "0% 50%" : "50% 0%";
    const node =
        direction === "left" ? "left-0 top-1/2 -translate-x-1/2 -translate-y-1/2" : direction === "right" ? "right-0 top-1/2 translate-x-1/2 -translate-y-1/2" : "bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2";

    return (
        <motion.span
            aria-hidden
            className={`absolute hidden rounded-[1px] lg:block ${horizontal ? "h-[2px] bg-[repeating-linear-gradient(90deg,var(--color-brand)_0_6px,transparent_6px_11px)]" : "w-[2px] bg-[repeating-linear-gradient(180deg,var(--color-brand)_0_6px,transparent_6px_11px)]"} ${position}`}
            style={{
                width: horizontal ? GAP : undefined,
                height: horizontal ? undefined : GAP,
                transformOrigin: origin,
                scaleX: horizontal && animate ? draw : undefined,
                scaleY: !horizontal && animate ? draw : undefined,
            }}
        >
            <span className={`absolute size-[9px] rounded-full bg-brand shadow-[0_0_0_4px_rgba(0,123,255,0.18)] ${node}`}/>
        </motion.span>
    );
}
