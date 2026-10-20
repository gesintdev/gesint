/**
 * Camada decorativa do painel da marca no login: grade pontilhada, brilho difuso e o "G"
 * metálico flutuando devagar.
 *
 * Sem `"use client"` e sem JS: toda a animação é CSS (`.login-stage*` no globals.css) e respeita
 * `prefers-reduced-motion`. O "G" é background-image, não <img>: abaixo de 1024px o painel
 * inteiro é `display: none`, e um <img> escondido ainda seria baixado.
 */
export function LoginStage() {
    return (
        <div className="login-stage" aria-hidden="true">
            <div className="login-stage__grid" />
            <div className="login-stage__glow login-stage__glow--a" />
            <div className="login-stage__glow login-stage__glow--b" />
            <div className="login-stage__mark" />
        </div>
    );
}
