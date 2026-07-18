const LOGGING_OUT_OVERLAY_ID = "gommo-logging-out-overlay";
const LOGGING_OUT_STYLES_ID = "gommo-logging-out-styles";
const TAGLINE = "Gestão de DP e RH";
const TITLE = "Encerrando sessão";
const SUBTITLE = "Aguarde enquanto finalizamos com segurança...";

/** Brand azul Gommo — valores literais (overlay não depende de globals.css). */
const BRAND = {
    primary: "#007bff",
    primaryLight: "#2da8f7",
    primaryDark: "#0062cc",
    primaryDarker: "#004a99",
    primary950: "#0a1b2e",
    primary100: "#bae4ff",
} as const;

const OVERLAY_INLINE_STYLE = [
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
    `background:rgba(45,168,247,0.22)`,
    "-webkit-backdrop-filter:blur(28px) saturate(1.35) brightness(1.05)",
    "backdrop-filter:blur(28px) saturate(1.35) brightness(1.05)",
].join(";");

/** Estilos embutidos: cobertura imediata sem depender do chunk de globals.css. */
const EMBEDDED_STYLES = `
.logging-out-screen {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    height: 100dvh;
    z-index: 2147483647;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
    isolation: isolate;
    pointer-events: all;
}
.logging-out-screen__visual {
    position: absolute;
    inset: 0;
    z-index: 0;
    overflow: hidden;
}
.logging-out-screen__visual-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center right;
}
.logging-out-screen__scrim {
    position: absolute;
    inset: 0;
    background: linear-gradient(
        105deg,
        rgba(0, 123, 255, 0.22) 0%,
        rgba(45, 168, 247, 0.12) 46%,
        transparent 58%
    );
    pointer-events: none;
}
.logging-out-screen__backdrop {
    position: absolute;
    inset: 0;
    z-index: 0;
    background: linear-gradient(
        160deg,
        rgba(0, 123, 255, 0.36) 0%,
        rgba(45, 168, 247, 0.22) 42%,
        rgba(143, 212, 255, 0.16) 100%
    );
    -webkit-backdrop-filter: blur(32px) saturate(1.4) brightness(1.08);
    backdrop-filter: blur(32px) saturate(1.4) brightness(1.08);
}
.logging-out-screen__content {
    position: relative;
    z-index: 1;
    display: flex;
    width: min(92vw, 28rem);
    padding: clamp(0.75rem, 2.2vh, 1.25rem);
}
.logging-out-screen__card {
    display: flex;
    width: 100%;
    flex-direction: column;
    align-items: center;
    gap: 0.875rem;
    padding: clamp(2rem, 5vh, 2.75rem) clamp(1.75rem, 4vw, 2.5rem);
    text-align: center;
    border-radius: 1rem;
    border: 1px solid rgba(255, 255, 255, 0.14);
    background: linear-gradient(
        165deg,
        rgba(255, 255, 255, 0.14) 0%,
        rgba(255, 255, 255, 0.06) 38%,
        rgba(186, 228, 255, 0.08) 100%
    );
    -webkit-backdrop-filter: blur(72px) saturate(1.85) brightness(1.1);
    backdrop-filter: blur(72px) saturate(1.85) brightness(1.1);
    box-shadow:
        inset 0 1px 1px rgba(255, 255, 255, 0.28),
        inset 0 -1px 0 rgba(255, 255, 255, 0.06),
        0 8px 32px rgba(0, 0, 0, 0.2),
        0 20px 56px rgba(0, 123, 255, 0.18);
    animation: logging-out-card-in 0.34s cubic-bezier(0.22, 1, 0.36, 1) both;
}
@keyframes logging-out-card-in {
    from { opacity: 0.9; transform: translateY(8px) scale(0.985); }
    to { opacity: 1; transform: translateY(0) scale(1); }
}
.logging-out-screen__logo {
    display: block;
    height: 2.75rem;
    width: auto;
    max-width: min(14rem, 72vw);
    object-fit: contain;
    filter: brightness(0) invert(1);
}
.logging-out-screen__tagline {
    margin: -0.25rem 0 0;
    font-size: 0.75rem;
    font-weight: 500;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.52);
}
.logging-out-screen__loader {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 3rem;
    height: 3rem;
    margin-top: 0.5rem;
}
.logging-out-screen__ring {
    width: 2.25rem;
    height: 2.25rem;
    border-radius: 9999px;
    border: 2px solid rgba(255, 255, 255, 0.18);
    border-top-color: ${BRAND.primaryLight};
    border-right-color: rgba(45, 168, 247, 0.6);
    animation: logging-out-spin 0.75s linear infinite;
}
@keyframes logging-out-spin {
    to { transform: rotate(360deg); }
}
.logging-out-screen__title {
    margin: 0.25rem 0 0;
    font-size: 1.125rem;
    font-weight: 600;
    letter-spacing: -0.01em;
    color: #fff;
    text-shadow: 0 1px 12px rgba(0, 0, 0, 0.2);
}
.logging-out-screen__subtitle {
    margin: 0;
    max-width: 18rem;
    font-size: 0.875rem;
    line-height: 1.5;
    color: rgba(255, 255, 255, 0.68);
}
.logging-out-screen__progress {
    width: 100%;
    height: 3px;
    margin-top: 0.5rem;
    overflow: hidden;
    border-radius: 9999px;
    background: rgba(255, 255, 255, 0.12);
}
.logging-out-screen__progress-bar {
    width: 42%;
    height: 100%;
    border-radius: inherit;
    background: linear-gradient(
        90deg,
        transparent 0%,
        ${BRAND.primaryLight} 45%,
        #fff 55%,
        ${BRAND.primary} 100%
    );
    animation: logging-out-progress 1.35s ease-in-out infinite;
}
@keyframes logging-out-progress {
    0% { transform: translateX(-120%); }
    100% { transform: translateX(320%); }
}
`.trim();

