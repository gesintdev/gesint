import type { CSSProperties } from "react";

import type { CareersBranding, CareersCornerStyle, CareersFontStyle } from "@/modules/careers/shared/dto/careers.dto";

const HEX = /^#[0-9A-Fa-f]{6}$/;

const FONT_STACKS: Record<CareersFontStyle, string> = {
    MODERN: 'var(--font-inter, Inter), system-ui, sans-serif',
    ROUNDED: 'var(--font-outfit), var(--font-jakarta, "Plus Jakarta Sans"), system-ui, sans-serif',
    CLASSIC: 'Georgia, Cambria, "Times New Roman", serif',
};

const RADIUS: Record<CareersCornerStyle, string> = {
    ROUNDED: "14px",
    SOFT: "6px",
    SQUARE: "0px",
};

export const CAREERS_FONT_STYLE_OPTIONS: { value: CareersFontStyle; label: string }[] = [
    { value: "MODERN", label: "Moderna (Inter)" },
    { value: "ROUNDED", label: "Arredondada (Outfit)" },
    { value: "CLASSIC", label: "Clássica (serifada)" },
];

export const CAREERS_CORNER_STYLE_OPTIONS: { value: CareersCornerStyle; label: string }[] = [
    { value: "ROUNDED", label: "Arredondados" },
    { value: "SOFT", label: "Suaves" },
    { value: "SQUARE", label: "Retos" },
];

function relativeLuminance(hex: string): number {
    const channel = (offset: number) => {
        const value = parseInt(hex.slice(offset, offset + 2), 16) / 255;
        return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
    };
    return 0.2126 * channel(1) + 0.7152 * channel(3) + 0.0722 * channel(5);
}

/** Cor de texto legível (branco ou quase preto) sobre o fundo informado. */
export function readableContentColor(hex: string): string {
    const luminance = relativeLuminance(hex);
    const contrastWithWhite = 1.05 / (luminance + 0.05);
    const contrastWithDark = (luminance + 0.05) / 0.05;
    return contrastWithWhite >= contrastWithDark ? "#ffffff" : "#111827";
}

/** Razão de contraste WCAG entre a cor e o texto escolhido (para alertar no editor). */
export function contrastRatio(hex: string): number {
    if (!HEX.test(hex)) return 21;
    const luminance = relativeLuminance(hex);
    const content = readableContentColor(hex);
    const contentLuminance = content === "#ffffff" ? 1 : relativeLuminance("#111827");
    const [light, dark] = luminance > contentLuminance ? [luminance, contentLuminance] : [contentLuminance, luminance];
    return (light + 0.05) / (dark + 0.05);
}

/**
 * Variáveis CSS aplicadas no contêiner do site. Cores vazias mantêm o tema padrão do Gesint.
 * O `@theme inline` do globals.css compila `bg-primary`/`text-primary` direto para `--gommo-primary*`,
 * por isso a paleta `--gommo-primary*` é sobrescrita junto com `--color-primary`.
 */
export function careersThemeStyle(branding?: Partial<CareersBranding> | null): CSSProperties {
    const style: Record<string, string> = {
        "--careers-radius": RADIUS[branding?.cornerStyle ?? "ROUNDED"],
        fontFamily: FONT_STACKS[branding?.fontStyle ?? "MODERN"],
    };
    const primary = branding?.primaryColor;
    if (primary && HEX.test(primary)) {
        const shade = (mix: string, percent: number) => `color-mix(in srgb, ${primary} ${percent}%, ${mix})`;
        style["--gommo-primary"] = primary;
        style["--gommo-primary-700"] = primary;
        style["--gommo-primary-dark"] = shade("black", 82);
        style["--gommo-primary-800"] = shade("black", 82);
        style["--gommo-primary-darker"] = shade("black", 64);
        style["--gommo-primary-light"] = shade("white", 80);
        style["--gommo-primary-500"] = shade("white", 80);
        style["--gommo-primary-50"] = shade("white", 8);
        style["--gommo-primary-100"] = shade("white", 20);
        style["--color-primary"] = primary;
        style["--color-primary-content"] = readableContentColor(primary);
    }
    const accent = branding?.accentColor;
    if (accent && HEX.test(accent)) {
        style["--careers-accent"] = accent;
        style["--careers-accent-content"] = readableContentColor(accent);
    }
    return style as CSSProperties;
}
