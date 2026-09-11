"use client";

import { useServerInsertedHTML } from "next/navigation";
import { useRef } from "react";

import { GOMMO_THEME_INIT_SCRIPT } from "@/shared/lib/theme-init-script";

/**
 * Injeta o script de tema no `<head>` via SSR (`useServerInsertedHTML`).
 * Evita o warning do React 19 sobre `<script>` no tree do client e mantém
 * a prevenção de flash (inserção no head antes do paint).
 */
export function ThemeInitScript() {
    const inserted = useRef(false);

    useServerInsertedHTML(() => {
        if (inserted.current) {
            return null;
        }
        inserted.current = true;
        return <script id="gommo-theme-init" dangerouslySetInnerHTML={{ __html: GOMMO_THEME_INIT_SCRIPT }} />;
    });

    return null;
}
