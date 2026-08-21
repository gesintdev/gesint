import type { CSSProperties } from "react";

/**
 * Camada decorativa do login: o "G" metálico à deriva e as bolhas por cima do fundo.
 *
 * Sem `"use client"` e sem JS: toda a animação é CSS. O palco só existe a partir de 1024px
 * (ver `.login-stage` no globals.css), o mesmo breakpoint em que o formulário passa a ocupar
 * 50% — então as bolhas nunca cobrem o formulário por construção, e não por acidente de
 * z-index. Abaixo disso a coluna do ícone é `display: none` por inteiro.
 *
 * A deriva do "G" sai de três animações aninhadas com períodos primos entre si (23s / 31s /
 * 41s). Como não têm múltiplo comum curto, o movimento resultante só se repetiria depois de
 * horas — parece aleatório sem precisar de `Math.random()`, que quebraria a hidratação.
 */

/**
 * Passos da paleta do sistema usados nas bolhas — cor chapada, uma por bolha.
 *
 * Faixa 200–800 de propósito: os extremos (100 e 900) só funcionam em um dos temas. Como as
 * cores não trocam entre claro e escuro (só o fundo troca), toda cor aqui precisa ler nos dois.
 */
const BUBBLE_COLORS = {
    p2: "var(--gommo-primary-200)",
    p3: "var(--gommo-primary-300)",
    p4: "var(--gommo-primary-400)",
    p5: "var(--gommo-primary-500)",
    p6: "var(--gommo-primary-600)",
    p7: "var(--gommo-primary-700)",
    p8: "var(--gommo-primary-800)",
    lt: "var(--gommo-primary-light)",
    in: "var(--gommo-info)",
} as const;

/**
 * `[x%, y%, ⌀vmin, dx vmin, dy vmin, cor, opacidade, blur vmin, duração s, atraso s]`
 *
 * Tupla em vez de objeto para a tabela caber numa linha por bolha e continuar legível de
 * relance — é o formato que se ajusta ao vivo. `vmin` faz tamanho, deriva e blur escalarem
 * com o viewport.
 *
 * O blur é o que dá a suavidade (não há gradiente: a cor é chapada) e varia de ~10% a ~40%
 * do diâmetro, para as bolhas não parecerem todas do mesmo material.
 *
 * Configuração fixa em vez de aleatória: `Math.random()` no render daria divergência de
 * hidratação, e uma lista curada distribui melhor que o acaso (que agrupa). A sensação de
 * aleatoriedade vem dos períodos e atrasos desencontrados.
 */
type Bubble = [number, number, number, number, number, keyof typeof BUBBLE_COLORS, number, number, number, number];

const BUBBLES: Bubble[] = [
    [20, 22, 13, 7, -11, "p4", 0.42, 2.2, 26, 0],
    [62, 14, 7, -9, 13, "p3", 0.5, 1.0, 21, 3.5],
    [80, 38, 17, -6, -9, "p6", 0.34, 4.6, 33, 1.2],
    [36, 62, 9, 11, -7, "in", 0.46, 1.6, 24, 6.8],
    [72, 74, 21, -8, -13, "p5", 0.3, 6.2, 38, 2.4],
    [17, 78, 6, 9, -10, "p2", 0.56, 0.8, 19, 9.1],
    [48, 34, 11, -12, 8, "lt", 0.38, 3.2, 29, 4.7],
    [88, 60, 8, -7, 12, "p8", 0.44, 1.4, 23, 11.5],
    [28, 44, 15, 8, 10, "p7", 0.28, 5.2, 35, 7.3],
    [58, 88, 10, 6, -14, "p3", 0.4, 2.6, 27, 0.9],
    [92, 18, 12, -10, 9, "p5", 0.36, 3.8, 31, 5.6],
    [15, 52, 7, 13, 6, "p8", 0.48, 1.2, 22, 13.2],
    [44, 8, 18, 5, 12, "p6", 0.26, 7.0, 41, 8.4],
    [68, 50, 5, -11, -8, "p2", 0.6, 0.7, 18, 15.7],
];

function bubbleStyle([x, y, size, dx, dy, color, opacity, blur, duration, delay]: Bubble): CSSProperties {
    return {
        "--bubble-x": `${x}%`,
        "--bubble-y": `${y}%`,
        "--bubble-size": `${size}vmin`,
        "--bubble-dx": `${dx}vmin`,
        "--bubble-dy": `${dy}vmin`,
        "--bubble-color": BUBBLE_COLORS[color],
        "--bubble-opacity": opacity,
        "--bubble-blur": `${blur}vmin`,
        "--bubble-duration": `${duration}s`,
        "--bubble-delay": `${delay}s`,
    } as CSSProperties;
}

export function LoginStage() {
    return (
        <div className="login-stage" aria-hidden="true">
            <div className="login-stage__mark-x">
                <div className="login-stage__mark-y">
                    {/* background-image, não <img>: assim o PNG não é baixado no mobile, onde
                        .login-stage é display:none. Um <img> escondido ainda seria baixado. */}
                    <div className="login-stage__mark" />
                </div>
            </div>
            <div className="login-stage__bubbles">
                {BUBBLES.map((bubble, index) => (
                    <span key={index} className="login-bubble" style={bubbleStyle(bubble)} />
                ))}
            </div>
        </div>
    );
}
