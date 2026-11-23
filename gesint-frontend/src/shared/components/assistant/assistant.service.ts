import {AppException} from "@/shared/exceptions/app.exception";
import {apiFetch, apiFetchStream} from "@/shared/lib/api.client";

export type AssistantChatMessage = {
    role: "user" | "assistant";
    content: string;
};

export type AssistantLlmUsage = {
    lastPromptTokens?: number;
    lastCompletionTokens?: number;
    lastTotalTokens?: number;
    sessionPromptTokens?: number;
    sessionCompletionTokens?: number;
    sessionTotalTokens?: number;
    sessionRequests?: number;
    dailyTokenLimit?: number | null;
    modelInputTokenLimit?: number | null;
    modelOutputTokenLimit?: number | null;
};

export type AssistantDeepLink = {
    label: string;
    href: string;
};

export type AssistantChatResponse = {
    reply: string;
    provider?: string;
    model?: string;
    usage?: AssistantLlmUsage | null;
    links?: AssistantDeepLink[] | null;
};

/** Menu em que a conversa foi aberta. O backend responde sobre essa tela. */
export type AssistantMenuFocus = {
    routeId: string;
    label: string;
    userName?: string;
    opening?: boolean;
};

class AssistantService {
    private readonly basePath = "/api/v1/assistant";

    chat(messages: AssistantChatMessage[], menuFocus?: AssistantMenuFocus): Promise<AssistantChatResponse> {
        return apiFetch<AssistantChatResponse>(`${this.basePath}/chat`, {
            method: "POST",
            body: menuFocus ? { messages, menuFocus } : { messages },
        });
    }

    /** Mesma conversa, com avisos do tipo "Pensando..." enquanto a consulta roda. */
    async chatStream(
        messages: AssistantChatMessage[],
        menuFocus: AssistantMenuFocus | undefined,
        onStatus: (_text: string) => void,
    ): Promise<AssistantChatResponse> {
        const body = menuFocus ? {messages, menuFocus} : {messages};
        let response: Response;
        try {
            response = await apiFetchStream(`${this.basePath}/chat/stream`, body);
        } catch (error) {
            if (error instanceof AppException && error.status === 404) {
                return this.chat(messages, menuFocus);
            }
            if (error instanceof AppException) {
                throw error;
            }
            return this.chat(messages, menuFocus);
        }
        return readAssistantEvents(response, onStatus);
    }
}

type StreamEvent = {name: string; data: string};

async function readAssistantEvents(
    response: Response,
    onStatus: (_text: string) => void,
): Promise<AssistantChatResponse> {
    const reader = response.body?.getReader();
    if (!reader) {
        throw AppException.client("ASSISTANT_STREAM", "Não consegui acompanhar a consulta.");
    }
    const decoder = new TextDecoder();
    let buffer = "";
    let reply: AssistantChatResponse | null = null;
    let errorMessage: string | null = null;
    let lastStatus = "";
    let lastStatusAt = 0;
    while (true) {
        const chunk = await reader.read();
        if (chunk.done) break;
        buffer += decoder.decode(chunk.value, {stream: true});
        const parts = buffer.split(/\n\n/);
        buffer = parts.pop() ?? "";
        for (const part of parts) {
            const event = parseStreamEvent(part);
            if (!event.data) continue;
            if (event.name === "status") {
                const status = JSON.parse(event.data) as {text?: string};
                const text = status.text?.trim() ?? "";
                if (!text || text === lastStatus) continue;
                await holdStatus(lastStatusAt);
                lastStatus = text;
                lastStatusAt = Date.now();
                onStatus(text);
                await delay(0);
            } else if (event.name === "reply") {
                reply = JSON.parse(event.data) as AssistantChatResponse;
            } else if (event.name === "error") {
                const failure = JSON.parse(event.data) as {message?: string};
                errorMessage = failure.message?.trim() || "Não consegui concluir a consulta agora.";
            }
        }
    }
    await holdStatus(lastStatusAt);
    if (reply) return reply;
    throw AppException.client("ASSISTANT_STREAM", errorMessage || "Não consegui concluir a consulta agora.");
}

/** Tempo mínimo de cada aviso. A consulta em si pode terminar antes da tela pintar. */
const STATUS_HOLD_MS = 700;

function delay(ms: number): Promise<void> {
    return new Promise((resolve) => {
        window.setTimeout(resolve, ms);
    });
}

async function holdStatus(shownAt: number): Promise<void> {
    if (shownAt <= 0) return;
    const remaining = STATUS_HOLD_MS - (Date.now() - shownAt);
    if (remaining > 0) await delay(remaining);
}

function parseStreamEvent(block: string): StreamEvent {
    let name = "message";
    const data: string[] = [];
    for (const line of block.split(/\n/)) {
        if (line.startsWith("event:")) name = line.slice(6).trim();
        else if (line.startsWith("data:")) data.push(line.slice(5).trim());
    }
    return {name, data: data.join("\n")};
}

export const assistantService = new AssistantService();
