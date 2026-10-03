"use client";

import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import clsx from "clsx";
import {type FormEvent, useEffect, useState} from "react";
import {toast} from "sonner";

import {actingProfileKeys} from "@/modules/cfg/settings/actingprofile/actingprofile.query";
import {ActingProfileScopeFields} from "@/modules/cfg/settings/actingprofile/components/ActingProfileScopeFields";
import type {
    ActingProfileCreateDto,
    SystemScope,
} from "@/modules/cfg/settings/actingprofile/dto/acting-profile.dto";
import {
    actingProfileToFormDto,
    emptyActingProfileForm,
    normalizeActingProfileDto,
} from "@/modules/cfg/settings/actingprofile/lib/acting-profile.mapper";
import {actingProfileService} from "@/modules/cfg/settings/actingprofile/services/acting-profile.service";
import {
    systemScopeInfos,
    systemScopeLabel,
    systemScopeShortLabel,
} from "@/modules/cfg/settings/lib/access-menu-catalog";
import {useProfileScopeAccess} from "@/modules/cfg/settings/profile/hooks/useProfileScopeAccess";
import {CrudFormShell} from "@/shared/components/crud/CrudFormShell";
import {useCrudScreen} from "@/shared/components/crud/CrudScreen";
import {useTrackedCrudFormDirty} from "@/shared/components/crud/useTrackedCrudFormDirty";
import {Button} from "@/shared/components/ui/Button";
import {FormSection} from "@/shared/components/ui/FormSection";
import {InputString} from "@/shared/components/ui/input/index";
import {ExceptionCapture} from "@/shared/exceptions";

