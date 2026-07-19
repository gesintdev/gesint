let signingOut = false;

/** Encerra a sessao NextAuth e vai para /login (idempotente). */
export async function signOutToLogin(): Promise<void> {
    if (typeof window === "undefined") return;
    if (signingOut) return;
    signingOut = true;
    try {
        const { signOut } = await import("next-auth/react");
        await signOut({ callbackUrl: "/login" });
    } catch {
        window.location.assign("/login");
    } finally {
        signingOut = false;
    }
}
