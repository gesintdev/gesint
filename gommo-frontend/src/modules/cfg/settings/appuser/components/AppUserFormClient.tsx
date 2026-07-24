"use client";

import {useMutation, useQueries, useQuery, useQueryClient} from "@tanstack/react-query";
import {KeyRound} from "lucide-react";
import {type SubmitEvent, useCallback, useEffect, useMemo, useState} from "react";
import {toast} from "sonner";

import {appUserKeys} from "@/modules/cfg/settings/appuser/appuser.query";
import {AppUserProfileAssignmentPanel} from "@/modules/cfg/settings/appuser/components/AppUserProfileAssignmentPanel";
import type {AppUser, AppUserCreateDto} from "@/modules/cfg/settings/appuser/dto/appuser.dto";
import {
    suggestEmailFromCollaborator,
    suggestUsernameFromCollaborator,
} from "@/modules/cfg/settings/appuser/lib/collaborator-credentials";
import {appUserService} from "@/modules/cfg/settings/appuser/services/appuser.service";
import {
    ASSIGNABLE_SYSTEM_SCOPES,
    type SystemScope,
} from "@/modules/cfg/settings/lib/access-menu-catalog";
import type {Profile} from "@/modules/cfg/settings/profile/dto/profile.dto";
import {profileKeys} from "@/modules/cfg/settings/profile/profile.query";
import {profileService} from "@/modules/cfg/settings/profile/services/profile.service";
import {collaboratorService} from "@/modules/rh/person/collaborators/people/services/collaborator.service";
import {showAccessTokenReveal} from "@/shared/access-token-reveal";
import {CollaboratorPickerField} from "@/shared/components/crud/CollaboratorPickerField";
import {CrudFormShell} from "@/shared/components/crud/CrudFormShell";
import {useCrudScreen} from "@/shared/components/crud/CrudScreen";
import {Button} from "@/shared/components/ui/Button";
import {FormSection} from "@/shared/components/ui/FormSection";
import {type FormStepNavItem} from "@/shared/components/ui/FormStepper";
import {InputString} from "@/shared/components/ui/input/index";
import {ExceptionCapture} from "@/shared/exceptions";
import {SystemAlert} from "@/shared/system-alert";

function emptyRoleIdsBySystem(): Partial<Record<SystemScope, string[]>> {
    return Object.fromEntries(ASSIGNABLE_SYSTEM_SCOPES.map((scope) => [scope, []])) as Partial<
        Record<SystemScope, string[]>
    >;
}

const emptyForm = (): AppUserCreateDto => ({
    collaboratorId: "",
    username: "",
    email: "",
    roleIdsBySystem: emptyRoleIdsBySystem(),
});

const FORM_STEPS: FormStepNavItem[] = [
    {id: "dados", label: "Dados"},
    {id: "perfis", label: "Perfis"},
];

