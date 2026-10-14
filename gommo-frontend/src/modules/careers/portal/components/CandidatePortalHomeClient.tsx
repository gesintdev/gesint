"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { CandidateApplicationTimeline } from "@/modules/careers/portal/components/CandidateApplicationTimeline";
import { CandidatePortalShell } from "@/modules/careers/portal/components/CandidatePortalShell";
import { useCandidateSession } from "@/modules/careers/portal/hooks/useCandidateSession";
import {
    candidatePortalKeys,
    candidatePortalService,
} from "@/modules/careers/portal/services/candidate-portal.service";
import { Button } from "@/shared/components/ui/Button";
import { InputCheckbox, InputPhone, InputString } from "@/shared/components/ui/input/index";
import { ExceptionCapture } from "@/shared/exceptions";

function formatAppliedAt(value: string) {
    try {
        return new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium" }).format(new Date(value));
    } catch {
        return value;
    }
}

export function CandidatePortalHomeClient() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { ready, isAuthenticated, logout } = useCandidateSession();
    const [phone, setPhone] = useState("");
    const [fullName, setFullName] = useState("");
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (ready && !isAuthenticated) {
            router.replace(`/careers/portal/login?next=${encodeURIComponent("/careers/portal")}`);
        }
    }, [ready, isAuthenticated, router]);

    const meQuery = useQuery({
        queryKey: candidatePortalKeys.me,
        queryFn: () => candidatePortalService.me(),
        enabled: isAuthenticated,
    });

    const applicationsQuery = useQuery({
        queryKey: candidatePortalKeys.applications,
        queryFn: () => candidatePortalService.listApplications(),
        enabled: isAuthenticated,
    });

    useEffect(() => {
        if (meQuery.data) {
            setFullName(meQuery.data.fullName ?? "");
            setPhone(meQuery.data.phone ?? "");
        }
    }, [meQuery.data]);

    const saveProfile = useMutation({
        mutationFn: () => candidatePortalService.updateProfile({ fullName, phone }),
        onSuccess: () => {
            setMessage("Dados atualizados.");
            setError(null);
            void queryClient.invalidateQueries({ queryKey: candidatePortalKeys.me });
        },
        onError: (err) => {
            setError(ExceptionCapture.displayMessage(err, "Nao foi possivel salvar."));
        },
    });

    const consents = useMutation({
        mutationFn: (talentPoolConsent: boolean) =>
            candidatePortalService.updateConsents({ talentPoolConsent }),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: candidatePortalKeys.me });
        },
    });

    const withdraw = useMutation({
        mutationFn: (applicationId: string) => candidatePortalService.withdraw(applicationId),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: candidatePortalKeys.applications });
            setMessage("Candidatura retirada.");
        },
        onError: (err) => {
            setError(ExceptionCapture.displayMessage(err, "Nao foi possivel retirar a candidatura."));
        },
    });

    if (!ready || !isAuthenticated) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-base-200 text-sm text-base-content/60">
                Carregando portal…
            </div>
        );
    }

    const me = meQuery.data;
    const applications = applicationsQuery.data ?? [];

    return (
        <CandidatePortalShell title="Minhas candidaturas" organizationName={me?.organizationName}>
            {message ? <p className="mb-4 text-sm text-success">{message}</p> : null}
            {error ? <p className="mb-4 text-sm text-error">{error}</p> : null}

            <div className="grid gap-4">
                {applicationsQuery.isLoading ? (
                    <div className="skeleton-shimmer h-28 rounded-xl" />
                ) : applications.length === 0 ? (
                    <div className="rounded-xl border border-base-content/10 bg-base-100 p-5 text-sm text-base-content/65">
                        Voce ainda nao tem candidaturas neste ambiente.{" "}
                        <Link href="/careers" className="font-semibold text-primary">
                            Ver vagas abertas
                        </Link>
                    </div>
                ) : (
                    applications.map((application) => (
                        <article
                            key={application.applicationId}
                            className="rounded-xl border border-base-content/10 bg-base-100 p-4 sm:p-5"
                        >
                            <div className="flex flex-wrap items-start justify-between gap-2">
                                <div>
                                    <h2 className="text-base font-bold">{application.jobTitle}</h2>
                                    <p className="mt-0.5 text-xs text-base-content/55">
                                        {[application.location, `enviada em ${formatAppliedAt(application.appliedAt)}`]
                                            .filter(Boolean)
                                            .join(" · ")}
                                    </p>
                                </div>
                                {application.vacancySlug ? (
                                    <Link
                                        href={`/careers/${encodeURIComponent(application.vacancySlug)}`}
                                        className="text-xs font-semibold text-primary"
                                    >
                                        Abrir vaga
                                    </Link>
                                ) : null}
                            </div>
                            <CandidateApplicationTimeline steps={application.timeline} className="mt-3" />
                            {application.resultLabel ? (
                                <p className="mt-3 text-sm font-medium text-base-content/80">{application.resultLabel}</p>
                            ) : null}
                            {application.withdrawable ? (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="mt-3 text-error"
                                    disabled={withdraw.isPending}
                                    onClick={() => {
                                        if (window.confirm("Retirar esta candidatura?")) {
                                            withdraw.mutate(application.applicationId);
                                        }
                                    }}
                                >
                                    Retirar candidatura
                                </Button>
                            ) : null}
                        </article>
                    ))
                )}
            </div>

            <section className="mt-8 rounded-xl border border-base-content/10 bg-base-100 p-4 sm:p-5">
                <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-base-content/55">Meus dados</h2>
                <div className="grid gap-3">
                    <InputString label="Nome" value={fullName} onValueChange={setFullName} />
                    <InputString label="E-mail" value={me?.email ?? ""} disabled />
                    <InputPhone label="Telefone / WhatsApp" value={phone} onValueChange={setPhone} />
                    <Button type="button" onClick={() => saveProfile.mutate()} disabled={saveProfile.isPending}>
                        Salvar contato
                    </Button>
                </div>
            </section>

            <section className="mt-4 rounded-xl border border-base-content/10 bg-base-100 p-4 sm:p-5">
                <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-base-content/55">Privacidade</h2>
                <div className="grid gap-3 text-sm">
                    <InputCheckbox
                        size="sm"
                        checked={Boolean(me?.privacyConsentActive)}
                        disabled
                        label="Processo seletivo atual"
                        labelClassName="text-[13px] text-base-content/75"
                    />
                    <InputCheckbox
                        size="sm"
                        checked={Boolean(me?.talentPoolConsentActive)}
                        onCheckedChange={(next) => consents.mutate(next)}
                        label="Banco de talentos (12 meses)"
                        labelClassName="text-[13px] text-base-content/75"
                    />
                    <p className="text-xs text-base-content/50">
                        Pedir revisao de decisao ou falar com o encarregado (DPO): use o contato no aviso de
                        privacidade da pagina de carreiras.
                    </p>
                </div>
            </section>

            <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/careers" className="text-sm font-semibold text-primary">
                    Voltar para vagas
                </Link>
                <button
                    type="button"
                    className="text-sm text-base-content/50 hover:text-error"
                    onClick={() => {
                        logout();
                        router.replace("/careers");
                    }}
                >
                    Sair do portal
                </button>
            </div>
        </CandidatePortalShell>
    );
}