function resolveLogoutWallpaperSrc(): string {
    if (typeof document === "undefined") {
        return "/brand/gommo-login-bg-dark.png";
    }
    const theme = document.documentElement.getAttribute("data-theme");
    if (theme === "light") {
        return "/brand/gommo-login-bg-light.png";
    }
    if (theme === "dark") {
        return "/brand/gommo-login-bg-dark.png";
    }
    return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "/brand/gommo-login-bg-dark.png"
        : "/brand/gommo-login-bg-light.png";
}

function ensureOverlayStyles(): void {
    if (typeof document === "undefined") {
        return;
    }
    let style = document.getElementById(LOGGING_OUT_STYLES_ID) as HTMLStyleElement | null;
    if (!style) {
        style = document.createElement("style");
        style.id = LOGGING_OUT_STYLES_ID;
        document.head.appendChild(style);
    }
    style.textContent = EMBEDDED_STYLES;
}

function buildLoggingOutOverlayMarkup(): string {
    const wallpaperSrc = resolveLogoutWallpaperSrc();
    return `
        <div class="logging-out-screen__visual" aria-hidden="true">
            <img
                src="${wallpaperSrc}"
                alt=""
                class="logging-out-screen__visual-img"
                decoding="sync"
            />
            <div class="logging-out-screen__scrim"></div>
        </div>
        <div class="logging-out-screen__backdrop" aria-hidden="true"></div>
        <div class="logging-out-screen__content">
            <div class="logging-out-screen__card">
                <div class="logging-out-screen__loader" aria-hidden="true">
                    <span class="logging-out-screen__ring"></span>
                </div>
                <p class="logging-out-screen__title">${TITLE}</p>
                <p class="logging-out-screen__subtitle">${SUBTITLE}</p>
                <div class="logging-out-screen__progress" aria-hidden="true">
                    <div class="logging-out-screen__progress-bar"></div>
                </div>
            </div>
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
    ensureOverlayStyles();
    const overlay = document.createElement("div");
    overlay.id = LOGGING_OUT_OVERLAY_ID;
    overlay.className = "logging-out-screen";
    overlay.setAttribute("role", "status");
    overlay.setAttribute("aria-live", "polite");
    overlay.setAttribute("aria-busy", "true");
    overlay.setAttribute("aria-label", TITLE);
    overlay.style.cssText = OVERLAY_INLINE_STYLE;
    overlay.innerHTML = buildLoggingOutOverlayMarkup();
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    document.body.appendChild(overlay);
}
