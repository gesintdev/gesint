"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import clsx from "clsx";
import { ExternalLink } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { CareersBlocksPanel } from "@/modules/careers/admin/components/CareersBlocksPanel";
import { CareersPreviewPane } from "@/modules/careers/admin/components/CareersPreviewPane";
import { CareersPrivacySeoPanel } from "@/modules/careers/admin/components/CareersPrivacySeoPanel";
import { CareersThemePanel } from "@/modules/careers/admin/components/CareersThemePanel";
import type { CareersPageDraft, CareersPageTheme } from "@/modules/careers/admin/dto/careers-page.dto";
import {
    CAREERS_SAMPLE_VACANCIES,
    type CareersEditorState,
    editorSignature,
    toEditorState,
    toRequest,
} from "@/modules/careers/admin/lib/careers-editor";
import { careersPageKeys, careersPageService } from "@/modules/careers/admin/services/careers-page.service";
import { useHasPermission } from "@/shared/auth/permissions";
import { Button } from "@/shared/components/ui/Button";
import { ExceptionCapture } from "@/shared/exceptions";

type PanelTab = "blocks" | "theme" | "privacy";

const TABS: { value: PanelTab; label: string }[] = [
    { value: "blocks", label: "Blocos" },
    { value: "theme", label: "Aparência" },
    { value: "privacy", label: "Privacidade e SEO" },
];

function StatusBadge({ draft, dirty }: { draft: CareersPageDraft; dirty: boolean }) {
    if (dirty) return <span className="gommo-badge gommo-badge--warning">Alterações não salvas</span>;
    if (!draft.published) return <span className="gommo-badge gommo-badge--neutral">Não publicada · layout padrão no ar</span>;
    if (draft.hasUnpublishedChanges) return <span className="gommo-badge gommo-badge--info">Rascunho salvo · não publicado</span>;
    return <span className="gommo-badge gommo-badge--success">Publicada</span>;
}

