"use client";

import { useQuery } from "@tanstack/react-query";

import { accountPreferencesQueryKey } from "@/modules/cfg/account/account-preferences.query";
import { accountService } from "@/modules/cfg/account/services/account.service";

export function useAccountPreferences() {
    return useQuery({
        queryKey: accountPreferencesQueryKey,
        queryFn: () => accountService.getPreferences(),
        staleTime: 5 * 60_000,
    });
}
