"use client";

import {useMutation, useQueries, useQuery, useQueryClient} from "@tanstack/react-query";
import {KeyRound} from "lucide-react";
import {type SubmitEvent, useCallback, useEffect, useMemo, useState} from "react";
import {toast} from "sonner";

import {actingProfileKeys} from "@/modules/cfg/settings/actingprofile/actingprofile.query";
import type {ActingProfile} from "@/modules/cfg/settings/actingprofile/dto/acting-profile.dto";
import {actingProfileService} from "@/modules/cfg/settings/actingprofile/services/acting-profile.service";
import {appUserKeys} from "@/modules/cfg/settings/appuser/appuser.query";
import {AppUserProfileAssignmentPanel} from "@/modules/cfg/settings/appuser/components/AppUserProfileAssignmentPanel";
import type {AppUser, AppUserCreateDto, RoleIdsByBranch} from "@/modules/cfg/settings/appuser/dto/appuser.dto";
import {APP_USER_CLIENT_MESSAGES} from "@/modules/cfg/settings/appuser/exceptions/appuser.messages";
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
import {CrudFormFooterActions} from "@/shared/components/crud/CrudFormFooterActions";
import {CrudFormShell} from "@/shared/components/crud/CrudFormShell";
import {useCrudScreen} from "@/shared/components/crud/CrudScreen";
import {useCrudFormDirty} from "@/shared/components/crud/useCrudFormDirty";
import {useFormDirtyByComparison} from "@/shared/components/crud/useFormDirtyByComparison";
import {Button} from "@/shared/components/ui/Button";
import {FormSection} from "@/shared/components/ui/FormSection";
import {SkeletonStack} from "@/shared/components/ui/SkeletonStack";
import {type FormStepNavItem} from "@/shared/components/ui/FormStepper";
import {InputString} from "@/shared/components/ui/input/index";
import {useActiveBranch} from "@/shared/context/ActiveBranchContext";
import {ExceptionCapture} from "@/shared/exceptions";
import {SystemAlert} from "@/shared/system-alert";

function emptyRoleIdsBySystem(): Partial<Record<SystemScope, string[]>> {
    return Object.fromEntries(ASSIGNABLE_SYSTEM_SCOPES.map((scope) => [scope, []])) as Partial<
        Record<SystemScope, string[]>
    >;
}

/** O backend espera o mapa completo filial -> sistema -> perfis, inclusive filiais sem perfil. */
function toSavePayload(dto: AppUserCreateDto, branchIds: string[]): AppUserCreateDto {
    const roleIdsByBranch: RoleIdsByBranch = {};
    const actingProfileIdsByBranch: RoleIdsByBranch = {};
    const allBranchIds = new Set([
        ...branchIds,
        ...Object.keys(dto.roleIdsByBranch ?? {}),
        ...Object.keys(dto.actingProfileIdsByBranch ?? {}),
    ]);
    for (const branchId of allBranchIds) {
        const bySystem = emptyRoleIdsBySystem();
        const actingBySystem = emptyRoleIdsBySystem();
        for (const scope of ASSIGNABLE_SYSTEM_SCOPES) {
            bySystem[scope] = dto.roleIdsByBranch?.[branchId]?.[scope] ?? [];
            actingBySystem[scope] = dto.actingProfileIdsByBranch?.[branchId]?.[scope] ?? [];
        }
        roleIdsByBranch[branchId] = bySystem;
        actingProfileIdsByBranch[branchId] = actingBySystem;
    }
    return {
        ...dto,
        roleIdsByBranch,
        actingProfileIdsByBranch,
    };
}

const emptyForm = (): AppUserCreateDto => ({
    collaboratorId: "",
    username: "",
    email: "",
    roleIdsByBranch: {},
    actingProfileIdsByBranch: {},
});

function roleIdsFromProfilesByBranch(
    rolesByBranch: AppUser["rolesByBranch"] | AppUser["actingProfilesByBranch"],
): RoleIdsByBranch {
    const roleIdsByBranch: RoleIdsByBranch = {};
    for (const [branchId, rolesBySystem] of Object.entries(rolesByBranch ?? {})) {
        const bySystem = emptyRoleIdsBySystem();
        for (const scope of ASSIGNABLE_SYSTEM_SCOPES) {
            bySystem[scope] = rolesBySystem?.[scope]?.map((profile) => profile.id) ?? [];
        }
        roleIdsByBranch[branchId] = bySystem;
    }
    return roleIdsByBranch;
}

