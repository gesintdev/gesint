import type { PdfDeliveryMode } from "@/modules/cfg/account/services/account.service";

export function reservePdfWindow(mode: PdfDeliveryMode): Window | null {
    if (mode !== "NEW_TAB") return null;
    const popup = window.open("about:blank", "_blank");
    if (!popup) {
        throw new Error("POPUP_BLOCKED");
    }
    popup.opener = null;
    return popup;
}

export function closeReservedPdfWindow(popup: Window | null): void {
    if (popup && !popup.closed) popup.close();
}

export function deliverPdf(blob: Blob, mode: PdfDeliveryMode, filename: string, reservedWindow: Window | null): void {
    const url = URL.createObjectURL(blob);
    if (mode === "DOWNLOAD") {
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = filename;
        anchor.click();
    } else {
        if (!reservedWindow || reservedWindow.closed) {
            URL.revokeObjectURL(url);
            throw new Error("POPUP_BLOCKED");
        }
        reservedWindow.location.replace(url);
    }
    window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
