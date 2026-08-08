/**
 * Server boot hook. Lab Coolify com cert self-signed em *.local quebra o
 * fetch do Auth.js (authorize) se Node rejeitar TLS — libera só nesse caso.
 */
export async function register(): Promise<void> {
    if (process.env.NEXT_RUNTIME !== "nodejs") {
        return;
    }
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "";
    const forceInsecure =
        process.env.NODE_TLS_REJECT_UNAUTHORIZED === "0" ||
        process.env.GOMMO_TLS_INSECURE === "true" ||
        apiUrl.includes(".local");
    if (forceInsecure) {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    }
}
