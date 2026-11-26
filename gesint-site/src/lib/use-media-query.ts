"use client";

import {useEffect, useState} from "react";

/** Largura a partir da qual o site usa o layout de desktop (animações ligadas à rolagem e ao cursor). */
export const DESKTOP_QUERY = "(min-width: 1024px)";

/**
 * Se a media query casa agora, acompanhando mudanças (rotação, redimensionar a janela).
 * `undefined` até a primeira medição no navegador, para quem precisa esperar antes de decidir.
 */
export function useMediaQuery(query: string) {
    const [matches, setMatches] = useState<boolean>();
    useEffect(() => {
        const media = window.matchMedia(query);
        const update = () => setMatches(media.matches);
        update();
        media.addEventListener("change", update);
        return () => media.removeEventListener("change", update);
    }, [query]);
    return matches;
}
