import clsx from "clsx";
import type { CSSProperties } from "react";

/**
 * Marcas da Gesint.
 *
 * O SVG é aplicado como máscara CSS: o arquivo define a forma, o CSS define a cor. Assim
 * `/public/brand/*.svg` segue sendo a fonte única da arte — trocar o arquivo troca o logo em
 * todo o sistema, sem path duplicado dentro de componente.
 *
 * `width`/`height` espelham o viewBox do arquivo e servem só para derivar a proporção
 * (largura = altura × proporção). Só precisam mudar se a arte mudar de proporção.
 */
const LOGO_MARKS = {
    /** Logo completo: símbolo + "gesint". viewBox 853.31 5943.18 27992.31 9127.89 */
    wordmark: { src: "/brand/gesint-logo-blue.svg", width: 27992.31, height: 9127.89 },
    /** Só o símbolo, para espaços estreitos (topo da sidebar). viewBox 1857.41 2549.78 17284.08 24614.71 */
    monogram: { src: "/brand/logo-gesint-letterb-blue.svg", width: 17284.08, height: 24614.71 },
} as const;

export type SystemLogoVariant = keyof typeof LOGO_MARKS;

type SystemLogoProps = {
    /** `wordmark` = logo completo (padrão); `monogram` = só o símbolo. */
    variant?: SystemLogoVariant;
    /** Altura do logo. Número = px; string = qualquer unidade CSS. A largura sai da proporção. */
    size?: number | string;
    /**
     * Qualquer cor CSS. Padrão: segue o tema (azul da marca no claro, branco no dark) via
     * `--system-logo-color`. Use `"currentColor"` para herdar a cor do texto ao redor.
     */
    color?: string;
    /** Texto acessível. Sem ele o logo é decorativo (`aria-hidden`). */
    title?: string;
    className?: string;
    style?: CSSProperties;
};

/**
 * A máscara vai em style inline, não em classe do globals.css, de propósito: o componente fica
 * autocontido e continua renderizando mesmo quando o CSS global está obsoleto (cache do dev
 * server, ordem de carregamento, purge). Foi exatamente esse acoplamento — o height travado em
 * `.gesint-logo__icon` — que impedia redimensionar o logo do login.
 */
function maskStyle(src: string): CSSProperties {
    const url = `url("${src}")`;
    return {
        display: "inline-block",
        flexShrink: 0,
        backgroundColor: "currentColor",
        maskImage: url,
        maskPosition: "center",
        maskRepeat: "no-repeat",
        maskSize: "contain",
        WebkitMaskImage: url,
        WebkitMaskPosition: "center",
        WebkitMaskRepeat: "no-repeat",
        WebkitMaskSize: "contain",
        pointerEvents: "none",
        userSelect: "none",
    };
}

export function SystemLogo({
    variant = "wordmark",
    size = "1.5rem",
    // Cadeia de fallback: token do tema → brand → literal. O literal garante que o logo apareça
    // mesmo se o globals.css não tiver carregado (só a troca por tema depende dele).
    color = "var(--system-logo-color, var(--gesint-primary, #007bff))",
    title,
    className,
    style,
}: SystemLogoProps) {
    const mark = LOGO_MARKS[variant];

    return (
        <span
            className={clsx("system-logo", className)}
            style={{
                ...maskStyle(mark.src),
                height: typeof size === "number" ? `${size}px` : size,
                aspectRatio: `${mark.width} / ${mark.height}`,
                color,
                ...style,
            }}
            {...(title ? { role: "img", "aria-label": title } : { "aria-hidden": true })}
        />
    );
}
