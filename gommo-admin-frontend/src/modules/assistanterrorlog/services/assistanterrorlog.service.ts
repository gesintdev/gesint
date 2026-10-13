import type {
    AssistantErrorLog,
    AssistantErrorLogPage,
} from "@/modules/assistanterrorlog/dto/assistanterrorlog.dto";
import { apiFetch } from "@/shared/lib/api.client";

const BASE_PATH = "/api/v1/assistant-error-logs";

class AssistantErrorLogService {
    findPage(page = 0, size = 20, q?: string): Promise<AssistantErrorLogPage> {
        const params = new URLSearchParams({
            page: String(page),
            size: String(size),
        });
        if (q?.trim()) {
            params.set("q", q.trim());
        }
        return apiFetch<AssistantErrorLogPage>(`${BASE_PATH}?${params.toString()}`);
    }

    getById(id: string): Promise<AssistantErrorLog> {
        return apiFetch<AssistantErrorLog>(`${BASE_PATH}/${id}`);
    }
}

export const assistantErrorLogService = new AssistantErrorLogService();