export function ActingProfileFormClient() {
    const {editingId, isEditing, goToList, showSavedRecord, startCreate} = useCrudScreen();
    const queryClient = useQueryClient();
    const {scopes: availableSystems} = useProfileScopeAccess();
    const [form, setForm] = useState<ActingProfileCreateDto>(() =>
        emptyActingProfileForm(availableSystems[0] ?? "RH"),
    );
    const [error, setError] = useState<string | null>(null);

    const detailQuery = useQuery({
        queryKey: actingProfileKeys.detail(editingId ?? ""),
        queryFn: () => actingProfileService.getById(editingId!),
        enabled: isEditing && Boolean(editingId),
    });

    useEffect(() => {
        if (!isEditing) {
            setForm(emptyActingProfileForm(availableSystems[0] ?? "RH"));
            setError(null);
            return;
        }
        if (detailQuery.data) {
            setForm(actingProfileToFormDto(detailQuery.data));
            setError(null);
        }
    }, [isEditing, detailQuery.data, availableSystems]);

    useTrackedCrudFormDirty({
        form,
        isEditing,
        detailData: detailQuery.data,
        toFormDto: actingProfileToFormDto,
        getEmptyForm: () => emptyActingProfileForm(availableSystems[0] ?? "RH"),
    });

    const saveMutation = useMutation({
        mutationFn: async (dto: ActingProfileCreateDto) => {
            const payload = normalizeActingProfileDto(dto);
            if (isEditing && editingId) {
                return actingProfileService.update(editingId, payload);
            }
            return actingProfileService.create(payload);
        },
        onSuccess: async (saved) => {
            await queryClient.invalidateQueries({queryKey: actingProfileKeys.all});
            if (editingId) {
                await queryClient.invalidateQueries({
                    queryKey: actingProfileKeys.detail(editingId),
                });
            }
            toast.success(isEditing ? "Perfil de atuação atualizado" : "Perfil de atuação cadastrado");
            void showSavedRecord(saved.id, saved);
        },
        onError: (err: unknown) => {
            const ex = ExceptionCapture.handle(err, {
                fallbackMessage: "Não foi possível salvar o perfil de atuação.",
            });
            setError(ex.displayMessage);
        },
    });

    const update = <K extends keyof ActingProfileCreateDto>(field: K, value: ActingProfileCreateDto[K]) => {
        setForm((prev) => ({...prev, [field]: value}));
    };

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!form.name.trim()) {
            setError("Informe o nome do perfil.");
            return;
        }
        if (form.dataScope === "DEPARTMENT" && !form.scopeRef) {
            setError("Informe o departamento quando a abrangência for Departamento.");
            return;
        }
        setError(null);
        saveMutation.mutate(form);
    };

    const systemsLocked = isEditing;

    if (isEditing && detailQuery.isLoading) {
        return (
            <div className="grid gap-2 p-5">
                {Array.from({length: 3}).map((_, i) => (
                    <div key={i} className="skeleton-shimmer h-10 w-full" />
                ))}
            </div>
        );
    }

    if (isEditing && detailQuery.isError) {
        return (
            <div className="p-5">
                <p className="text-sm font-medium text-error">
                    {ExceptionCapture.displayMessage(
                        detailQuery.error,
                        "Não foi possível carregar o perfil de atuação.",
                    )}
                </p>
                <Button variant="ghost" size="sm" className="mt-3" onClick={goToList}>
                    Voltar
                </Button>
            </div>
        );
    }

    return (
        <CrudFormShell
            onSubmit={handleSubmit}
            bodyClassName="!flex !min-h-0 !flex-1 !flex-col !overflow-hidden !p-0"
            footer={
                <>
                    <Button type="button" variant="ghost" onClick={goToList}>
                        Cancelar
                    </Button>
                    <Button type="button" variant="outline" onClick={startCreate}>
                        Novo cadastro
                    </Button>
                    <Button type="submit" loading={saveMutation.isPending}>
                        {isEditing ? "Salvar" : "Cadastrar"}
                    </Button>
                </>
            }
        >
            <FormSection
                id="atuacao"
                title="Perfil de atuação"
                className="flex min-h-0 flex-1 flex-col overflow-hidden !rounded-none !border-0 !shadow-none"
                bodyClassName="!flex !min-h-0 !flex-1 !flex-col !overflow-hidden !p-0 !gap-0"
            >
                <div className="grid h-full min-h-0 w-full grid-cols-1 overflow-hidden sm:col-span-12 lg:grid-cols-[minmax(18rem,22rem)_minmax(0,1fr)]">
                    <div className="flex min-h-0 min-w-0 flex-col border-b border-base-content/8 bg-base-200/25 lg:border-r lg:border-b-0">
                        <div className="shrink-0 px-4 pt-3 pb-2">
                            <h3 className="text-xs font-semibold tracking-wide text-base-content/70 uppercase">
                                Sistemas
                            </h3>
                            <p className="mt-0.5 text-[11px] text-base-content/45">
                                Selecione o sistema do perfil de atuação
                            </p>
                        </div>
                        <ul className="flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto px-3 pb-3">
                            {availableSystems.length === 0 ? (
                                <li className="rounded-xl border border-dashed border-base-content/15 px-3 py-4 text-center text-xs text-base-content/50">
                                    Nenhum sistema disponível para o seu acesso.
                                </li>
                            ) : null}
                            {availableSystems.map((scope) => {
                                const infos = systemScopeInfos(scope);
                                const Icon = infos.icon;
                                const active = form.system === scope;
                                const disabled = systemsLocked && !active;
                                return (
                                    <li key={scope}>
                                        <button
                                            type="button"
                                            title={systemScopeLabel(scope)}
                                            disabled={disabled}
                                            onClick={() => update("system", scope as SystemScope)}
                                            className={clsx(
                                                "group flex w-full items-center gap-3 rounded-xl border px-3 py-3.5 text-left transition-all duration-200",
                                                active
                                                    ? "border-primary/35 bg-primary/8 shadow-[0_0_0_1px_color-mix(in_srgb,var(--color-primary)_18%,transparent)]"
                                                    : "border-base-content/10 bg-base-100 hover:border-base-content/18 hover:bg-base-100 hover:shadow-sm",
                                                disabled &&
                                                    "cursor-not-allowed opacity-45 hover:border-base-content/10 hover:shadow-none",
                                            )}
                                        >
                                            <span
                                                className={clsx(
                                                    "flex size-11 shrink-0 items-center justify-center rounded-xl transition-colors",
                                                    active
                                                        ? "bg-primary text-primary-content shadow-sm"
                                                        : "bg-base-200 text-base-content/65 group-hover:bg-primary/10 group-hover:text-primary",
                                                )}
                                            >
                                                <Icon className="size-5" strokeWidth={2} />
                                            </span>
                                            <span className="min-w-0 flex-1">
                                                <span
                                                    className={clsx(
                                                        "block truncate text-sm font-semibold",
                                                        active ? "text-primary" : "text-base-content",
                                                    )}
                                                >
                                                    {infos.name}
                                                </span>
                                                <span className="mt-0.5 flex items-center gap-2 text-[11px] text-base-content/50">
                                                    <span className="font-medium tracking-wide uppercase">
                                                        {systemScopeShortLabel(scope)}
                                                    </span>
                                                </span>
                                            </span>
                                            <span
                                                className={clsx(
                                                    "size-2 shrink-0 rounded-full transition-colors",
                                                    active
                                                        ? "bg-primary"
                                                        : "bg-transparent group-hover:bg-base-content/20",
                                                )}
                                            />
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>

                    <div className="flex min-h-0 min-w-0 flex-col overflow-hidden">
                        <div className="shrink-0 space-y-3 border-b border-base-content/8 px-4 pt-3 pb-3">
                            <div>
                                <h3 className="text-xs font-semibold tracking-wide text-base-content/70 uppercase">
                                    Identificação — {systemScopeLabel(form.system)}
                                </h3>
                                <p className="mt-0.5 text-[11px] text-base-content/45">
                                    Nome e descrição do perfil de atuação
                                </p>
                            </div>
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                <InputString
                                    label="Nome do perfil"
                                    required
                                    value={form.name}
                                    onValueChange={(value) => update("name", value)}
                                    wrapperClassName="min-w-0"
                                />
                                <InputString
                                    label="Descrição"
                                    value={form.description ?? ""}
                                    onValueChange={(value) => update("description", value)}
                                    wrapperClassName="min-w-0"
                                />
                            </div>
                        </div>
                        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
                            <ActingProfileScopeFields
                                dataScope={form.dataScope}
                                scopeRef={form.scopeRef}
                                onDataScopeChange={(value) => update("dataScope", value)}
                                onScopeRefChange={(value) => update("scopeRef", value)}
                                showPreview
                            />
                        </div>
                    </div>
                </div>
            </FormSection>
            {error ? <p className="shrink-0 px-5 py-3 text-sm font-medium text-error">{error}</p> : null}
        </CrudFormShell>
    );
}
