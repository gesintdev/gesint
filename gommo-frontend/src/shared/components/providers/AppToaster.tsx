"use client";

import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Toaster } from "sonner";

/**
 * Toasts acima de `<dialog showModal()>`: precisam estar na top layer.
 * `showModal()` no host do toast deixava a página inert (bloqueava cliques).
 * Popover API (`popover=manual`) sobe na top layer sem bloquear a UI abaixo.
 */
export function AppToaster() {
    const { resolvedTheme } = useTheme();
    const hostRef = useRef<HTMLDivElement>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) {
            return;
        }
        const host = hostRef.current;
        if (!host || typeof host.showPopover !== "function") {
            return;
        }

        let syncing = false;
        const syncLayer = () => {
            if (syncing) {
                return;
            }
            const hasToast = Boolean(host.querySelector("[data-sonner-toast]"));
            syncing = true;
            try {
                if (hasToast) {
                    // hide + show reempilha acima de dialogs que abriram depois
                    if (host.matches(":popover-open")) {
                        host.hidePopover();
                    }
                    host.showPopover();
                } else if (host.matches(":popover-open")) {
                    host.hidePopover();
                }
            } catch {
                // Navegadores sem Popover API / estado inválido — mantém z-index padrão.
            } finally {
                syncing = false;
            }
        };

        const observer = new MutationObserver(syncLayer);
        observer.observe(host, { childList: true, subtree: true });
        // Dialog de negócio abrindo/fechando: reempilha o toast se ainda visível.
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ["open"],
            subtree: true,
        });
        syncLayer();

        return () => {
            observer.disconnect();
            if (host.matches(":popover-open")) {
                try {
                    host.hidePopover();
                } catch {
                    // ignore
                }
            }
        };
    }, [mounted]);

    if (!mounted) {
        return null;
    }

    return createPortal(
        <div
            ref={hostRef}
            popover="manual"
            className="gommo-toast-top-layer"
            aria-label="Notificações"
        >
            <Toaster
                richColors
                position="top-center"
                closeButton
                theme={resolvedTheme === "dark" ? "dark" : "light"}
            />
        </div>,
        document.body,
    );
}
