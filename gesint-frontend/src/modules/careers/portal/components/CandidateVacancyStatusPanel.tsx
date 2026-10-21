"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";

import { CandidateApplicationTimeline } from "@/modules/careers/portal/components/CandidateApplicationTimeline";
import {
    candidatePortalKeys,
    candidatePortalService,
} from "@/modules/careers/portal/services/candidate-portal.service";
import { Button } from "@/shared/components/ui/Button";
import { ExceptionCapture } from "@/shared/exceptions";

function formatAppliedAt(value: string) {
    try {
        return new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium" }).format(new Date(value));
    } catch {
        return value;
    }
}

/** Acompanhamento da triagem na propria pagina da vaga (RN-33 / D8). */
export function CandidateVacancyStatusPanel({ slug }: { slug: string }) {
    const queryClient = useQueryClient();
    const applicationQuery = useQuery({
        queryKey: candidatePortalKeys.byVacancy(slug),
        queryFn: () => candidatePortalService.getApplicationByVacancySlug(slug),
        retry: false,
    });

    const withdraw = useMutation({
        mutationFn: (applicationId: string) => candidatePortalService.withdraw(applicationId),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: candidatePortalKeys.byVacancy(slug) });
            void queryClient.invalidateQueries({ queryKey: candidatePortalKeys.applications });
        },
    });

    if (applicationQuery.isLoading) {
        return <div className="skeleton-shimmer h-36 rounded-xl" />;
    }

    if (applicationQuery.isError || !applicationQuery.data) {
        return null;
    }

    const application = applicationQuery.data;

    return (
        <div className="rounded-xl border border-primary/25 bg-primary/5 p-5 sm:p-6">
            <div className="mb-1 text-xs font-bold tracking-[0.08em] text-primary">SUA CANDIDATURA</div>
            <h3 className="text-lg font-extrabold text-base-content">{application.jobTitle}</h3>
            <p className="mt-1 text-sm text-base-content/55">
                {[application.location, `enviada em ${formatAppliedAt(application.appliedAt)}`]
                    .filter(Boolean)
                    .join(" · ")}
            </p>
            <CandidateApplicationTimeline steps={application.timeline} className="mt-4" />
            {application.resultLabel ? (
                <p className="mt-3 text-sm font-medium">{application.resultLabel}</p>
            ) : (
                <p className="mt-3 text-sm text-base-content/65">
                    Acompanhe a triagem por aqui. Voce tambem pode ver todas as candidaturas no{" "}
                    <Link href="/careers/portal" className="font-semibold text-primary">
                        portal do candidato
                    </Link>
                    .
                </p>
            )}
            {withdraw.isError ? (
                <p className="mt-2 text-sm text-error">
                    {ExceptionCapture.displayMessage(withdraw.error, "Nao foi possivel retirar a candidatura.")}
                </p>
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
        </div>
    );
}
