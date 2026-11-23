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
    type AssistantDeepLink,
    type AssistantLlmUsage,
    type AssistantMenuFocus,
    assistantService,
} from "@/shared/components/assistant/assistant.service";
import {ASSISTANT_MENU_OPENING_QUESTION} from "@/shared/components/assistant/assistant-menu-prompt";
import {ExceptionCapture} from "@/shared/exceptions";

export type ChatMessage = {
    id: string;
    role: "assistant" | "user";
    content: string;
    links?: AssistantDeepLink[];
    /** Pergunta de abertura do menu: vai para o assistente e não aparece no balão. */
    hidden?: boolean;
};

export type ConversationMenuFocus = {
    routeId: string;
    label: string;
    userName?: string;
};

export type Conversation = {
    id: string;
    title: string;
    updatedAt: number;
    messages: ChatMessage[];
    /** Definido quando a conversa nasce do botão direito de um menu. */
    menuFocus?: ConversationMenuFocus;
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

function isGenericWelcome(conversation: Conversation): boolean {
    return (
        conversation.messages.length === 1 &&
        conversation.messages[0]?.role === "assistant" &&
        conversation.messages[0]?.content === WELCOME.content
    );
}

export function isNewSession(conversation: Conversation | null): boolean {
    if (!conversation) return true;
    if (conversation.menuFocus) return false;
    if (conversation.messages.some((message) => message.role === "user")) return false;
    return conversation.messages.length === 0 || isGenericWelcome(conversation);
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
    /** Texto curto do que o assistente está fazendo agora, por exemplo "Consultando férias...". */
    activity: string | null;
    usage: AssistantLlmUsage | null;
    selectionMode: boolean;
    selectedIds: Set<string>;
    selectedCount: number;
    allSelectableSelected: boolean;
    historyQuery: string;
    setHistoryQuery: (value: string) => void;
    filteredConversations: Conversation[];
    newSession: boolean;
    /** Sobe a cada início ou abertura de conversa, para a janela do chat receber o foco. */
    chatFocusToken: number;
    startNewConversation: () => void;
    startMenuConversation: (focus: ConversationMenuFocus) => void;
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
    const [chatFocusToken, setChatFocusToken] = useState(0);
    const [activity, setActivity] = useState<string | null>(null);
    const [hydrated, setHydrated] = useState(false);
    const [usage, setUsage] = useState<AssistantLlmUsage | null>(null);
    const [selectionMode, setSelectionMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
    const conversationsRef = useRef(conversations);
    const activeIdRef = useRef(activeId);
    const sendingRef = useRef(false);

    useEffect(() => {
        conversationsRef.current = conversations;
        activeIdRef.current = activeId;
    }, [activeId, conversations]);

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
    const messages = useMemo(
        () => (activeConversation?.messages ?? []).filter((message) => !message.hidden),
        [activeConversation],
    );
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

    const focusConversationWindow = useCallback(() => {
        setChatFocusToken((value) => value + 1);
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
            focusConversationWindow();
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
        focusConversationWindow();
    }, [clearSelection, focusConversationWindow]);

    const openConversation = useCallback(
        (id: string) => {
            setActiveId(id);
            setDraft("");
            setHistoryQuery("");
            clearSelection();
            focusConversationWindow();
        },
        [clearSelection, focusConversationWindow],
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

    const appendConversationMessage = useCallback((conversationId: string, message: ChatMessage, rename: boolean) => {
        setConversations((prev) => {
            const next = prev.map((conversation) => {
                if (conversation.id !== conversationId) return conversation;
                const nextMessages = [...conversation.messages, message];
                return {
                    ...conversation,
                    title:
                        rename && conversation.title === "Nova conversa"
                            ? titleFromMessages(nextMessages)
                            : conversation.title,
                    updatedAt: Date.now(),
                    messages: nextMessages,
                };
            });
            conversationsRef.current = next;
            return next;
        });
    }, []);

    const deliverMessage = useCallback(
        async (
            conversationId: string,
            priorMessages: ChatMessage[],
            text: string,
            options?: {hideUser?: boolean; opening?: boolean},
        ) => {
            if (!text || sendingRef.current) return;

            const userMessage: ChatMessage = {
                id: `user-${Date.now()}`,
                role: "user",
                content: text,
                hidden: options?.hideUser || undefined,
            };
            const historyForApi = [
                ...priorMessages
                    .filter((message) => message.role === "user" || message.role === "assistant")
                    .map((message) => ({role: message.role, content: message.content})),
                {role: "user" as const, content: text},
            ];
            const focus = conversationsRef.current.find((conversation) => conversation.id === conversationId)
                ?.menuFocus;
            const menuFocus: AssistantMenuFocus | undefined = focus
                ? {
                      routeId: focus.routeId,
                      label: focus.label,
                      userName: focus.userName,
                      opening: options?.opening === true,
                  }
                : undefined;

            sendingRef.current = true;
            setDraft("");
            setActivity("Pensando...");
            setSending(true);
            appendConversationMessage(conversationId, userMessage, !options?.hideUser);

            try {
                const response = await assistantService.chatStream(historyForApi, menuFocus, setActivity);
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
                appendConversationMessage(conversationId, assistantMessage, false);
            } catch (error) {
                const fallback = ExceptionCapture.displayMessage(
                    error,
                    "Não foi possível falar com o assistente agora.",
                );
                appendConversationMessage(conversationId, {
                    id: `assistant-error-${Date.now()}`,
                    role: "assistant",
                    content: fallback,
                }, false);
            } finally {
                sendingRef.current = false;
                setActivity(null);
                setSending(false);
            }
        },
        [appendConversationMessage],
    );

    const sendMessage = useCallback(
        async (override?: string) => {
            const text = (override ?? draft).trim();
            const conversationId = activeIdRef.current;
            if (!text || !conversationId || sendingRef.current) return;
            const prior =
                conversationsRef.current.find((conversation) => conversation.id === conversationId)?.messages ?? [];
            await deliverMessage(conversationId, prior, text);
        },
        [deliverMessage, draft],
    );

    const startMenuConversation = useCallback(
        (focus: ConversationMenuFocus) => {
            const routeId = focus.routeId.trim();
            const label = focus.label.trim();
            if (!routeId || !label) return;

            const now = Date.now();
            const menuFocus = {
                routeId,
                label,
                userName: focus.userName?.trim() || undefined,
            };
            const empty = findEmptyConversation(conversationsRef.current);
            const created: Conversation = empty
                ? {...empty, title: label, updatedAt: now, messages: [], menuFocus}
                : {id: `conv-${now}`, title: label, updatedAt: now, messages: [], menuFocus};
            const rest = conversationsRef.current.filter((conversation) => conversation.id !== created.id);
            const next = [created, ...rest];
            conversationsRef.current = next;
            setConversations(next);
            setActiveId(created.id);
            activeIdRef.current = created.id;
            setHistoryQuery("");
            setDraft("");
            clearSelection();
            focusConversationWindow();
            void deliverMessage(created.id, [], ASSISTANT_MENU_OPENING_QUESTION, {hideUser: true, opening: true});
        },
        [clearSelection, deliverMessage, focusConversationWindow],
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
            activity,
            usage,
            selectionMode,
            selectedIds,
            selectedCount,
            allSelectableSelected,
            historyQuery,
            setHistoryQuery,
            filteredConversations,
            newSession,
            chatFocusToken,
            startNewConversation,
            startMenuConversation,
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
            activity,
            allSelectableSelected,
            clearSelection,
            chatFocusToken,
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
            startMenuConversation,
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
