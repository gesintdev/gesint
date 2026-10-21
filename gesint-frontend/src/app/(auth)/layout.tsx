import type { ReactNode } from "react";

import { LoginShell } from "@/shared/components/auth/LoginShell";
import { TenantEnvironmentGate } from "@/shared/components/auth/TenantEnvironmentGate";

/** Shell persistente: navegar entre login / esqueci / definir senha não recria o painel da marca. */
export default function AuthLayout({ children }: { children: ReactNode }) {
    return (
        <TenantEnvironmentGate>
            <LoginShell>{children}</LoginShell>
        </TenantEnvironmentGate>
    );
}
