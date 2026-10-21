"use client";

import { useCallback, useMemo } from "react";

import { useAdminPathname } from "@/shared/hooks/useAdminPathname";
import { setAdminPathname } from "@/shared/routing/admin-path-store";

type NavigateMode = "push" | "replace";

/**
 * Troca de aba/subaba sem router.push — só History API + estado local.
 * Evita remount/refresh do App Router no catch-all [[...segments]].
 */
export function useOptimisticPath<T>(
    parse: (pathname: string) => T,
    _isSame: (a: T, b: T) => boolean,
) {
    const pathname = useAdminPathname();
    const current = useMemo(() => parse(pathname), [pathname, parse]);

    const navigate = useCallback((href: string, _next: T, mode: NavigateMode = "push") => {
        setAdminPathname(href, mode);
    }, []);

    return {
        pathname,
        current,
        fromPath: current,
        navigate,
    };
}
