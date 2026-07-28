"use client";

import clsx from "clsx";
import {AnimatePresence, motion} from "framer-motion";
import {History, MessageSquarePlus, Search, SendHorizontal, Sparkles, Trash2, X} from "lucide-react";
import {useCallback, useEffect, useMemo, useRef, useState} from "react";

import {assistantService, type AssistantLlmUsage} from "@/shared/components/assistant/assistant.service";
import {MarkdownContent} from "@/shared/components/ui/MarkdownContent";
import {ExceptionCapture} from "@/shared/exceptions";

type ChatMessage = {
    id: string;
    role: "assistant" | "user";
    content: string;
};

type Conversation = {
    id: string;
    title: string;
    updatedAt: number;
    messages: ChatMessage[];
};

const STORAGE_KEY = "gommo-ai-assistant-conversations";

const WELCOME: ChatMessage = {
    id: "welcome",
    role: "assistant",
    content:
        "Olá! Sou o assistente do Gommo. Posso ajudar com dúvidas do sistema e, em breve, com análise de currículos. Como posso ajudar?",
};

function createConversation(): Conversation {
    const now = Date.now();
    return {
        id: `conv-${now}`,
        title: "Nova conversa",
        updatedAt: now,
        messages: [{...WELCOME, id: `welcome-${now}`}],
    };
}

function titleFromMessages(messages: ChatMessage[]): string {
    const firstUser = messages.find((message) => message.role === "user");
    if (!firstUser) return "Nova conversa";
    const text = firstUser.content.trim().replace(/\s+/g, " ");
    return text.length > 42 ? `${text.slice(0, 42)}...` : text;
}

function readStoredConversations(): Conversation[] {
    if (typeof window === "undefined") return [];
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw) as Conversation[];
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

function writeStoredConversations(conversations: Conversation[]) {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
}

function formatConversationDate(value: number): string {
    return new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
    }).format(new Date(value));
}

function formatTokenCount(value?: number | null): string {
    if (value == null || Number.isNaN(value)) return "0";
    return new Intl.NumberFormat("pt-BR", {
        notation: value >= 10_000 ? "compact" : "standard",
        maximumFractionDigits: value >= 10_000 ? 1 : 0,
    }).format(value);
}

function buildUsageFooter(usage: AssistantLlmUsage | null): string | null {
    if (!usage) return null;
    const last = usage.lastTotalTokens ?? 0;
    const session = usage.sessionTotalTokens ?? 0;
    const requests = usage.sessionRequests ?? 0;
    const parts: string[] = [
        `última ${formatTokenCount(last)} tok`,
    ];
    if (usage.dailyTokenLimit && usage.dailyTokenLimit > 0) {
        const pct = Math.min(100, Math.round((session / usage.dailyTokenLimit) * 100));
        parts.push(`sessão ${formatTokenCount(session)}/${formatTokenCount(usage.dailyTokenLimit)} (${pct}%)`);
    } else {
        parts.push(`sessão ${formatTokenCount(session)} tok`);
    }
    parts.push(`${formatTokenCount(requests)} req`);
    if (usage.modelInputTokenLimit && usage.modelInputTokenLimit > 0) {
        parts.push(`ctx ${formatTokenCount(usage.modelInputTokenLimit)}`);
    }
    return `Dev · ${parts.join(" · ")}`;
}

type AiAssistantPanelProps = {
    open: boolean;
    onClose: () => void;
};

