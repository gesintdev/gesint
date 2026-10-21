const LOGGING_OUT_OVERLAY_ID = "gesint-logging-out-overlay";
const LOGGING_OUT_STYLES_ID = "gesint-logging-out-styles";
const TITLE = "Encerrando sessão";
const MONOGRAM_SRC = "/brand/logo-gesint-letterb-blue.svg";

/**
 * Paletas literais por tema: o overlay cobre a tela no instante do clique e não pode depender
 * do chunk de globals.css nem dos tokens CSS (que somem junto com a árvore do app no signOut).
 * Mesmo visual do AppLoadingScreen (`.app-loading*` no globals.css).
 */
const PALETTES = {
    light: {
        page: "#f3f7f8",
        muted: "rgba(10, 27, 46, 0.62)",
        track: "rgba(10, 27, 46, 0.08)",
        primary: "#007bff",
        glow: "rgba(0, 123, 255, 0.06)",
    },
    dark: {
        page: "oklch(12% 0.018 260)",
        muted: "rgba(235, 240, 248, 0.62)",
        track: "rgba(255, 255, 255, 0.1)",
        primary: "#2da8f7",
        glow: "rgba(0, 123, 255, 0.07)",
    },
} as const;

type Palette = (typeof PALETTES)[keyof typeof PALETTES];

function resolvePalette(): Palette {
    if (typeof document === "undefined") {
        return PALETTES.light;
    }
    const theme = document.documentElement.getAttribute("data-theme");
    if (theme === "dark") {
        return PALETTES.dark;
    }
    if (theme === "gesint" || theme === "light") {
        return PALETTES.light;
    }
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? PALETTES.dark : PALETTES.light;
}

function overlayInlineStyle(palette: Palette): string {
    return [
        "position:fixed",
        "top:0",
        "left:0",
        "width:100vw",
        "height:100vh",
        "height:100dvh",
        "z-index:2147483647",
        "display:flex",
        "align-items:center",
        "justify-content:center",
        "overflow:hidden",
        "margin:0",
        "padding:0",
        "box-sizing:border-box",
        `background:${palette.page}`,
    ].join(";");
}

/** Estilos embutidos: cobertura imediata sem depender do chunk de globals.css. */
function embeddedStyles(palette: Palette): string {
    return `
.logging-out-screen {
    flex-direction: column;
    gap: 1.125rem;
    font-family: var(--font-inter, Inter), system-ui, -apple-system, "Segoe UI", sans-serif;
    text-align: center;
    isolation: isolate;
    pointer-events: all;
    background:
        radial-gradient(circle at 50% 46%, ${palette.glow} 0, transparent 18rem),
        ${palette.page} !important;
    animation: logging-out-in 0.28s ease-out both;
}
@keyframes logging-out-in {
    from { opacity: 0; }
    to { opacity: 1; }
}
.logging-out-screen__mark {
    position: relative;
    display: flex;
    width: 4rem;
    height: 4rem;
    align-items: center;
    justify-content: center;
    animation: logging-out-breathe 2.4s ease-in-out infinite;
}
@keyframes logging-out-breathe {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.04); }
}
.logging-out-screen__ring {
    position: absolute;
    inset: -0.75rem;
    border-radius: 9999px;
    border: 2px solid ${palette.track};
    border-top-color: ${palette.primary};
    border-right-color: ${palette.primary}59;
    animation: logging-out-spin 1.1s cubic-bezier(0.55, 0.15, 0.45, 0.85) infinite;
}
@keyframes logging-out-spin {
    to { transform: rotate(360deg); }
}
.logging-out-screen__logo {
    display: block;
    width: 1.15rem;
    height: 1.625rem;
    background: ${palette.primary};
    -webkit-mask: url("${MONOGRAM_SRC}") center / contain no-repeat;
    mask: url("${MONOGRAM_SRC}") center / contain no-repeat;
}
.logging-out-screen__title {
    margin: 0;
    font-size: 0.875rem;
    font-weight: 500;
    color: ${palette.muted};
}
.logging-out-screen__progress {
    width: 9rem;
    height: 3px;
    overflow: hidden;
    border-radius: 9999px;
    background: ${palette.track};
}
.logging-out-screen__progress-bar {
    width: 40%;
    height: 100%;
    border-radius: inherit;
    background: ${palette.primary};
    animation: logging-out-progress 1.4s cubic-bezier(0.65, 0, 0.35, 1) infinite;
}
@keyframes logging-out-progress {
    from { transform: translateX(-110%); }
    to { transform: translateX(260%); }
}
@media (prefers-reduced-motion: reduce) {
    .logging-out-screen,
    .logging-out-screen__mark { animation: none; }
    .logging-out-screen__ring,
    .logging-out-screen__progress-bar { animation-duration: 3s; }
}
`.trim();
}

function ensureOverlayStyles(palette: Palette): void {
    if (typeof document === "undefined") {
        return;
    }
    let style = document.getElementById(LOGGING_OUT_STYLES_ID) as HTMLStyleElement | null;
    if (!style) {
        style = document.createElement("style");
        style.id = LOGGING_OUT_STYLES_ID;
        document.head.appendChild(style);
    }
    style.textContent = embeddedStyles(palette);
}

function buildLoggingOutOverlayMarkup(): string {
    return `
        <div class="logging-out-screen__mark" aria-hidden="true">
            <span class="logging-out-screen__ring"></span>
            <span class="logging-out-screen__logo"></span>
        </div>
        <p class="logging-out-screen__title">${TITLE}</p>
        <div class="logging-out-screen__progress" aria-hidden="true">
            <div class="logging-out-screen__progress-bar"></div>
        </div>
    `.trim();
}

export async function flushLoggingOutOverlay(): Promise<void> {
    const el = document.getElementById(LOGGING_OUT_OVERLAY_ID);
    if (el) {
        void el.getBoundingClientRect();
    }
    await new Promise<void>((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
    });
}

export function showLoggingOutOverlay(): void {
    if (typeof document === "undefined" || document.getElementById(LOGGING_OUT_OVERLAY_ID)) {
        return;
    }
    const palette = resolvePalette();
    ensureOverlayStyles(palette);
    const overlay = document.createElement("div");
    overlay.id = LOGGING_OUT_OVERLAY_ID;
    overlay.className = "logging-out-screen";
    overlay.setAttribute("role", "status");
    overlay.setAttribute("aria-live", "polite");
    overlay.setAttribute("aria-busy", "true");
    overlay.setAttribute("aria-label", TITLE);
    overlay.style.cssText = overlayInlineStyle(palette);
    overlay.innerHTML = buildLoggingOutOverlayMarkup();
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    document.body.appendChild(overlay);
}
