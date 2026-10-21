import type {AgendaEvent, AgendaEventRequest} from "@/modules/cfg/settings/agenda/dto/agenda-event.dto";
import {apiFetch} from "@/shared/lib/api.client";

class AgendaEventService {
    private readonly basePath = "/api/v1/agenda-events";

    listInRange(from: string, to: string) {
        const params = new URLSearchParams({from, to});
        return apiFetch<AgendaEvent[]>(`${this.basePath}?${params.toString()}`);
    }

    create(payload: AgendaEventRequest) {
        return apiFetch<AgendaEvent>(this.basePath, {
            method: "POST",
            body: payload,
        });
    }

    update(id: string, payload: AgendaEventRequest) {
        return apiFetch<AgendaEvent>(`${this.basePath}/${id}`, {
            method: "PUT",
            body: payload,
        });
    }

    delete(id: string) {
        return apiFetch<void>(`${this.basePath}/${id}`, {
            method: "DELETE",
        });
    }
}

export const agendaEventService = new AgendaEventService();