export function AppUserFormClient() {
    const {editingId, isEditing, goToList} = useCrudScreen();
    const queryClient = useQueryClient();
    const [form, setForm] = useState<AppUserCreateDto>(emptyForm());
    const [error, setError] = useState<string | null>(null);
    const detailQuery = useQuery({
        queryKey: appUserKeys.detail(editingId ?? ""),
        queryFn: () => appUserService.getById(editingId!),
        enabled: isEditing && Boolean(editingId),
    });
    const profileQueries = useQueries({
        queries: ASSIGNABLE_SYSTEM_SCOPES.map((scope) => ({
            queryKey: profileKeys.list(scope),
            queryFn: () => profileService.getAll(scope),
        })),
    });

    const profilesBySystem = useMemo(() => {
        const map = {} as Partial<Record<SystemScope, Profile[]>>;
        ASSIGNABLE_SYSTEM_SCOPES.forEach((scope, index) => {
            map[scope] = profileQueries[index]?.data ?? [];
        });
        return map;
    }, [profileQueries]);

    const loadingBySystem = useMemo(() => {
        const map = {} as Partial<Record<SystemScope, boolean>>;
        ASSIGNABLE_SYSTEM_SCOPES.forEach((scope, index) => {
            map[scope] = profileQueries[index]?.isLoading ?? false;
        });
        return map;
    }, [profileQueries]);

    useEffect(() => {
        if (!isEditing) {
            setForm(emptyForm());
            setError(null);
            return;
        }

        if (detailQuery.data) {
            const roleIdsBySystem = emptyRoleIdsBySystem();
            for (const scope of ASSIGNABLE_SYSTEM_SCOPES) {
                roleIdsBySystem[scope] = detailQuery.data.rolesBySystem?.[scope]?.map((profile) => profile.id) ?? [];
            }
            setForm({
                collaboratorId: detailQuery.data.collaboratorId,
                username: detailQuery.data.username,
                email: detailQuery.data.email,
                roleIdsBySystem,
            });
            setError(null);
        }
    }, [isEditing, detailQuery.data]);

    const handleCollaboratorChange = useCallback(async (collaboratorId: string) => {
        if (!collaboratorId) {
            setForm((prev) => ({...prev, collaboratorId: ""}));
            return;
        }
        try {
            const collaborator = await collaboratorService.getById(collaboratorId);
            setForm((prev) => ({
                ...prev,
                collaboratorId,
                username: suggestUsernameFromCollaborator(collaborator),
                email: suggestEmailFromCollaborator(collaborator),
            }));
        } catch {
            setForm((prev) => ({...prev, collaboratorId}));
        }
    }, []);

    const saveMutation = useMutation({
        mutationFn: async (dto: AppUserCreateDto) => {
            const roleIdsBySystem = emptyRoleIdsBySystem();
            for (const scope of ASSIGNABLE_SYSTEM_SCOPES) {
                roleIdsBySystem[scope] = dto.roleIdsBySystem?.[scope] ?? [];
            }
            const payload: AppUserCreateDto = {
                ...dto,
                roleIdsBySystem,
            };
            if (isEditing && editingId) return appUserService.update(editingId, payload);
            return appUserService.create(payload);
        },
        onSuccess: async (saved: AppUser) => {
            await queryClient.invalidateQueries({queryKey: appUserKeys.all});
            if (!isEditing && saved.accessToken) {
                await showAccessTokenReveal(saved.accessToken, "create");
            } else {
                toast.success(isEditing ? "Usuário atualizado" : "Usuário cadastrado");
            }
            goToList();
        },
        onError: (err: unknown) => {
            const ex = ExceptionCapture.handle(err, {fallbackMessage: "Não foi possível salvar o usuário."});
            setError(ex.displayMessage);
        },
    });

    const resetAccessMutation = useMutation({
        mutationFn: async () => {
            if (!editingId) throw new Error("Usuário ainda não foi salvo.");
            return appUserService.resetAccess(editingId);
        },
        onSuccess: async (saved) => {
            if (saved.accessToken) {
                await showAccessTokenReveal(saved.accessToken, "reset");
            } else {
                toast.success("Novo token gerado");
            }
        },
        onError: (err: unknown) => {
            const ex = ExceptionCapture.handle(err, {fallbackMessage: "Não foi possível gerar um novo token."});
            toast.error(ex.displayMessage);
        },
    });

    const handleResetAccess = async () => {
        if (!isEditing || !editingId) {
            toast.message("Salve o usuário antes de gerar um novo token.");
            return;
        }
        const confirmed = await SystemAlert.confirm({
            title: "Gerar novo token",
            message:
                "A senha atual será removida e um novo token de acesso será gerado. O token anterior deixará de valer. Deseja continuar?",
            confirmLabel: "Gerar novo token",
            cancelLabel: "Cancelar",
        });
        if (!confirmed) return;
        resetAccessMutation.mutate();
    };

    const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        saveMutation.mutate(form);
    };

    if (isEditing && detailQuery.isLoading) {
        return (
            <div className="grid gap-2 p-5">
                {Array.from({length: 4}).map((_, i) => (
                    <div key={i} className="skeleton-shimmer h-10 w-full"/>
                ))}
            </div>
        );
    }

    return (
        <CrudFormShell
            onSubmit={handleSubmit}
            stepper={{
                steps: FORM_STEPS,
                resetKey: editingId ?? "new",
            }}
            footer={
                <>
                    <Button type="button" variant="ghost" onClick={goToList}>
                        Cancelar
                    </Button>
                    <Button type="submit" variant="primary" loading={saveMutation.isPending}>
                        Salvar usuário
                    </Button>
                </>
            }
        >
            <FormSection id="dados" title="Dados do usuário">
                <CollaboratorPickerField
                    value={form.collaboratorId}
                    onValueChange={handleCollaboratorChange}
                    required
                    wrapperClassName="sm:col-span-3"
                />
                <InputString
                    label="Nome de usuário"
                    value={form.username}
                    onValueChange={(value) => setForm((prev) => ({...prev, username: value}))}
                    required
                    wrapperClassName="sm:col-span-3"
                />
                <InputString
                    label="E-mail"
                    value={form.email}
                    onValueChange={(value) => setForm((prev) => ({...prev, email: value}))}
                    required
                    wrapperClassName="sm:col-span-3"
                />
                <div className="flex items-end min-w-0 gap-1.5 sm:col-span-3">
                    <Button
                        type="button"
                        className="w-full justify-center"
                        leftIcon={<KeyRound className="size-4"/>}
                        disabled={!isEditing || resetAccessMutation.isPending}
                        loading={resetAccessMutation.isPending}
                        onClick={handleResetAccess}
                        title={isEditing ? "Gerar novo token de acesso" : "Disponível após salvar o usuário"}
                    >
                        Gerar novo token
                    </Button>
                </div>
            </FormSection>
            <FormSection id="perfis" title="Perfis por sistema" bodyClassName="!p-0 !gap-0">
                <AppUserProfileAssignmentPanel
                    profilesBySystem={profilesBySystem}
                    selectedIdsBySystem={form.roleIdsBySystem ?? {}}
                    loadingBySystem={loadingBySystem}
                    onChange={(scope, ids) =>
                        setForm((prev) => ({
                            ...prev,
                            roleIdsBySystem: {
                                ...prev.roleIdsBySystem,
                                [scope]: ids,
                            },
                        }))
                    }
                />
            </FormSection>
            {error ? <p className="px-4 pb-3 text-sm font-medium text-error">{error}</p> : null}
        </CrudFormShell>
    );
}