export function AiAssistantPanel({open, onClose}: AiAssistantPanelProps) {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [showHistory, setShowHistory] = useState(false);
    const [historyQuery, setHistoryQuery] = useState("");
    const [draft, setDraft] = useState("");
    const [sending, setSending] = useState(false);
    const [hydrated, setHydrated] = useState(false);
    const [usage, setUsage] = useState<AssistantLlmUsage | null>(null);
    const listRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const historySearchRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const stored = readStoredConversations();
        if (stored.length > 0) {
            const sorted = [...stored].sort((a, b) => b.updatedAt - a.updatedAt);
            setConversations(sorted);
            setActiveId(sorted[0]?.id ?? null);
        } else {
            const first = createConversation();
            setConversations([first]);
            setActiveId(first.id);
        }
        setHydrated(true);
    }, []);

    useEffect(() => {
        if (!hydrated) return;
        writeStoredConversations(conversations);
    }, [conversations, hydrated]);

    const activeConversation = useMemo(
        () => conversations.find((conversation) => conversation.id === activeId) ?? null,
        [activeId, conversations],
    );
    const messages = activeConversation?.messages ?? [];

    const filteredConversations = useMemo(() => {
        const query = historyQuery.trim().toLowerCase();
        if (!query) return conversations;
        return conversations.filter((conversation) => {
            if (conversation.title.toLowerCase().includes(query)) return true;
            return conversation.messages.some((message) =>
                message.content.toLowerCase().includes(query),
            );
        });
    }, [conversations, historyQuery]);

    const startNewConversation = useCallback(() => {
        const next = createConversation();
        setConversations((prev) => [next, ...prev]);
        setActiveId(next.id);
        setDraft("");
        setShowHistory(false);
        setHistoryQuery("");
    }, []);

    const openConversation = useCallback((id: string) => {
        setActiveId(id);
        setDraft("");
        setShowHistory(false);
        setHistoryQuery("");
    }, []);

    const deleteConversation = useCallback((id: string) => {
        setConversations((prev) => {
            const next = prev.filter((conversation) => conversation.id !== id);
            if (next.length === 0) {
                const fresh = createConversation();
                setActiveId(fresh.id);
                return [fresh];
            }
            if (id === activeId) {
                setActiveId(next[0]?.id ?? null);
            }
            return next;
        });
    }, [activeId]);

    useEffect(() => {
        if (!open) return;
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") onClose();
        };
        document.addEventListener("keydown", onKeyDown);
        return () => document.removeEventListener("keydown", onKeyDown);
    }, [open, onClose]);

    useEffect(() => {
        if (!open || showHistory) return;
        const timer = window.setTimeout(() => inputRef.current?.focus(), 180);
        return () => window.clearTimeout(timer);
    }, [open, showHistory, activeId]);

    useEffect(() => {
        if (!open || !showHistory) return;
        const timer = window.setTimeout(() => historySearchRef.current?.focus(), 180);
        return () => window.clearTimeout(timer);
    }, [open, showHistory]);

    useEffect(() => {
        if (!open || showHistory) return;
        listRef.current?.scrollTo({top: listRef.current.scrollHeight, behavior: "smooth"});
    }, [messages, open, showHistory, activeId]);

    useEffect(() => {
        const el = inputRef.current;
        if (!el) return;
        el.style.height = "auto";
        const maxHeight = 160;
        el.style.height = `${Math.min(el.scrollHeight, maxHeight)}px`;
        el.style.overflowY = el.scrollHeight > maxHeight ? "auto" : "hidden";
    }, [draft, open, showHistory]);

    const sendMessage = async () => {
        const text = draft.trim();
        if (!text || !activeId || sending) return;

        const userMessage: ChatMessage = {
            id: `user-${Date.now()}`,
            role: "user",
            content: text,
        };
        const conversationId = activeId;
        const historyForApi = [
            ...(activeConversation?.messages ?? [])
                .filter((message) => message.role === "user" || message.role === "assistant")
                .map((message) => ({role: message.role, content: message.content})),
            {role: "user" as const, content: text},
        ];

        setDraft("");
        setSending(true);
        setConversations((prev) =>
            prev.map((conversation) => {
                if (conversation.id !== conversationId) return conversation;
                const nextMessages = [...conversation.messages, userMessage];
                return {
                    ...conversation,
                    title:
                        conversation.title === "Nova conversa"
                            ? titleFromMessages(nextMessages)
                            : conversation.title,
                    updatedAt: Date.now(),
                    messages: nextMessages,
                };
            }),
        );

        try {
            const response = await assistantService.chat(historyForApi);
            const assistantMessage: ChatMessage = {
                id: `assistant-${Date.now()}`,
                role: "assistant",
                content: response.reply?.trim() || "Não consegui gerar uma resposta agora.",
            };
            if (response.usage) {
                setUsage(response.usage);
            }
            setConversations((prev) =>
                prev.map((conversation) => {
                    if (conversation.id !== conversationId) return conversation;
                    return {
                        ...conversation,
                        updatedAt: Date.now(),
                        messages: [...conversation.messages, assistantMessage],
                    };
                }),
            );
        } catch (error) {
            const fallback =
                ExceptionCapture.displayMessage(error, "Não foi possível falar com o assistente agora.");
            const assistantMessage: ChatMessage = {
                id: `assistant-error-${Date.now()}`,
                role: "assistant",
                content: fallback,
            };
            setConversations((prev) =>
                prev.map((conversation) => {
                    if (conversation.id !== conversationId) return conversation;
                    return {
                        ...conversation,
                        updatedAt: Date.now(),
                        messages: [...conversation.messages, assistantMessage],
                    };
                }),
            );
        } finally {
            setSending(false);
        }
    };

    return (
        <AnimatePresence>
            {open ? (
                <>
                    <motion.button
                        type="button"
                        aria-label="Fechar assistente"
                        initial={{opacity: 0}}
                        animate={{opacity: 1}}
                        exit={{opacity: 0}}
                        transition={{duration: 0.18}}
                        className="fixed inset-x-0 bottom-0 z-40 bg-base-content/15 backdrop-blur-[2px] lg:bg-transparent lg:backdrop-blur-none lg:pointer-events-none"
                        style={{top: "var(--header-height)"}}
                        onClick={onClose}
                    />
                    <motion.aside
                        id="ai-assistant-panel"
                        role="dialog"
                        aria-modal="true"
                        aria-label="Assistente IA"
                        initial={{x: "100%"}}
                        animate={{x: 0}}
                        exit={{x: "100%"}}
                        transition={{duration: 0.28, ease: [0.22, 1, 0.36, 1]}}
                        className="fixed right-0 bottom-0 z-50 flex w-full max-w-md flex-col border-l bg-base-100 shadow-xl"
                        style={{
                            top: "var(--header-height)",
                            borderColor: "var(--sidebar-border)",
                        }}
                    >
                        <header
                            className="flex h-12 shrink-0 items-center gap-2 border-b px-3 sm:px-4"
                            style={{borderColor: "var(--sidebar-border)"}}
                        >
                            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                                <Sparkles className="size-4" strokeWidth={2}/>
                            </span>
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-[13px] font-semibold text-base-content">Assistente IA</p>
                                <p className="truncate text-[11px] text-base-content/45">
                                    {showHistory
                                        ? "Histórico de conversas"
                                        : activeConversation?.title ?? "Chat de atendimento"}
                                </p>
                            </div>
                            <button
                                type="button"
                                aria-label="Nova conversa"
                                title="Nova conversa"
                                onClick={startNewConversation}
                                className="gommo-btn gommo-btn--ghost gommo-btn--icon-only text-base-content/50"
                            >
                                <MessageSquarePlus className="size-4" strokeWidth={2}/>
                            </button>
                            <button
                                type="button"
                                aria-label={showHistory ? "Voltar ao chat" : "Histórico"}
                                aria-pressed={showHistory}
                                title={showHistory ? "Voltar ao chat" : "Histórico"}
                                onClick={() => setShowHistory((value) => !value)}
                                className={clsx(
                                    "gommo-btn gommo-btn--ghost gommo-btn--icon-only",
                                    showHistory ? "bg-primary/10 text-primary" : "text-base-content/50",
                                )}
                            >
                                <History className="size-4" strokeWidth={2}/>
                            </button>
                            <button
                                type="button"
                                aria-label="Fechar"
                                onClick={onClose}
                                className="gommo-btn gommo-btn--ghost gommo-btn--icon-only text-base-content/50"
                            >
                                <X className="size-4" strokeWidth={2}/>
                            </button>
                        </header>

                        {showHistory ? (
                            <div className="flex min-h-0 flex-1 flex-col">
                                <div
                                    className="shrink-0 border-b px-3 py-2.5 sm:px-4"
                                    style={{borderColor: "var(--sidebar-border)"}}
                                >
                                    <label className="flex h-9 items-center gap-2 rounded-xl border border-base-content/10 bg-base-200/60 px-2.5">
                                        <Search
                                            className="size-3.5 shrink-0 text-base-content/40"
                                            strokeWidth={2}
                                            aria-hidden
                                        />
                                        <input
                                            ref={historySearchRef}
                                            type="search"
                                            value={historyQuery}
                                            placeholder="Pesquisar conversas..."
                                            aria-label="Pesquisar conversas"
                                            className="h-full min-w-0 flex-1 bg-transparent text-[13px] leading-none text-base-content outline-none placeholder:text-base-content/40 [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden"
                                            onChange={(event) => setHistoryQuery(event.target.value)}
                                        />
                                        <button
                                            type="button"
                                            aria-label="Limpar pesquisa"
                                            title="Limpar pesquisa"
                                            disabled={!historyQuery}
                                            onClick={() => setHistoryQuery("")}
                                            className={clsx(
                                                "inline-flex size-6 shrink-0 items-center justify-center rounded-md text-base-content/40 transition",
                                                historyQuery
                                                    ? "hover:bg-base-content/8 hover:text-base-content"
                                                    : "invisible pointer-events-none",
                                            )}
                                        >
                                            <X className="size-3.5" strokeWidth={2}/>
                                        </button>
                                    </label>
                                </div>
                                <div className="min-h-0 flex-1 overflow-y-auto px-2 py-2 sm:px-3">
                                    <div className="mb-2 flex items-center justify-between px-1">
                                        <p className="text-[11px] font-semibold uppercase tracking-wide text-base-content/40">
                                            Conversas
                                            {historyQuery.trim()
                                                ? ` · ${filteredConversations.length}`
                                                : ""}
                                        </p>
                                        <button
                                            type="button"
                                            onClick={startNewConversation}
                                            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[12px] font-medium text-primary hover:bg-primary/8"
                                        >
                                            <MessageSquarePlus className="size-3.5" strokeWidth={2}/>
                                            Nova
                                        </button>
                                    </div>
                                    {filteredConversations.length === 0 ? (
                                        <p className="px-2 py-6 text-center text-[13px] text-base-content/45">
                                            {historyQuery.trim()
                                                ? "Nenhuma conversa encontrada."
                                                : "Nenhuma conversa ainda."}
                                        </p>
                                    ) : (
                                        <ul className="grid gap-1">
                                            {filteredConversations.map((conversation) => {
                                                const active = conversation.id === activeId;
                                                return (
                                                    <li key={conversation.id}>
                                                        <div
                                                            className={clsx(
                                                                "group flex items-start gap-1 rounded-xl px-2 py-2 transition-colors",
                                                                active ? "bg-primary/10" : "hover:bg-base-200/80",
                                                            )}
                                                        >
                                                            <button
                                                                type="button"
                                                                onClick={() => openConversation(conversation.id)}
                                                                className="min-w-0 flex-1 text-left"
                                                            >
                                                                <p className="truncate text-[13px] font-medium text-base-content">
                                                                    {conversation.title}
                                                                </p>
                                                                <p className="mt-0.5 text-[11px] text-base-content/45">
                                                                    {formatConversationDate(conversation.updatedAt)}
                                                                    {" · "}
                                                                    {Math.max(0, conversation.messages.length - 1)}{" "}
                                                                    mensagens
                                                                </p>
                                                            </button>
                                                            <button
                                                                type="button"
                                                                aria-label="Excluir conversa"
                                                                title="Excluir conversa"
                                                                onClick={() => deleteConversation(conversation.id)}
                                                                className="gommo-btn gommo-btn--ghost gommo-btn--icon-only opacity-0 text-base-content/40 transition-opacity group-hover:opacity-100"
                                                            >
                                                                <Trash2 className="size-3.5" strokeWidth={2}/>
                                                            </button>
                                                        </div>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <>
                                <div ref={listRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto px-3 py-4 sm:px-4">
                                    {messages.map((message) => (
                                        <div
                                            key={message.id}
                                            className={
                                                message.role === "user"
                                                    ? "ml-8 flex justify-end"
                                                    : "mr-8 flex justify-start"
                                            }
                                        >
                                            <div
                                                className={
                                                    message.role === "user"
                                                        ? "rounded-2xl rounded-br-md bg-primary px-3 py-2 text-[13px] leading-5 text-primary-content whitespace-pre-wrap"
                                                        : "rounded-2xl rounded-bl-md bg-base-200 px-3 py-2 text-base-content"
                                                }
                                            >
                                                {message.role === "assistant" ? (
                                                    <MarkdownContent
                                                        value={message.content}
                                                        className="text-[13px] leading-5 text-base-content [&_p]:mb-2 [&_ul]:mb-2 [&_ol]:mb-2"
                                                    />
                                                ) : (
                                                    message.content
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    {sending ? (
                                        <div className="mr-8 flex justify-start">
                                            <div className="rounded-2xl rounded-bl-md bg-base-200 px-3 py-2 text-[13px] leading-5 text-base-content/55">
                                                Pensando…
                                            </div>
                                        </div>
                                    ) : null}
                                </div>

                                <footer
                                    className="shrink-0 border-t p-3 sm:p-4"
                                    style={{borderColor: "var(--sidebar-border)"}}
                                >
                                    <div className="flex items-end gap-2 rounded-2xl border border-base-content/10 bg-base-200/60 p-2">
                                        <textarea
                                            ref={inputRef}
                                            value={draft}
                                            rows={1}
                                            placeholder="Escreva sua mensagem..."
                                            className="max-h-40 min-h-9 flex-1 resize-none overflow-y-hidden bg-transparent px-2 py-1.5 text-[13px] leading-5 text-base-content outline-none placeholder:text-base-content/40 disabled:opacity-60"
                                            disabled={sending}
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
                                            disabled={!draft.trim() || sending}
                                            onClick={() => void sendMessage()}
                                            className="gommo-btn gommo-btn--primary gommo-btn--icon-only shrink-0 disabled:opacity-40"
                                        >
                                            <SendHorizontal className="size-4" strokeWidth={2}/>
                                        </button>
                                    </div>
                                    <p className="mt-2 text-center text-[10px] text-base-content/35">
                                        Assistente conectado ao Gemini. A base de conhecimento será enriquecida com o
                                        tempo.
                                    </p>
                                    {process.env.NODE_ENV === "development" ? (
                                        <p
                                            className="mt-1 text-center text-[10px] tabular-nums text-base-content/40"
                                            title="Uso de tokens desta sessão do backend. A Google não expõe cota restante só com API key."
                                        >
                                            {buildUsageFooter(usage)
                                                ?? "Dev · envie uma mensagem para ver o uso de tokens"}
                                        </p>
                                    ) : null}
                                </footer>
                            </>
                        )}
                    </motion.aside>
                </>
            ) : null}
        </AnimatePresence>
    );
}
