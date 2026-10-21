import type {
    DevEnvironmentSettings,
    DevEnvironmentUserUpdateDto,
} from "@/modules/devenvironment/dto/devenvironment.dto";
import { apiFetch } from "@/shared/lib/api.client";

const BASE_PATH = "/api/v1/dev-environment";

class DevEnvironmentService {
    get(): Promise<DevEnvironmentSettings> {
        return apiFetch<DevEnvironmentSettings>(BASE_PATH);
    }

    updatePlatformUser(dto: DevEnvironmentUserUpdateDto): Promise<DevEnvironmentSettings> {
        return apiFetch<DevEnvironmentSettings>(`${BASE_PATH}/platform-user`, {
            method: "PUT",
            body: dto,
        });
    }
}

export const devEnvironmentService = new DevEnvironmentService();
