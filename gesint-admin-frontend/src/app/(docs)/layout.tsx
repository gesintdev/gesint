import type { ReactNode } from "react";
import { notFound } from "next/navigation";

import { auth } from "@/auth";
import { DocsShell } from "@/shared/components/docs/DocsShell";

export default async function DocsLayout({ children }: { children: ReactNode }) {
    const session = await auth();
    if (!session?.user || session.error) {
        notFound();
    }

    return <DocsShell>{children}</DocsShell>;
}
