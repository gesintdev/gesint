"use client";

import {
    forwardRef,
    type PointerEvent as ReactPointerEvent,
    type RefObject,
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";
import { createPortal } from "react-dom";

import { usePopoverPortalRoot } from "@/shared/components/ui/input/popover-portal";

type Hsv = { h: number; s: number; v: number };

type ColorPickerPanelProps = {
    value: string;
    onChange: (hex: string) => void;
    anchorRef: RefObject<HTMLElement | null>;
};

function clamp(n: number, min: number, max: number) {
    return Math.min(max, Math.max(min, n));
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    if (!/^#[0-9A-Fa-f]{6}$/.test(hex)) return null;
    return {
        r: parseInt(hex.slice(1, 3), 16),
        g: parseInt(hex.slice(3, 5), 16),
        b: parseInt(hex.slice(5, 7), 16),
    };
}

function rgbToHex(r: number, g: number, b: number): string {
    const to = (n: number) => clamp(Math.round(n), 0, 255).toString(16).padStart(2, "0");
    return `#${to(r)}${to(g)}${to(b)}`.toUpperCase();
}

function rgbToHsv(r: number, g: number, b: number): Hsv {
    const rn = r / 255;
    const gn = g / 255;
    const bn = b / 255;
    const max = Math.max(rn, gn, bn);
    const min = Math.min(rn, gn, bn);
    const d = max - min;
    let h = 0;
    if (d !== 0) {
        if (max === rn) h = ((gn - bn) / d) % 6;
        else if (max === gn) h = (bn - rn) / d + 2;
        else h = (rn - gn) / d + 4;
        h *= 60;
        if (h < 0) h += 360;
    }
    const s = max === 0 ? 0 : d / max;
    return { h, s, v: max };
}

function hsvToRgb(h: number, s: number, v: number): { r: number; g: number; b: number } {
    const c = v * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = v - c;
    let rp = 0;
    let gp = 0;
    let bp = 0;
    if (h < 60) [rp, gp, bp] = [c, x, 0];
    else if (h < 120) [rp, gp, bp] = [x, c, 0];
    else if (h < 180) [rp, gp, bp] = [0, c, x];
    else if (h < 240) [rp, gp, bp] = [0, x, c];
    else if (h < 300) [rp, gp, bp] = [x, 0, c];
    else [rp, gp, bp] = [c, 0, x];
    return { r: (rp + m) * 255, g: (gp + m) * 255, b: (bp + m) * 255 };
}

function hsvToHex(hsv: Hsv): string {
    const { r, g, b } = hsvToRgb(hsv.h, hsv.s, hsv.v);
    return rgbToHex(r, g, b);
}

function hueCss(h: number): string {
    const { r, g, b } = hsvToRgb(h, 1, 1);
    return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
}

function hexToHsv(hex: string): Hsv {
    const rgb = hexToRgb(hex);
    return rgb ? rgbToHsv(rgb.r, rgb.g, rgb.b) : { h: 210, s: 1, v: 0.8 };
}

const PANEL_WIDTH = 240;
/** Altura aproximada do painel (SV + hue + preview + swatches + padding). */
const PANEL_HEIGHT_FALLBACK = 292;
const PANEL_GAP = 6;
const PANEL_EDGE = 8;

function readAnchorPosition(anchor: HTMLElement | null, panelHeight = PANEL_HEIGHT_FALLBACK) {
    if (!anchor || typeof window === "undefined") return { top: 0, left: 0 };
    const rect = anchor.getBoundingClientRect();
    const height = Math.max(panelHeight, 1);
    const left = clamp(rect.left, PANEL_EDGE, window.innerWidth - PANEL_WIDTH - PANEL_EDGE);
    const spaceBelow = window.innerHeight - rect.bottom - PANEL_EDGE;
    const spaceAbove = rect.top - PANEL_EDGE;
    const openUp = spaceBelow < height && spaceAbove > spaceBelow;
    const top = openUp
        ? clamp(rect.top - PANEL_GAP - height, PANEL_EDGE, window.innerHeight - height - PANEL_EDGE)
        : clamp(rect.bottom + PANEL_GAP, PANEL_EDGE, window.innerHeight - height - PANEL_EDGE);
    return { top, left };
}

const SWATCHES = [
    "#0062CC",
    "#0EA5E9",
    "#10B981",
    "#8B5CF6",
    "#EC4899",
    "#F59E0B",
    "#EF4444",
    "#64748B",
    "#111827",
    "#FFFFFF",
];

export const ColorPickerPanel = forwardRef<HTMLDivElement, ColorPickerPanelProps>(function ColorPickerPanel(
    { value, onChange, anchorRef },
    ref,
) {
    const portalRoot = usePopoverPortalRoot();
    const [ready, setReady] = useState(false);
    const [position, setPosition] = useState({ top: 0, left: 0 });
    const [hsv, setHsv] = useState(() => hexToHsv(value));
    const hsvRef = useRef(hsv);
    hsvRef.current = hsv;
    const panelHeightRef = useRef(PANEL_HEIGHT_FALLBACK);
    const panelElRef = useRef<HTMLDivElement | null>(null);
    const lastEmittedRef = useRef(value.toUpperCase());
    const onChangeRef = useRef(onChange);
    onChangeRef.current = onChange;

    const setPanelRef = useCallback(
        (node: HTMLDivElement | null) => {
            panelElRef.current = node;
            if (typeof ref === "function") ref(node);
            else if (ref) ref.current = node;
        },
        [ref],
    );

    useEffect(() => {
        setPosition(readAnchorPosition(anchorRef.current, PANEL_HEIGHT_FALLBACK));
        setReady(true);
    }, [anchorRef]);

    useEffect(() => {
        if (!ready) return;

        const updatePosition = () => {
            const el = panelElRef.current;
            if (el) panelHeightRef.current = el.getBoundingClientRect().height || panelHeightRef.current;
            setPosition(readAnchorPosition(anchorRef.current, panelHeightRef.current));
        };

        updatePosition();
        window.addEventListener("resize", updatePosition);
        window.addEventListener("scroll", updatePosition, true);
        return () => {
            window.removeEventListener("resize", updatePosition);
            window.removeEventListener("scroll", updatePosition, true);
        };
    }, [anchorRef, ready]);

    useEffect(() => {
        const next = value.toUpperCase();
        if (next === lastEmittedRef.current) return;
        lastEmittedRef.current = next;
        setHsv(hexToHsv(next));
    }, [value]);

    const commit = useCallback((next: Hsv) => {
        const hex = hsvToHex(next);
        lastEmittedRef.current = hex;
        setHsv(next);
        onChangeRef.current(hex);
    }, []);

    const svRef = useRef<HTMLDivElement>(null);
    const hueRef = useRef<HTMLDivElement>(null);

    const pickSv = useCallback((clientX: number, clientY: number) => {
        const el = svRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const s = clamp((clientX - rect.left) / rect.width, 0, 1);
        const v = clamp(1 - (clientY - rect.top) / rect.height, 0, 1);
        commit({ ...hsvRef.current, s, v });
    }, [commit]);

    const pickHue = useCallback((clientX: number) => {
        const el = hueRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const h = clamp(((clientX - rect.left) / rect.width) * 360, 0, 359.999);
        commit({ ...hsvRef.current, h });
    }, [commit]);

    const bindDrag = (onMove: (x: number, y: number) => void) => (event: ReactPointerEvent<HTMLDivElement>) => {
        event.preventDefault();
        const target = event.currentTarget;
        target.setPointerCapture(event.pointerId);
        onMove(event.clientX, event.clientY);
        const move = (e: PointerEvent) => onMove(e.clientX, e.clientY);
        const up = () => {
            try {
                target.releasePointerCapture(event.pointerId);
            } catch {
                /* already released */
            }
            window.removeEventListener("pointermove", move);
            window.removeEventListener("pointerup", up);
        };
        window.addEventListener("pointermove", move);
        window.addEventListener("pointerup", up);
    };

    const mountNode = portalRoot ?? (typeof document !== "undefined" ? document.body : null);
    if (!ready || !mountNode) return null;

    const hex = hsvToHex(hsv);
    const hueColor = hueCss(hsv.h);

    return createPortal(
        <div
            ref={setPanelRef}
            className="surface-popover fixed z-200 w-[240px] p-3"
            style={{ top: position.top, left: position.left }}
            role="dialog"
            aria-label="Seletor de cor"
        >
            <div
                ref={svRef}
                className="relative h-36 w-full cursor-crosshair touch-none overflow-hidden rounded-lg"
                style={{
                    background: `
                        linear-gradient(to top, #000, transparent),
                        linear-gradient(to right, #fff, ${hueColor})
                    `,
                }}
                onPointerDown={bindDrag((x, y) => pickSv(x, y))}
            >
                <span
                    className="pointer-events-none absolute size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-md"
                    style={{
                        left: `${hsv.s * 100}%`,
                        top: `${(1 - hsv.v) * 100}%`,
                        background: hex,
                    }}
                />
            </div>

            <div
                ref={hueRef}
                className="relative mt-3 h-3 w-full cursor-ew-resize touch-none rounded-full"
                style={{
                    background:
                        "linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)",
                }}
                onPointerDown={bindDrag((x) => pickHue(x))}
            >
                <span
                    className="pointer-events-none absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-md"
                    style={{ left: `${(hsv.h / 360) * 100}%`, background: hueColor }}
                />
            </div>

            <div className="mt-3 flex items-center gap-2">
                <span className="size-8 shrink-0 rounded-md border border-base-content/15" style={{ background: hex }} />
                <span className="font-mono text-xs font-medium tracking-wide text-base-content/80">{hex}</span>
            </div>

            <div className="mt-3 flex flex-wrap gap-1.5">
                {SWATCHES.map((swatch) => (
                    <button
                        key={swatch}
                        type="button"
                        title={swatch}
                        className="size-5 rounded-md border border-base-content/15 transition hover:scale-110"
                        style={{ background: swatch }}
                        onClick={() => commit(hexToHsv(swatch))}
                    />
                ))}
            </div>
        </div>,
        mountNode,
    );
});
