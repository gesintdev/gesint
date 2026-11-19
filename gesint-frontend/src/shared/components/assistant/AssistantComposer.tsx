"use client";

import {SendHorizontal} from "lucide-react";
import {type Ref, useEffect} from "react";

import {buildUsageFooter, useAssistantChat} from "@/shared/components/assistant/assistant-chat";

type AssistantComposerProps = {
    inputRef?: Ref<HTMLTextAreaElement>;
    autoFocus?: boolean;
};

export function AssistantComposer({inputRef, autoFocus = false}: AssistantComposerProps) {
    const {draft, setDraft, sending, selectionMode, usage, sendMessage} = useAssistantChat();

    useEffect(() => {
        const el = typeof inputRef === "object" && inputRef ? inputRef.current : null;
        if (!el) return;
        el.style.height = "auto";
        const maxHeight = 160;
        el.style.height = `${Math.min(el.scrollHeight, maxHeight)}px`;
        el.style.overflowY = el.scrollHeight > maxHeight ? "auto" : "hidden";
    }, [draft, inputRef]);

    return (
        <div>
            <div className="flex items-end gap-2 rounded-2xl border border-base-content/10 bg-base-200/60 p-2">
                <textarea
                    ref={inputRef}
                    value={draft}
                    rows={1}
                    autoFocus={autoFocus}
                    placeholder="Pergunte ao assistente"
                    className="max-h-40 min-h-9 flex-1 resize-none overflow-y-hidden bg-transparent px-2 py-1.5 text-[13px] leading-5 text-base-content outline-none placeholder:text-base-content/40 disabled:opacity-60"
                    disabled={sending || selectionMode}
                    onChange={(event) => setDraft(event.target.value)}
                    onKeyDown={(event) => {
                        if (event.key === "Enter" && !event.shiftKey) {
                            event.preventDefault();
                            void sendMessage();
                        }
                    }}
                />
                <button
                    type="button"
                    aria-label="Enviar"
                    disabled={!draft.trim() || sending || selectionMode}
                    onClick={() => void sendMessage()}
                    className="gesint-btn gesint-btn--primary gesint-btn--icon-only shrink-0 disabled:opacity-40"
                >
                    <SendHorizontal className="size-4" strokeWidth={2}/>
                </button>
            </div>
            <p className="mt-2 text-center text-[10px] text-base-content/35">
                Posso orientar fluxos e abrir telas. Ações complexas devem ser feitas no módulo.
            </p>
            {process.env.NODE_ENV === "development" ? (
                <p
                    className="mt-1 text-center text-[10px] tabular-nums text-base-content/40"
                    title="Uso de tokens desta sessão do backend. A Google não expõe cota restante só com API key."
                >
                    {buildUsageFooter(usage) ?? "Dev · envie uma mensagem para ver o uso de tokens"}
                </p>
            ) : null}
        </div>
    );
}
