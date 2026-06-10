"use client";
import { useCallback, useEffect, useState, type SubmitEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { collaboratorService } from "@/modules/person/collaborators/people/services/collaborator.service";
import { appUserKeys } from "@/modules/settings/appuser/appuser.query";
import { ProfileRolePicker } from "@/modules/settings/appuser/components/ProfileRolePicker";
import type { AppUserCreateDto } from "@/modules/settings/appuser/dto/appuser.dto";
import {
    suggestEmailFromCollaborator,
    suggestUsernameFromCollaborator,
} from "@/modules/settings/appuser/lib/collaborator-credentials";
import { appUserService } from "@/modules/settings/appuser/services/appuser.service";
import { profileKeys } from "@/modules/settings/profile/profile.query";
import { profileService } from "@/modules/settings/profile/services/profile.service";
import { CollaboratorPickerField } from "@/shared/components/crud/CollaboratorPickerField";
import { CrudFormShell } from "@/shared/components/crud/CrudFormShell";
import { useCrudScreen } from "@/shared/components/crud/CrudScreen";
import { Button } from "@/shared/components/ui/Button";
import { FormSection } from "@/shared/components/ui/FormSection";
import { type FormStepNavItem } from "@/shared/components/ui/FormStepper";
import { InputBase, InputString } from "@/shared/components/ui/input/index";
import { ExceptionCapture } from "@/shared/exceptions";

const emptyForm = (): AppUserCreateDto => ({
    collaboratorId: "",
    username: "",
    email: "",
    password: "",
    dpRoleIds: [],
    rhRoleIds: [],
});
const FORM_STEPS: FormStepNavItem[] = [
    { id: "colaborador", label: "Colaborador" },
    { id: "credenciais", label: "Credenciais" },
    { id: "perfis", label: "Perfis" },
];

export function AppUserFormClient() {
    const { editingId, isEditing, goToList } = useCrudScreen();
    const queryClient = useQueryClient();
    const [form, setForm] = useState<AppUserCreateDto>(emptyForm());
    const [error, setError] = useState<string | null>(null);
    const detailQuery = useQuery({
        queryKey: appUserKeys.detail(editingId ?? ""),
        queryFn: () => appUserService.getById(editingId!),
        enabled: isEditing && Boolean(editingId),
    });
    const dpProfilesQuery = useQuery({
        queryKey: profileKeys.list("DP"),
        queryFn: () => profileService.getAll("DP"),
    });
    const rhProfilesQuery = useQuery({
        queryKey: profileKeys.list("RH"),
        queryFn: () => profileService.getAll("RH"),
    });

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
                password: "",
                dpRoleIds: detailQuery.data.dpRoles?.map((profile) => profile.id) ?? [],
                rhRoleIds: detailQuery.data.rhRoles?.map((profile) => profile.id) ?? [],
            });
            setError(null);
        }
    }, [isEditing, detailQuery.data]);

    const handleCollaboratorChange = useCallback(async (collaboratorId: string) => {
        if (!collaboratorId) {
            setForm((prev) => ({ ...prev, collaboratorId: "" }));
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
            setForm((prev) => ({ ...prev, collaboratorId }));
        }
    }, []);
    const saveMutation = useMutation({
        mutationFn: async (dto: AppUserCreateDto) => {
            const payload: AppUserCreateDto = {
                ...dto,
                dpRoleIds: dto.dpRoleIds ?? [],
                rhRoleIds: dto.rhRoleIds ?? [],
                password: dto.password || undefined,
            };
            if (isEditing && editingId) return appUserService.update(editingId, payload);
            return appUserService.create(payload);
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: appUserKeys.all });
            toast.success(isEditing ? "Usuário atualizado" : "Usuário cadastrado");
            goToList();
        },
        onError: (err: unknown) => {
            const ex = ExceptionCapture.handle(err, { fallbackMessage: "Não foi possível salvar o usuário." });
            setError(ex.displayMessage);
        },
    });
    const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        saveMutation.mutate(form);
    };

    if (isEditing && detailQuery.isLoading) {
        return (
            <div className="grid gap-2 p-5">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="skeleton-shimmer h-10 w-full" />
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
            <FormSection id="colaborador" title="Colaborador">
                <CollaboratorPickerField
                    value={form.collaboratorId}
                    onValueChange={handleCollaboratorChange}
                    required
                    wrapperClassName="sm:col-span-2"
                />
            </FormSection>
            <FormSection id="credenciais" title="Credenciais">
                <div className="grid w-full grid-cols-1 gap-4 sm:col-span-2 sm:grid-cols-2">
                    <InputString
                        label="Nome de usuário"
                        value={form.username}
                        onValueChange={(value) => setForm((prev) => ({ ...prev, username: value }))}
                        required
                        wrapperClassName="min-w-0"
                    />
                    <InputString
                        label="E-mail"
                        value={form.email}
                        onValueChange={(value) => setForm((prev) => ({ ...prev, email: value }))}
                        required
                        wrapperClassName="min-w-0"
                    />
                    <InputBase
                        label={isEditing ? "Nova senha (opcional)" : "Senha inicial"}
                        hint={isEditing ? "Deixe em branco para manter a senha atual." : undefined}
                        type="password"
                        displayValue={form.password ?? ""}
                        onDisplayChange={(value) => setForm((prev) => ({ ...prev, password: value }))}
                        required={!isEditing}
                        autoComplete="new-password"
                        wrapperClassName="min-w-0 sm:col-span-2"
                    />
                </div>
            </FormSection>
            <FormSection id="perfis" title="Perfis por sistema">
                <div className="grid w-full grid-cols-1 gap-4 sm:col-span-2 sm:grid-cols-2">
                    <ProfileRolePicker
                        label="Perfis DP"
                        system="DP"
                        profiles={dpProfilesQuery.data ?? []}
                        selectedIds={form.dpRoleIds ?? []}
                        onChange={(dpRoleIds) => setForm((prev) => ({ ...prev, dpRoleIds }))}
                        loading={dpProfilesQuery.isLoading}
                    />
                    <ProfileRolePicker
                        label="Perfis RH"
                        system="RH"
                        profiles={rhProfilesQuery.data ?? []}
                        selectedIds={form.rhRoleIds ?? []}
                        onChange={(rhRoleIds) => setForm((prev) => ({ ...prev, rhRoleIds }))}
                        loading={rhProfilesQuery.isLoading}
                    />
                </div>
            </FormSection>
            {error ? <p className="text-sm font-medium text-error">{error}</p> : null}
        </CrudFormShell>
    );
}
