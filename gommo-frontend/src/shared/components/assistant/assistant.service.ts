import { apiFetch } from "@/shared/lib/api.client";

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

export type AssistantChatResponse = {
    reply: string;
    provider?: string;
    model?: string;
    usage?: AssistantLlmUsage | null;
};

class AssistantService {
    private readonly basePath = "/api/v1/assistant";

    chat(messages: AssistantChatMessage[]): Promise<AssistantChatResponse> {
        return apiFetch<AssistantChatResponse>(`${this.basePath}/chat`, {
            method: "POST",
            body: { messages },
        });
    }
}

export const assistantService = new AssistantService();
