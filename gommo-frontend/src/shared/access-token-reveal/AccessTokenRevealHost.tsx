"use client";

import { Copy, KeyRound, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import {
    useAccessTokenRevealStore,
} from "@/shared/access-token-reveal/access-token-reveal.store";
import { Button } from "@/shared/components/ui/Button";

const CLOSE_AFTER_COPY_MS = 900;

export function AccessTokenRevealHost() {
    const current = useAccessTokenRevealStore((s) => s.current);
    const dismiss = useAccessTokenRevealStore((s) => s.dismiss);
    const dialogRef = useRef<HTMLDialogElement>(null);
    const [copying, setCopying] = useState(false);

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;
        if (current) {
            setCopying(false);
            if (!dialog.open) dialog.showModal();
            return;
        }
        if (dialog.open) dialog.close();
    }, [current]);

    const handleClose = () => {
        dismiss();
        dialogRef.current?.close();
    };

    const handleCopy = async () => {
        if (!current || copying) return;
        setCopying(true);
        try {
            await navigator.clipboard.writeText(current.token);
            toast.success("Token Copiado");
            window.setTimeout(() => {
                handleClose();
            }, CLOSE_AFTER_COPY_MS);
        } catch {
            setCopying(false);
            toast.error("Não foi possível copiar o token.");
        }
    };

    const title = current?.context === "create" ? "Usuário cadastrado" : "Novo token gerado";

    return (
        <dialog
            ref={dialogRef}
            className="system-alert-modal"
            aria-labelledby={current ? "access-token-reveal-title" : undefined}
            onCancel={(e) => {
                e.preventDefault();
                if (!copying) handleClose();
            }}
            onClose={() => {
                if (useAccessTokenRevealStore.getState().current && !copying) handleClose();
            }}
            onClick={(e) => {
                if (e.target === dialogRef.current && !copying) handleClose();
            }}
        >
            {current ? (
                <div className="gommo-modal-panel">
                    <div className="gommo-alert-banner relative gommo-alert-banner--info">
                        <span className="gommo-alert-icon gommo-alert-icon--info">
                            <KeyRound className="size-5" strokeWidth={2} />
                        </span>
                        <div className="min-w-0 flex-1 pe-8">
                            <h3 id="access-token-reveal-title" className="font-semibold text-base-content">
                                {title}
                            </h3>
                            <p className="mt-1 text-sm text-base-content/75">
                                Copie o token e compartilhe com o usuário. Ele não será exibido novamente. Se
                                perder, use Gerar novo token.
                            </p>
                        </div>
                        <button
                            type="button"
                            className="gommo-btn gommo-btn--ghost gommo-btn--icon-only gommo-btn--sm absolute top-3 right-3"
                            aria-label="Fechar"
                            disabled={copying}
                            onClick={() => handleClose()}
                        >
                            <X className="size-4" />
                        </button>
                    </div>
                    <div className="px-5 py-4">
                        <label className="gommo-field__label mb-1.5 block">Token de acesso</label>
                        <code className="block break-all rounded-lg border border-base-300 bg-base-200/60 px-3 py-2.5 font-mono text-lg tracking-widest text-base-content">
                            {current.token}
                        </code>
                    </div>
                    <div className="gommo-modal-footer">
                        <Button variant="ghost" size="sm" disabled={copying} onClick={() => handleClose()}>
                            Fechar
                        </Button>
                        <Button
                            variant="primary"
                            size="sm"
                            leftIcon={<Copy className="size-4" />}
                            loading={copying}
                            onClick={() => void handleCopy()}
                        >
                            Copiar token
                        </Button>
                    </div>
                </div>
            ) : null}
        </dialog>
    );
}
