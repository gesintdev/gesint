"use client";

import {AccountPasswordCard} from "@/modules/cfg/account/components/AccountPasswordCard";
import {AccountProfileCard} from "@/modules/cfg/account/components/AccountProfileCard";
import {AccountThemeCard} from "@/modules/cfg/account/components/AccountThemeCard";

export function AccountSettingsPage() {
    return (
        <div className="flex min-h-0 flex-1 flex-col overflow-auto p-4 md:p-6">
            <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
                <div>
                    <h1 className="text-lg font-semibold tracking-tight text-base-content">Configurações</h1>
                    <p className="mt-1 text-sm text-base-content/55">
                        Preferências da sua conta, senha e aparência do sistema.
                    </p>
                </div>
                <AccountProfileCard />
                <AccountThemeCard />
                <AccountPasswordCard />
            </div>
        </div>
    );
}

export default AccountSettingsPage;
