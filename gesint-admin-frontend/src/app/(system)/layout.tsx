import type { ReactNode } from "react";

import { AdminShell } from "@/shared/components/layout/AdminShell";

export default function SystemLayout({ children }: { children: ReactNode }) {
    return <AdminShell>{children}</AdminShell>;
}
