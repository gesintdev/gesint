"use client";

import {FileText, Map, Stethoscope} from "lucide-react";
import {type Ref} from "react";
import {useSession} from "next-auth/react";

import {AssistantComposer} from "@/shared/components/assistant/AssistantComposer";
import {useAssistantChat} from "@/shared/components/assistant/assistant-chat";

type AssistantEmptyStateProps = {
    inputRef?: Ref<HTMLTextAreaElement>;
    spacious?: boolean;
};

const SUGGESTIONS = [
    {
        id: "route",
        label: "Onde fica uma tela",
        icon: Map,
        fill: "Onde eu acesso ",
    },
    {
        id: "admission",
        label: "Resumir uma admissão",
        icon: FileText,
        fill: "Resume a admissão de ",
    },
    {
        id: "aso",
        label: "Por que o ASO está em atraso",
        icon: Stethoscope,
        send: "Por que a esteira mostra ASO em atraso?",
    },
] as const;

function firstName(value?: string | null): string | null {
    const token = value?.trim().split(/\s+/)[0];
    return token || null;
}

export function AssistantEmptyState({inputRef, spacious = false}: AssistantEmptyStateProps) {
    const {data: session} = useSession();
    const {setDraft, sendMessage, sending} = useAssistantChat();
    const name = firstName(session?.user?.name);

    return (
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-4 py-8">
            <div className={spacious ? "w-full max-w-xl" : "w-full max-w-md"}>
                <h2
                    className={
                        spacious
                            ? "mb-6 text-center text-[22px] font-semibold tracking-tight text-base-content"
                            : "mb-5 text-center text-[18px] font-semibold tracking-tight text-base-content"
                    }
                >
                    {name ? `Como posso ajudar, ${name}?` : "Como posso ajudar?"}
                </h2>
                <AssistantComposer inputRef={inputRef}/>
                <ul className="mt-3 grid gap-1">
                    {SUGGESTIONS.map((item) => {
                        const Icon = item.icon;
                        return (
                            <li key={item.id}>
                                <button
                                    type="button"
                                    disabled={sending}
                                    className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] text-base-content/75 transition-colors hover:bg-base-content/4 disabled:opacity-50"
                                    onClick={() => {
                                        if ("send" in item) {
                                            void sendMessage(item.send);
                                            return;
                                        }
                                        setDraft(item.fill);
                                        const el =
                                            typeof inputRef === "object" && inputRef ? inputRef.current : null;
                                        el?.focus();
                                    }}
                                >
                                    <Icon className="size-4 shrink-0 text-base-content/45" strokeWidth={2}/>
                                    {item.label}
                                </button>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </div>
    );
}
