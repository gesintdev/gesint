"use client";

import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Toaster } from "sonner";

/**
 * Toasts acima de `<dialog showModal()>`: o Sonner precisa estar na top layer.
 * Popover no nó do Sonner é frágil; um `<dialog>` dedicado (só enquanto há toast)
 * entra na top layer por cima do modal aberto.
 */
export function AppToaster() {
    const { resolvedTheme } = useTheme();
    const dialogRef = useRef<HTMLDialogElement>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) {
            return;
        }
        const dialog = dialogRef.current;
        if (!dialog) {
            return;
        }

        let syncing = false;
        const syncLayer = () => {
            if (syncing) {
                return;
            }
            const hasToast = Boolean(dialog.querySelector("[data-sonner-toast]"));
            syncing = true;
            try {
                if (hasToast) {
                    // close + showModal reempilha acima de qualquer modal já aberto
                    if (dialog.open) {
                        dialog.close();
                    }
                    dialog.showModal();
                } else if (dialog.open) {
                    dialog.close();
                }
            } catch {
                // ignore
            } finally {
                syncing = false;
            }
        };

        const observer = new MutationObserver(syncLayer);
        observer.observe(dialog, { childList: true, subtree: true });
        syncLayer();

        return () => {
            observer.disconnect();
            if (dialog.open) {
                try {
                    dialog.close();
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
        <dialog
            ref={dialogRef}
            className="gommo-toast-top-layer"
            aria-label="Notificações"
            onCancel={(event) => {
                // Esc deve ir para o modal de negócio, não fechar a camada de toast.
                event.preventDefault();
            }}
        >
            <Toaster
                richColors
                position="top-center"
                closeButton
                theme={resolvedTheme === "dark" ? "dark" : "light"}
            />
        </dialog>,
        document.body,
    );
}