/** CFG › Página de carreiras (RN-32): tema, blocos persistidos, rascunho/publicação e preview. */
export function CareersPageEditorPage() {
    const queryClient = useQueryClient();
    const canWrite = useHasPermission("careerspage:write");
    const [tab, setTab] = useState<PanelTab>("blocks");
    const [state, setState] = useState<CareersEditorState | null>(null);
    const [savedSignature, setSavedSignature] = useState("");

    const draftQuery = useQuery({
        queryKey: careersPageKeys.draft,
        queryFn: () => careersPageService.getDraft(),
    });

    const siteQuery = useQuery({
        queryKey: careersPageKeys.previewSite,
        queryFn: () => careersPageService.getPublicSite(),
        retry: false,
        staleTime: 60_000,
    });

    const applyDraft = (draft: CareersPageDraft) => {
        const next = toEditorState(draft);
        setState(next);
        setSavedSignature(draft.persisted ? editorSignature(next) : "");
        queryClient.setQueryData(careersPageKeys.draft, draft);
    };

    useEffect(() => {
        if (draftQuery.data && state === null) {
            const next = toEditorState(draftQuery.data);
            setState(next);
            setSavedSignature(draftQuery.data.persisted ? editorSignature(next) : "");
        }
    }, [draftQuery.data, state]);

    const draft = draftQuery.data;
    const dirty = useMemo(() => state !== null && editorSignature(state) !== savedSignature, [state, savedSignature]);

    const onError = (fallbackMessage: string) => (err: unknown) => {
        toast.error(ExceptionCapture.handle(err, { fallbackMessage }).displayMessage);
    };

    const saveMutation = useMutation({
        mutationFn: () => careersPageService.saveDraft(toRequest(state!)),
        onSuccess: (saved) => {
            applyDraft(saved);
            toast.success("Rascunho salvo");
        },
        onError: onError("Não foi possível salvar o rascunho."),
    });

    const publishMutation = useMutation({
        mutationFn: async () => {
            if (dirty || !draft?.persisted) {
                await careersPageService.saveDraft(toRequest(state!));
            }
            return careersPageService.publish();
        },
        onSuccess: async (published) => {
            applyDraft(published);
            await queryClient.invalidateQueries({ queryKey: careersPageKeys.previewSite });
            toast.success("Página publicada");
        },
        onError: onError("Não foi possível publicar a página."),
    });

    const discardMutation = useMutation({
        mutationFn: () => careersPageService.discard(),
        onSuccess: (restored) => {
            applyDraft(restored);
            toast.success("Rascunho descartado — voltou para a versão publicada");
        },
        onError: onError("Não foi possível descartar o rascunho."),
    });

    const unpublishMutation = useMutation({
        mutationFn: () => careersPageService.unpublish(),
        onSuccess: (result) => {
            applyDraft(result);
            toast.success("Página despublicada — o layout padrão voltou ao ar");
        },
        onError: onError("Não foi possível despublicar a página."),
    });

    if (draftQuery.isLoading || (!state && !draftQuery.isError)) {
        return (
            <div className="flex min-h-0 flex-1 flex-col gap-4 p-4 lg:flex-row">
                <div className="skeleton-shimmer h-48 w-full shrink-0 rounded-xl lg:h-full lg:w-[420px]" />
                <div className="skeleton-shimmer h-full min-h-48 flex-1 rounded-xl" />
            </div>
        );
    }

    if (draftQuery.isError || !draft || !state) {
        return (
            <div className="flex min-h-0 flex-1 items-center justify-center p-6 text-sm text-base-content/60">
                {ExceptionCapture.displayMessage(draftQuery.error, "Não foi possível carregar a página de carreiras.")}
            </div>
        );
    }

    const busy =
        saveMutation.isPending || publishMutation.isPending || discardMutation.isPending || unpublishMutation.isPending;
    const disabled = !canWrite || busy;
    const updateTheme = (patch: Partial<CareersPageTheme>) =>
        setState((prev) => (prev ? { ...prev, theme: { ...prev.theme, ...patch } } : prev));
    const canDiscard = draft.published && (dirty || draft.hasUnpublishedChanges);
    const canPublish = dirty || !draft.published || draft.hasUnpublishedChanges;
    const previewVacancies = siteQuery.data?.vacancies ?? [];
    const usingSample = previewVacancies.length === 0;

    return (
        <div className="flex min-h-0 flex-1 flex-col">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-(--gommo-border-subtle) bg-base-100 px-4 py-3">
                <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                        <h1 className="text-lg font-semibold tracking-tight text-base-content">Página de carreiras</h1>
                        <StatusBadge draft={draft} dirty={dirty} />
                    </div>
                    <p className="mt-0.5 text-xs text-base-content/55">
                        Personalize a página pública com todas as vagas abertas (/careers).
                        {draft.publishedAt
                            ? ` Publicada em ${new Date(draft.publishedAt).toLocaleString("pt-BR")}.`
                            : ""}
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <a
                        href="/careers"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="gommo-btn gommo-btn--ghost gommo-btn--sm"
                    >
                        <ExternalLink className="size-3.5" strokeWidth={2} />
                        Ver página
                    </a>
                    {draft.published ? (
                        <Button
                            variant="ghost"
                            size="sm"
                            disabled={disabled}
                            loading={unpublishMutation.isPending}
                            onClick={() => {
                                if (window.confirm("Despublicar? O site volta ao layout padrão com a lista de vagas.")) {
                                    unpublishMutation.mutate();
                                }
                            }}
                        >
                            Despublicar
                        </Button>
                    ) : null}
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={disabled || !canDiscard}
                        loading={discardMutation.isPending}
                        onClick={() => {
                            if (window.confirm("Descartar o rascunho e voltar para a versão publicada?")) {
                                discardMutation.mutate();
                            }
                        }}
                    >
                        Descartar
                    </Button>
                    <Button
                        variant="secondary"
                        size="sm"
                        disabled={disabled || !dirty}
                        loading={saveMutation.isPending}
                        onClick={() => saveMutation.mutate()}
                    >
                        Salvar rascunho
                    </Button>
                    <Button
                        variant="primary"
                        size="sm"
                        disabled={disabled || !canPublish}
                        loading={publishMutation.isPending}
                        onClick={() => publishMutation.mutate()}
                    >
                        Publicar
                    </Button>
                </div>
            </div>

            <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
                <aside className="flex min-h-0 w-full shrink-0 flex-col border-b border-(--gommo-border-subtle) bg-base-100 lg:w-[420px] lg:border-b-0 lg:border-r">
                    <div className="flex gap-1 border-b border-(--gommo-border-subtle) px-3 pt-2" role="tablist">
                        {TABS.map((item) => (
                            <button
                                key={item.value}
                                type="button"
                                role="tab"
                                aria-selected={tab === item.value}
                                onClick={() => setTab(item.value)}
                                className={clsx(
                                    "-mb-px border-b-2 px-3 py-2 text-sm font-medium transition-colors",
                                    tab === item.value
                                        ? "border-primary text-base-content"
                                        : "border-transparent text-base-content/55 hover:text-base-content",
                                )}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>
                    <div className="min-h-0 flex-1 overflow-y-auto p-4">
                        {!canWrite ? (
                            <p className="mb-4 rounded-lg bg-base-200 px-3 py-2 text-xs text-base-content/60">
                                Você pode visualizar, mas não tem permissão para editar esta página.
                            </p>
                        ) : null}
                        {tab === "blocks" ? (
                            <CareersBlocksPanel
                                blocks={state.blocks}
                                disabled={disabled}
                                onChange={(blocks) => setState((prev) => (prev ? { ...prev, blocks } : prev))}
                            />
                        ) : null}
                        {tab === "theme" ? (
                            <CareersThemePanel
                                theme={state.theme}
                                organizationName={draft.organizationName}
                                disabled={disabled}
                                onChange={updateTheme}
                            />
                        ) : null}
                        {tab === "privacy" ? (
                            <CareersPrivacySeoPanel
                                theme={state.theme}
                                organizationName={draft.organizationName}
                                defaultPrivacyNotice={draft.defaultPrivacyNotice}
                                privacyNoticeVersion={draft.privacyNoticeVersion}
                                disabled={disabled}
                                onChange={updateTheme}
                            />
                        ) : null}
                    </div>
                </aside>
                <CareersPreviewPane
                    theme={state.theme}
                    blocks={state.blocks}
                    organizationName={draft.organizationName}
                    vacancies={usingSample ? CAREERS_SAMPLE_VACANCIES : previewVacancies}
                    usingSampleVacancies={usingSample}
                />
            </div>
        </div>
    );
}

export default CareersPageEditorPage;
