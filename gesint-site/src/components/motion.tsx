"use client";

import {
    animate,
    MotionConfig,
    motion,
    useInView,
    useMotionValueEvent,
    useReducedMotion,
    useScroll,
    useSpring,
    useTransform,
    type Variants,
} from "framer-motion";
import Lenis from "lenis";
import {useEffect, useRef, useState, type ReactNode} from "react";

/** Mesma curva do `gesint-frontend` (gesint-ui-system.mdc §12). */
export const EASE = [0.22, 1, 0.36, 1] as const;

/** Altura do cabeçalho fixo; âncoras param logo abaixo dele. */
const HEADER_OFFSET = 88;

/**
 * Rolagem macia (Lenis) + respeito a "reduzir movimento" do sistema.
 * Com redução ativa, nada de inércia: a rolagem fica nativa.
 */
export function MotionProvider({children}: {children: ReactNode}) {
    const reduce = useReducedMotion();

    useEffect(() => {
        if (reduce) return;
        const lenis = new Lenis({
            autoRaf: true,
            lerp: 0.09,
            anchors: {offset: -HEADER_OFFSET, duration: 1.2},
        });
        return () => lenis.destroy();
    }, [reduce]);

    return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}

type RevealProps = {
    children: ReactNode;
    className?: string;
    delay?: number;
    /** Deslocamento vertical inicial em px. */
    y?: number;
};

/** Aparece ao entrar na tela: sobe e ganha opacidade, uma vez só. */
export function Reveal({children, className, delay = 0, y = 24}: RevealProps) {
    return (
        <motion.div
            className={className}
            initial={{opacity: 0, y}}
            whileInView={{opacity: 1, y: 0}}
            viewport={{once: true, amount: 0.2}}
            transition={{duration: 0.7, ease: EASE, delay}}
        >
            {children}
        </motion.div>
    );
}

const groupVariants: Variants = {
    hidden: {},
    show: {transition: {staggerChildren: 0.08}},
};

const itemVariants: Variants = {
    hidden: {opacity: 0, y: 24},
    show: {opacity: 1, y: 0, transition: {duration: 0.7, ease: EASE}},
};

/** Grupo cujos itens (`RevealItem`) entram em sequência. */
export function RevealGroup({children, className, as = "div"}: {children: ReactNode; className?: string; as?: "div" | "ul" | "ol"}) {
    const Component = motion[as];
    return (
        <Component className={className} variants={groupVariants} initial="hidden" whileInView="show" viewport={{once: true, amount: 0.15}}>
            {children}
        </Component>
    );
}

export function RevealItem({children, className, as = "div"}: {children: ReactNode; className?: string; as?: "div" | "li"}) {
    const Component = motion[as];
    return (
        <Component className={className} variants={itemVariants}>
            {children}
        </Component>
    );
}

/** Título que entra linha a linha, cada uma subindo de dentro de uma máscara. */
export function LineReveal({lines, className, delay = 0, as = "h1"}: {lines: string[]; className?: string; delay?: number; as?: "h1" | "h2" | "p"}) {
    const Component = motion[as];
    return (
        <Component className={className} initial="hidden" animate="show" variants={{show: {transition: {staggerChildren: 0.09, delayChildren: delay}}}}>
            {lines.map((line) => (
                <span key={line} className="block overflow-hidden pb-[0.08em] -mb-[0.08em]">
                    <motion.span
                        className="block"
                        variants={{hidden: {y: "105%"}, show: {y: "0%", transition: {duration: 0.9, ease: EASE}}}}
                    >
                        {line}
                    </motion.span>
                </span>
            ))}
        </Component>
    );
}

/** Entrada no carregamento da página (sem depender de rolagem). */
export function Enter({children, className, delay = 0, y = 16}: RevealProps) {
    return (
        <motion.div
            className={className}
            initial={{opacity: 0, y}}
            animate={{opacity: 1, y: 0}}
            transition={{duration: 0.8, ease: EASE, delay}}
        >
            {children}
        </motion.div>
    );
}

/** Desloca o conteúdo levemente conforme a rolagem, dando profundidade. */
export function Parallax({children, className, distance = 40}: {children: ReactNode; className?: string; distance?: number}) {
    const ref = useRef<HTMLDivElement>(null);
    const {scrollYProgress} = useScroll({target: ref, offset: ["start end", "end start"]});
    const y = useTransform(scrollYProgress, [0, 1], [distance, -distance]);
    return (
        <motion.div ref={ref} className={className} style={{y}}>
            {children}
        </motion.div>
    );
}

