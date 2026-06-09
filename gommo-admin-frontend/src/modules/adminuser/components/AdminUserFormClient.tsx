"use client";

import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {useEffect, useState, type SubmitEvent} from "react";
import {toast} from "sonner";
import {ADMIN_USER_CLIENT_MESSAGES} from "@/modules/adminuser/exceptions/adminuser.messages";
import type {AdminUserCreateDto} from "@/modules/adminuser/dto/adminuser.dto";
import {
    ADMIN_USER_PASSWORD_MIN_LENGTH,
    adminUserToFormDto,
    emptyAdminUserForm,
    toAdminUserSavePayload,
    validateAdminUserForm,
} from "@/modules/adminuser/lib/adminuser.mapper";
import {adminUserKeys} from "@/modules/adminuser/adminuser.query";
import {adminUserService} from "@/modules/adminuser/services/adminuser.service";
import {useCrudScreen} from "@/shared/components/crud/CrudScreen";
import {CrudFormShell} from "@/shared/components/crud/CrudFormShell";
import {EntityCodeField} from "@/shared/components/crud/EntityCodeField";
import {useSyncWorkspaceTabTitle} from "@/shared/workspace/useSyncWorkspaceTabTitle";
import {ExceptionCapture} from "@/shared/exceptions";
import {Button} from "@/shared/components/ui/Button";
import {InputPassword, InputString} from "@/shared/components/ui/input/index";

export function AdminUserFormClient() {
    const {editingId, isEditing, goToList} = useCrudScreen();
    const queryClient = useQueryClient();
    const [form, setForm] = useState<AdminUserCreateDto>(emptyAdminUserForm());
    const [error, setError] = useState<string | null>(null);
    const [passwordError, setPasswordError] = useState<string | null>(null);

    const detailQuery = useQuery({
        queryKey: adminUserKeys.detail(editingId ?? ""),
        queryFn: () => adminUserService.getById(editingId!),
        enabled: isEditing && Boolean(editingId),
    });

    useSyncWorkspaceTabTitle(detailQuery.data ?? null);

    useEffect(() => {
        if (!isEditing) {
            setForm(emptyAdminUserForm());
            setPasswordError(null);
        }
    }, [isEditing]);

    useEffect(() => {
        if (isEditing && detailQuery.data) {
            setForm(adminUserToFormDto(detailQuery.data));
        }
    }, [isEditing, detailQuery.data]);

    const saveMutation = useMutation({
        mutationFn: async (dto: AdminUserCreateDto) => {
            if (isEditing && editingId) return adminUserService.update(editingId, dto);
            return adminUserService.create(dto);
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({queryKey: adminUserKeys.all});
            toast.success(isEditing ? "Usuário atualizado" : "Usuário cadastrado");
            goToList();
        },
        onError: (err: unknown) => {
            setError(ExceptionCapture.handle(err, {fallbackMessage: ADMIN_USER_CLIENT_MESSAGES.SAVE_FAILED}).displayMessage);
        },
    });

    const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setPasswordError(null);

        const validationError = validateAdminUserForm(form, isEditing);
        if (validationError) {
            if (validationError.includes("senha")) {
                setPasswordError(validationError);
            } else {
                setError(validationError);
            }
            return;
        }

        saveMutation.mutate(toAdminUserSavePayload(form, isEditing));
    };

    return (
        <CrudFormShell
            title={isEditing ? "Editar usuário admin" : "Novo usuário admin"}
            error={error}
            onSubmit={handleSubmit}
            footer={
                <>
                    <Button type="button" variant="ghost" onClick={goToList}>
                        Cancelar
                    </Button>
                    <Button type="submit" loading={saveMutation.isPending}>
                        Salvar
                    </Button>
                </>
            }
        >
            <div className="grid gap-4">
                <EntityCodeField code={isEditing ? detailQuery.data?.code : undefined} />
                <InputString
                    label="Nome completo"
                    value={form.fullName}
                    onValueChange={(v) => setForm((p) => ({...p, fullName: v}))}
                    required
                />
                <InputString
                    label="Usuário"
                    value={form.username}
                    onValueChange={(v) => setForm((p) => ({...p, username: v}))}
                    required
                />
                <InputString
                    label="E-mail"
                    value={form.email}
                    onValueChange={(v) => setForm((p) => ({...p, email: v}))}
                    required
                />
                <InputPassword
                    label={isEditing ? "Nova senha (opcional)" : "Senha"}
                    value={form.password ?? ""}
                    onValueChange={(v) => {
                        setPasswordError(null);
                        setForm((p) => ({...p, password: v}));
                    }}
                    required={!isEditing}
                    hint={`Mínimo de ${ADMIN_USER_PASSWORD_MIN_LENGTH} caracteres`}
                    error={passwordError ?? undefined}
                />
            </div>
        </CrudFormShell>
    );
}
