"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import {
    getAdminPathname,
    subscribeAdminPathname,
    syncAdminPathnameFromLocation,
} from "@/shared/routing/admin-path-store";

/** Pathname do admin sem remount do App Router (History API). */
export function useAdminPathname() {
    const nextPathname = usePathname();
    const [pathname, setPathname] = useState(() => getAdminPathname() || nextPathname);

    useEffect(() => {
        syncAdminPathnameFromLocation();
        setPathname(getAdminPathname());
        return subscribeAdminPathname(setPathname);
    }, []);

    useEffect(() => {
        // Navegação real do Next (sidebar Link, login redirect, etc.)
        syncAdminPathnameFromLocation();
        setPathname(nextPathname);
    }, [nextPathname]);

    useEffect(() => {
        const onPopState = () => {
            syncAdminPathnameFromLocation();
        };
        window.addEventListener("popstate", onPopState);
        return () => window.removeEventListener("popstate", onPopState);
    }, []);

    return pathname;
}