const FORM_STEPS: FormStepNavItem[] = [
    {id: "dados", label: "Dados"},
    {id: "perfis", label: "Perfis"},
];

const DELETED_USER_CONFLICT_CODE = "APP_USER_DELETED_EXISTS";

export function AppUserFormClient() {
    const {editingId, isEditing, goToList, showSavedRecord} = useCrudScreen();
    const {branches} = useActiveBranch();
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
    const actingProfileQueries = useQueries({
        queries: ASSIGNABLE_SYSTEM_SCOPES.map((scope) => ({
            queryKey: actingProfileKeys.list(scope),
            queryFn: () => actingProfileService.getAll(scope),
        })),
    });

    const profilesBySystem = useMemo(() => {
        const map = {} as Partial<Record<SystemScope, Profile[]>>;
        ASSIGNABLE_SYSTEM_SCOPES.forEach((scope, index) => {
            map[scope] = profileQueries[index]?.data ?? [];
        });
        return map;
    }, [profileQueries]);

    const actingProfilesBySystem = useMemo(() => {
        const map = {} as Partial<Record<SystemScope, ActingProfile[]>>;
        ASSIGNABLE_SYSTEM_SCOPES.forEach((scope, index) => {
            map[scope] = (actingProfileQueries[index]?.data ?? []).filter(
                (row) => row.status === "ACTIVE" || row.status == null,
            );
        });
        return map;
    }, [actingProfileQueries]);

    const loadingBySystem = useMemo(() => {
        const map = {} as Partial<Record<SystemScope, boolean>>;
        ASSIGNABLE_SYSTEM_SCOPES.forEach((scope, index) => {
            map[scope] = profileQueries[index]?.isLoading ?? false;
        });
        return map;
    }, [profileQueries]);

    const actingLoadingBySystem = useMemo(() => {
        const map = {} as Partial<Record<SystemScope, boolean>>;
        ASSIGNABLE_SYSTEM_SCOPES.forEach((scope, index) => {
            map[scope] = actingProfileQueries[index]?.isLoading ?? false;
        });
        return map;
    }, [actingProfileQueries]);

    useEffect(() => {
        if (!isEditing) {
            setForm(emptyForm());
            setError(null);
            return;
        }

        if (detailQuery.data) {
            setForm({
                collaboratorId: detailQuery.data.collaboratorId,
                username: detailQuery.data.username,
                email: detailQuery.data.email,
                roleIdsByBranch: roleIdsFromProfilesByBranch(detailQuery.data.rolesByBranch),
                actingProfileIdsByBranch: roleIdsFromProfilesByBranch(
                    detailQuery.data.actingProfilesByBranch,
                ),
            });
            setError(null);
        }
    }, [isEditing, detailQuery.data]);

    const appUserBaseline = useMemo((): AppUserCreateDto => {
        if (!isEditing || !detailQuery.data) return emptyForm();
        return {
            collaboratorId: detailQuery.data.collaboratorId,
            username: detailQuery.data.username,
            email: detailQuery.data.email,
            roleIdsByBranch: roleIdsFromProfilesByBranch(detailQuery.data.rolesByBranch),
            actingProfileIdsByBranch: roleIdsFromProfilesByBranch(
                detailQuery.data.actingProfilesByBranch,
            ),
        };
    }, [detailQuery.data, isEditing]);
    useCrudFormDirty(useFormDirtyByComparison(form, appUserBaseline));

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

    const handleSaveSuccess = useCallback(
        async (saved: AppUser, mode: "create" | "update" | "reactivate") => {
            await queryClient.invalidateQueries({queryKey: appUserKeys.all});
            if (mode === "create" && saved.accessToken) {
                await showAccessTokenReveal(saved.accessToken, "create");
            } else if (mode === "reactivate") {
                toast.success("Usuário reativado e atualizado");
            } else {
                toast.success(mode === "update" ? "Usuário atualizado" : "Usuário cadastrado");
            }
            void showSavedRecord(saved.id, saved);
        },
        [queryClient, showSavedRecord],
    );

    const branchIds = useMemo(() => branches.map((branch) => branch.id), [branches]);

    const reactivateMutation = useMutation({
        mutationFn: async (dto: AppUserCreateDto) => appUserService.reactivate(toSavePayload(dto, branchIds)),
        onSuccess: async (saved: AppUser) => {
            await handleSaveSuccess(saved, "reactivate");
        },
        onError: (err: unknown) => {
            const ex = ExceptionCapture.handle(err, {
                fallbackMessage: APP_USER_CLIENT_MESSAGES.APP_USER_REACTIVATE_FAILED,
            });
            setError(ex.displayMessage);
        },
    });

    const offerReactivate = useCallback(
        async (dto: AppUserCreateDto) => {
            const confirmed = await SystemAlert.warning.confirm({
                title: "Usuário já existe",
                message:
                    "Já existe um usuário excluído com estes dados. Deseja reativá-lo e aplicar as informações preenchidas neste cadastro?",
                confirmLabel: "Reativar",
                cancelLabel: "Cancelar",
            });
            if (!confirmed) return;
            reactivateMutation.mutate(dto);
        },
        [reactivateMutation],
    );

    const saveMutation = useMutation({
        mutationFn: async (dto: AppUserCreateDto) => {
            const payload = toSavePayload(dto, branchIds);
            if (isEditing && editingId) return appUserService.update(editingId, payload);
            return appUserService.create(payload);
        },
        onSuccess: async (saved: AppUser) => {
            await handleSaveSuccess(saved, isEditing ? "update" : "create");
        },
        onError: (err: unknown, dto: AppUserCreateDto) => {
            const ex = ExceptionCapture.fromUnknown(err, APP_USER_CLIENT_MESSAGES.APP_USER_SAVE_FAILED);
            if (!isEditing && ex.code === DELETED_USER_CONFLICT_CODE) {
                void offerReactivate(dto);
                return;
            }
            ExceptionCapture.handle(err, {
                fallbackMessage: APP_USER_CLIENT_MESSAGES.APP_USER_SAVE_FAILED,
            });
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

    const saving = saveMutation.isPending || reactivateMutation.isPending;

    if (isEditing && detailQuery.isLoading) {
        return (
            <SkeletonStack count={4} padded />
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
                <CrudFormFooterActions hideNew isSubmitting={saving} submitLabel="Salvar usuário" />
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
            <FormSection
                id="perfis"
                title={branches.length > 1 ? "Perfis por filial e sistema" : "Perfis por sistema"}
                bodyClassName="!p-0 !gap-0"
            >
                <AppUserProfileAssignmentPanel
                    profilesBySystem={profilesBySystem}
                    actingProfilesBySystem={actingProfilesBySystem}
                    selectedIdsByBranch={form.roleIdsByBranch ?? {}}
                    selectedActingIdsByBranch={form.actingProfileIdsByBranch ?? {}}
                    loadingBySystem={loadingBySystem}
                    actingLoadingBySystem={actingLoadingBySystem}
                    onChange={(branchId, scope, ids) =>
                        setForm((prev) => ({
                            ...prev,
                            roleIdsByBranch: {
                                ...prev.roleIdsByBranch,
                                [branchId]: {
                                    ...prev.roleIdsByBranch?.[branchId],
                                    [scope]: ids,
                                },
                            },
                        }))
                    }
                    onActingChange={(branchId, scope, ids) =>
                        setForm((prev) => ({
                            ...prev,
                            actingProfileIdsByBranch: {
                                ...prev.actingProfileIdsByBranch,
                                [branchId]: {
                                    ...prev.actingProfileIdsByBranch?.[branchId],
                                    [scope]: ids,
                                },
                            },
                        }))
                    }
                />
            </FormSection>
            {error ? <p className="px-4 pb-3 text-sm font-medium text-error">{error}</p> : null}
        </CrudFormShell>
    );
}
