import type { Payslip, PayslipCreateDto } from "@/modules/payroll/payslip/dto/payslip.dto";
import { BaseService } from "@/modules/root/services/base.service";
import { doRequest } from "@/shared/lib/api.client";

class PayslipService extends BaseService<Payslip, PayslipCreateDto, PayslipCreateDto> {
    constructor() {
        super("/api/v1/payslips");
    }

    downloadPdf(id: string): Promise<Blob> {
        return doRequest<Blob>(`${this.basePath}/${id}/pdf`, { responseType: "blob" });
    }
}

export const payslipService = new PayslipService();

export function payslipPdfFilename(payslip: Pick<Payslip, "id" | "code">): string {
    const code = payslip.code != null ? String(payslip.code) : payslip.id;
    return `holerite-${code}.pdf`;
}

export async function openPayslipPdf(blob: Blob, mode: "download" | "print", filename: string): Promise<void> {
    const url = URL.createObjectURL(blob);
    try {
        if (mode === "download") {
            const anchor = document.createElement("a");
            anchor.href = url;
            anchor.download = filename;
            anchor.click();
            return;
        }

        const popup = window.open(url, "_blank", "noopener,noreferrer");
        if (!popup) {
            throw new Error("POPUP_BLOCKED");
        }
        popup.addEventListener("load", () => {
            popup.focus();
            popup.print();
        });
    } finally {
        window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    }
}
