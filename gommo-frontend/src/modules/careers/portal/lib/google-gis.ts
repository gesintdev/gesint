type GoogleAccountsId = {
    initialize: (config: {
        client_id: string;
        callback: (response: { credential: string }) => void;
        auto_select?: boolean;
        ux_mode?: "popup" | "redirect";
    }) => void;
    renderButton: (
        parent: HTMLElement,
        options: {
            theme?: "outline" | "filled_blue" | "filled_black";
            size?: "large" | "medium" | "small";
            text?: "signin_with" | "signup_with" | "continue_with";
            shape?: "rectangular" | "pill" | "circle" | "square";
            width?: number;
            locale?: string;
        },
    ) => void;
};

declare global {
    interface Window {
        google?: { accounts: { id: GoogleAccountsId } };
    }
}

const SCRIPT_ID = "gommo-google-gis";
const SCRIPT_SRC = "https://accounts.google.com/gsi/client";

export function loadGoogleGisScript(): Promise<void> {
    if (typeof window === "undefined") {
        return Promise.reject(new Error("Google GIS so funciona no browser"));
    }
    if (window.google?.accounts?.id) {
        return Promise.resolve();
    }
    const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (existing) {
        return new Promise((resolve, reject) => {
            existing.addEventListener("load", () => resolve());
            existing.addEventListener("error", () => reject(new Error("Falha ao carregar Google")));
        });
    }
    return new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.id = SCRIPT_ID;
        script.src = SCRIPT_SRC;
        script.async = true;
        script.defer = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error("Falha ao carregar Google"));
        document.head.appendChild(script);
    });
}
