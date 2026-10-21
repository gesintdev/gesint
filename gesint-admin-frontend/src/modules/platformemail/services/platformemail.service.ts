import type {
    PlatformEmailSettings,
    PlatformEmailSettingsUpsertDto,
} from "@/modules/platformemail/dto/platformemail.dto";
import { apiFetch } from "@/shared/lib/api.client";

const BASE_PATH = "/api/v1/platform-email-settings";

class PlatformEmailService {
    get(): Promise<PlatformEmailSettings> {
        return apiFetch<PlatformEmailSettings>(BASE_PATH);
    }

    save(dto: PlatformEmailSettingsUpsertDto): Promise<PlatformEmailSettings> {
        return apiFetch<PlatformEmailSettings>(BASE_PATH, { method: "PUT", body: dto });
    }

    sendTest(to: string): Promise<PlatformEmailSettings> {
        return apiFetch<PlatformEmailSettings>(`${BASE_PATH}/test`, { method: "POST", body: { to } });
    }
}

export const platformEmailService = new PlatformEmailService();
