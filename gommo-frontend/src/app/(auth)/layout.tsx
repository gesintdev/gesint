import type { ReactNode } from "react";

import { TenantEnvironmentGate } from "@/shared/components/auth/TenantEnvironmentGate";

export default function AuthLayout({ children }: { children: ReactNode }) {
    return <TenantEnvironmentGate>{children}</TenantEnvironmentGate>;
}
