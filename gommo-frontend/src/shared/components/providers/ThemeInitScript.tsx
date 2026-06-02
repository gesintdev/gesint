"use client";

import {useServerInsertedHTML} from "next/navigation";
import {GOMMO_THEME_INIT_SCRIPT} from "@/shared/lib/theme-init-script";

/**
 * Injeta o init de tema no HTML do SSR (antes da hidratação), sem renderizar
 * `<script>` na árvore React do client — compatível com React 19 + next-themes.
 */
export function ThemeInitScript() {
    useServerInsertedHTML(() => (
        <script
            id="gommo-theme-init"
            dangerouslySetInnerHTML={{__html: GOMMO_THEME_INIT_SCRIPT}}
        />
    ));

    return null;
}
