import type { SessionBootstrap } from "@/modules/root/auth/dto/session-bootstrap.dto";
import { apiFetch } from "@/shared/lib/api.client";

class AuthSessionService {
    bootstrap(): Promise<SessionBootstrap> {
        return apiFetch<SessionBootstrap>("/api/v1/auth/me");
    }
}

export const authSessionService = new AuthSessionService();

export const authKeys = {
    all: ["auth"] as const,
    bootstrap: () => [...authKeys.all, "bootstrap"] as const,
};
