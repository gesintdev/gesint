"use client";
import { useServerInsertedHTML } from "next/navigation";

import { GOMMO_THEME_INIT_SCRIPT } from "@/shared/lib/theme-init-script";

export function ThemeInitScript() {
    useServerInsertedHTML(() => (
        <script id="gommo-theme-init" dangerouslySetInnerHTML={{ __html: GOMMO_THEME_INIT_SCRIPT }} />
    ));

    return null;
}
