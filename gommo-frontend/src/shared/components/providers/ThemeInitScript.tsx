import { GOMMO_THEME_INIT_SCRIPT } from "@/shared/lib/theme-init-script";

/** Script bloqueante no `<head>` — aplica tema antes do primeiro paint. */
export function ThemeInitScript() {
    return (
        <script id="gommo-theme-init" dangerouslySetInnerHTML={{ __html: GOMMO_THEME_INIT_SCRIPT }} />
    );
}
