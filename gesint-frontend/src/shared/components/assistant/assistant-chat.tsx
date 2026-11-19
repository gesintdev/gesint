"use client";

import {
    createContext,
    type ReactNode,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import {
    assistantService,
    type AssistantDeepLink,
    type AssistantLlmUsage,
} from "@/shared/components/assistant/assistant.service";
import {ExceptionCapture} from "@/shared/exceptions";

export type ChatMessage = {
    id: string;
    role: "assistant" | "user";
    content: string;
    links?: AssistantDeepLink[];
};

export type Conversation = {
    id: string;
    title: string;
    updatedAt: number;
    messages: ChatMessage[];
};

const STORAGE_KEY = "gesint-ai-assistant-conversations";

const WELCOME: ChatMessage = {
    id: "welcome",
    role: "assistant",
    content:
        "Olá! Sou o assistente do Gesint. Posso ajudar com dúvidas do sistema e, em breve, com análise de currículos. Como posso ajudar?",
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

export function formatConversationDate(value: number): string {
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

export function buildUsageFooter(usage: AssistantLlmUsage | null): string | null {
    if (!usage) return null;
    const last = usage.lastTotalTokens ?? 0;
    const session = usage.sessionTotalTokens ?? 0;
    const requests = usage.sessionRequests ?? 0;
    const parts: string[] = [`última ${formatTokenCount(last)} tok`];
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

export function isNewSession(conversation: Conversation | null): boolean {
    if (!conversation) return true;
    return !conversation.messages.some((message) => message.role === "user");
}

function findEmptyConversation(conversations: Conversation[]): Conversation | null {
    let empty: Conversation | null = null;
    for (const conversation of conversations) {
        if (!isNewSession(conversation)) continue;
        if (!empty || conversation.updatedAt > empty.updatedAt) {
            empty = conversation;
        }
    }
    return empty;
}

type AssistantChatContextValue = {
    hydrated: boolean;
    conversations: Conversation[];
    activeId: string | null;
    activeConversation: Conversation | null;
    messages: ChatMessage[];
    draft: string;
    setDraft: (value: string) => void;
    sending: boolean;
    usage: AssistantLlmUsage | null;
    selectionMode: boolean;
    selectedIds: Set<string>;
    selectedCount: number;
    allSelectableSelected: boolean;
    historyQuery: string;
    setHistoryQuery: (value: string) => void;
    filteredConversations: Conversation[];
    newSession: boolean;
    startNewConversation: () => void;
    openConversation: (id: string) => void;
    deleteConversation: (id: string) => void;
    toggleSelectionMode: () => void;
    toggleMessageSelected: (messageId: string) => void;
    toggleSelectAllMessages: () => void;
    deleteSelectedMessages: () => void;
    clearSelection: () => void;
    sendMessage: (override?: string) => Promise<void>;
};

const AssistantChatContext = createContext<AssistantChatContextValue | null>(null);

export function AssistantChatProvider({children}: {children: ReactNode}) {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [historyQuery, setHistoryQuery] = useState("");
    const [draft, setDraft] = useState("");
    const [sending, setSending] = useState(false);
    const [hydrated, setHydrated] = useState(false);
    const [usage, setUsage] = useState<AssistantLlmUsage | null>(null);
    const [selectionMode, setSelectionMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
    const conversationsRef = useRef(conversations);
    const activeIdRef = useRef(activeId);
    conversationsRef.current = conversations;
    activeIdRef.current = activeId;

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
    const selectedCount = selectedIds.size;
    const allSelectableSelected =
        messages.length > 0 && messages.every((message) => selectedIds.has(message.id));
    const newSession = isNewSession(activeConversation);

    const filteredConversations = useMemo(() => {
        const query = historyQuery.trim().toLowerCase();
        if (!query) return conversations;
        return conversations.filter((conversation) => {
            if (conversation.title.toLowerCase().includes(query)) return true;
            return conversation.messages.some((message) => message.content.toLowerCase().includes(query));
        });
    }, [conversations, historyQuery]);

    const clearSelection = useCallback(() => {
        setSelectedIds(new Set());
        setSelectionMode(false);
    }, []);

    const startNewConversation = useCallback(() => {
        const empty = findEmptyConversation(conversationsRef.current);
        if (empty) {
            if (empty.id !== activeIdRef.current) {
                setActiveId(empty.id);
                activeIdRef.current = empty.id;
                setDraft("");
            }
            setHistoryQuery("");
            clearSelection();
            return;
        }
        const next = createConversation();
        conversationsRef.current = [next, ...conversationsRef.current];
        setConversations((prev) => (findEmptyConversation(prev) ? prev : [next, ...prev]));
        setActiveId(next.id);
        activeIdRef.current = next.id;
        setDraft("");
        setHistoryQuery("");
        clearSelection();
    }, [clearSelection]);

    const openConversation = useCallback(
        (id: string) => {
            setActiveId(id);
            setDraft("");
            setHistoryQuery("");
            clearSelection();
        },
        [clearSelection],
    );

    const deleteConversation = useCallback(
        (id: string) => {
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
            clearSelection();
        },
        [activeId, clearSelection],
    );

    const toggleSelectionMode = useCallback(() => {
        setSelectionMode((value) => {
            if (value) {
                setSelectedIds(new Set());
                return false;
            }
            return true;
        });
    }, []);

    const toggleMessageSelected = useCallback((messageId: string) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(messageId)) next.delete(messageId);
            else next.add(messageId);
            return next;
        });
    }, []);

    const toggleSelectAllMessages = useCallback(() => {
        setSelectedIds((prev) => {
            if (messages.length === 0) return prev;
            const allSelected = messages.every((message) => prev.has(message.id));
            if (allSelected) return new Set();
            return new Set(messages.map((message) => message.id));
        });
    }, [messages]);

    const deleteSelectedMessages = useCallback(() => {
        if (!activeId || selectedIds.size === 0) return;
        const ids = selectedIds;
        setConversations((prev) =>
            prev.map((conversation) => {
                if (conversation.id !== activeId) return conversation;
                const remaining = conversation.messages.filter((message) => !ids.has(message.id));
                const nextMessages =
                    remaining.length > 0 ? remaining : [{...WELCOME, id: `welcome-${Date.now()}`}];
                return {
                    ...conversation,
                    title: titleFromMessages(nextMessages),
                    updatedAt: Date.now(),
                    messages: nextMessages,
                };
            }),
        );
        clearSelection();
    }, [activeId, clearSelection, selectedIds]);

    const sendMessage = useCallback(
        async (override?: string) => {
            const text = (override ?? draft).trim();
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
                const links = (response.links ?? []).filter(
                    (link): link is AssistantDeepLink =>
                        Boolean(link?.href?.trim()) && Boolean(link?.label?.trim()),
                );
                const assistantMessage: ChatMessage = {
                    id: `assistant-${Date.now()}`,
                    role: "assistant",
                    content: response.reply?.trim() || "Não consegui gerar uma resposta agora.",
                    links: links.length > 0 ? links : undefined,
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
                const fallback = ExceptionCapture.displayMessage(
                    error,
                    "Não foi possível falar com o assistente agora.",
                );
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
        },
        [activeConversation?.messages, activeId, draft, sending],
    );

    const value = useMemo(
        (): AssistantChatContextValue => ({
            hydrated,
            conversations,
            activeId,
            activeConversation,
            messages,
            draft,
            setDraft,
            sending,
            usage,
            selectionMode,
            selectedIds,
            selectedCount,
            allSelectableSelected,
            historyQuery,
            setHistoryQuery,
            filteredConversations,
            newSession,
            startNewConversation,
            openConversation,
            deleteConversation,
            toggleSelectionMode,
            toggleMessageSelected,
            toggleSelectAllMessages,
            deleteSelectedMessages,
            clearSelection,
            sendMessage,
        }),
        [
            activeConversation,
            activeId,
            allSelectableSelected,
            clearSelection,
            conversations,
            deleteConversation,
            deleteSelectedMessages,
            draft,
            filteredConversations,
            historyQuery,
            hydrated,
            messages,
            newSession,
            openConversation,
            selectedCount,
            selectedIds,
            selectionMode,
            sendMessage,
            sending,
            startNewConversation,
            toggleMessageSelected,
            toggleSelectAllMessages,
            toggleSelectionMode,
            usage,
        ],
    );

    return <AssistantChatContext.Provider value={value}>{children}</AssistantChatContext.Provider>;
}

export function useAssistantChat(): AssistantChatContextValue {
    const value = useContext(AssistantChatContext);
    if (!value) {
        throw new Error("useAssistantChat fora do AssistantChatProvider");
    }
    return value;
}