/**
 * Cabeçalho fixo: ganha fundo ao rolar, esconde ao descer e volta ao subir.
 * Inclui uma barra fina de progresso de leitura.
 */
export function StickyHeader({children}: {children: ReactNode}) {
    const {scrollY, scrollYProgress} = useScroll();
    const [scrolled, setScrolled] = useState(false);
    const [hidden, setHidden] = useState(false);
    const progress = useSpring(scrollYProgress, {stiffness: 200, damping: 30, restDelta: 0.001});

    useMotionValueEvent(scrollY, "change", (current) => {
        const previous = scrollY.getPrevious() ?? 0;
        setScrolled(current > 8);
        setHidden(current > 240 && current > previous);
    });

    return (
        <motion.header
            className={`sticky top-0 z-40 transition-[background-color,backdrop-filter] duration-300 ${
                scrolled ? "bg-surface/85 backdrop-blur-md" : "bg-transparent"
            }`}
            animate={{y: hidden ? "-100%" : "0%"}}
            transition={{duration: 0.45, ease: EASE}}
        >
            {children}
            <motion.div aria-hidden className="absolute inset-x-0 bottom-0 h-[2px] origin-left bg-brand" style={{scaleX: progress}}/>
        </motion.header>
    );
}

/** Número que conta do zero até o valor quando entra na tela. */
export function CountUp({value, className}: {value: number; className?: string}) {
    const ref = useRef<HTMLSpanElement>(null);
    const inView = useInView(ref, {once: true, amount: 0.6});
    const reduce = useReducedMotion();
    const [shown, setShown] = useState(0);

    useEffect(() => {
        if (!inView || reduce) return;
        const controls = animate(0, value, {duration: 1.4, ease: EASE, onUpdate: (latest) => setShown(Math.round(latest))});
        return () => controls.stop();
    }, [inView, reduce, value]);

    return (
        <span ref={ref} className={`tabular-nums ${className ?? ""}`}>
            {(reduce ? value : shown).toLocaleString("pt-BR")}
        </span>
    );
}

/**
 * Linha que se preenche conforme o bloco atravessa a tela (linha do tempo da admissão).
 * `axis="x"` no desktop, `"y"` na versão vertical do celular. Quem usa posiciona (ex.: `absolute`).
 */
export function ScrollLine({className, axis = "x"}: {className?: string; axis?: "x" | "y"}) {
    const ref = useRef<HTMLDivElement>(null);
    const {scrollYProgress} = useScroll({target: ref, offset: ["start 85%", "end 45%"]});
    const progress = useSpring(scrollYProgress, {stiffness: 120, damping: 30, restDelta: 0.001});
    return (
        <div ref={ref} aria-hidden className={`overflow-hidden bg-line ${className ?? ""}`}>
            <motion.span
                className={`absolute inset-0 bg-brand ${axis === "x" ? "origin-left" : "origin-top"}`}
                style={axis === "x" ? {scaleX: progress} : {scaleY: progress}}
            />
        </div>
    );
}

/**
 * Texto que se digita sozinho quando entra na tela e avisa quando termina (`onDone`).
 * Com "reduzir movimento" o texto aparece inteiro de uma vez.
 */
export function Typewriter({text, className, delay = 0, speed = 28, onDone}: {text: string; className?: string; delay?: number; speed?: number; onDone?: () => void}) {
    const ref = useRef<HTMLSpanElement>(null);
    const inView = useInView(ref, {once: true, amount: 0.8});
    const reduce = useReducedMotion();
    const [count, setCount] = useState(0);
    const done = useRef(onDone);

    useEffect(() => {
        done.current = onDone;
    }, [onDone]);

    useEffect(() => {
        if (!inView) return;
        if (reduce) {
            done.current?.();
            return;
        }
        let index = 0;
        let interval: ReturnType<typeof setInterval> | undefined;
        const start = setTimeout(() => {
            interval = setInterval(() => {
                index += 1;
                setCount(index);
                if (index >= text.length) {
                    clearInterval(interval);
                    done.current?.();
                }
            }, speed);
        }, delay * 1000);
        return () => {
            clearTimeout(start);
            clearInterval(interval);
        };
    }, [inView, reduce, text, delay, speed]);

    const visible = reduce ? text : text.slice(0, count);
    const typing = !reduce && inView && count < text.length;

    return (
        <span ref={ref} className={className}>
            {/* O texto inteiro fica para leitores de tela; o digitado é só visual. */}
            <span className="sr-only">{text}</span>
            <span aria-hidden>
                {visible}
                {typing && <span className="ml-px inline-block h-[1em] w-px translate-y-[2px] animate-pulse bg-current"/>}
            </span>
        </span>
    );
}
