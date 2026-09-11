import type {
    PublicPontoClockPayload,
    PublicPontoClockResult,
} from "@/modules/dp/attendance/dto/public-ponto.dto";
import { apiFetch } from "@/shared/lib/api.client";

class PublicPontoService {
    clock(payload: PublicPontoClockPayload, photo: File): Promise<PublicPontoClockResult> {
        const formData = new FormData();
        formData.append(
            "data",
            new Blob([JSON.stringify(payload)], { type: "application/json" }),
        );
        formData.append("photo", photo);
        return apiFetch<PublicPontoClockResult>("/api/v1/public/ponto/clock", {
            method: "POST",
            body: formData,
            skipAuth: true,
        });
    }
}

export const publicPontoService = new PublicPontoService();
