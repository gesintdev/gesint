"use client";

import {Briefcase, Building2, Mail, UserRound} from "lucide-react";
import {useSession} from "next-auth/react";

import {Card} from "@/shared/components/ui/Card";
import {ProfileAvatar} from "@/shared/components/ui/ProfileAvatar";

function InfoChip({
    icon: Icon,
    label,
    value,
}: {
    icon: typeof Mail;
    label: string;
    value?: string | null;
}) {
    return (
        <div className="rounded-xl bg-base-200/55 px-3.5 py-3 dark:bg-base-300/35">
            <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-base-content/45">
                <Icon className="size-3.5" strokeWidth={2} />
                {label}
            </div>
            <p className="mt-1 truncate text-sm font-semibold text-base-content">{value?.trim() || "—"}</p>
        </div>
    );
}

export function AccountProfileCard() {
    const {data: session} = useSession();
    const user = session?.user;
    const name = user?.name?.trim() || user?.username || "Usuário";
    const username = user?.username?.trim() || "—";
    const email = user?.email?.trim() || null;
    const photoObjectId = user?.photoObjectId;
    const departmentName = user?.departmentName;
    const jobPositionName = user?.jobPositionName;

    return (
        <Card animate={false} title="Sua conta" subtitle="Dados do usuário autenticado">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                <ProfileAvatar name={name} photoObjectId={photoObjectId} size="lg" shape="circle" />
                <div className="min-w-0 flex-1">
                    <h2 className="truncate text-base font-semibold tracking-tight text-base-content">{name}</h2>
                    <p className="mt-0.5 truncate text-sm text-base-content/50">@{username}</p>
                    <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
                        <InfoChip icon={Mail} label="E-mail" value={email} />
                        <InfoChip icon={UserRound} label="Usuário" value={username} />
                        <InfoChip icon={Building2} label="Departamento" value={departmentName} />
                        <InfoChip icon={Briefcase} label="Cargo" value={jobPositionName} />
                    </div>
                </div>
            </div>
        </Card>
    );
}
