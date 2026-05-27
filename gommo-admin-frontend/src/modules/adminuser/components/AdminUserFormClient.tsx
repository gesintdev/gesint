"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { ADMIN_USER_CLIENT_MESSAGES } from "@/modules/adminuser/exceptions/adminuser.messages";
import type { AdminUserCreateDto } from "@/modules/adminuser/dto/adminuser.dto";
import { emptyAdminUserForm, adminUserToFormDto } from "@/modules/adminuser/lib/adminuser.mapper";
import { adminUserKeys } from "@/modules/adminuser/adminuser.query";
import { adminUserService } from "@/modules/adminuser/services/adminuser.service";
import { useCrudScreen } from "@/shared/components/crud/CrudScreen";
import { CrudFormShell } from "@/shared/components/crud/CrudFormShell";
import { useSyncWorkspaceTabTitle } from "@/shared/workspace/useSyncWorkspaceTabTitle";
import { ExceptionCapture } from "@/shared/exceptions";
import { Button } from "@/shared/components/ui/Button";
import { InputString } from "@/shared/components/ui/input/index";

export function AdminUserFormClient() {
    const { editingId, isEditing, goToList } = useCrudScreen();
    const queryClient = useQueryClient();
    const [form, setForm] = useState<AdminUserCreateDto>(emptyAdminUserForm());
    const [error, setError] = useState<string | null>(null);

    const detailQuery = useQuery({
        queryKey: adminUserKeys.detail(editingId ?? ""),
        queryFn: () => adminUserService.getById(editingId!),
        enabled: isEditing && Boolean(editingId),
    });

    useSyncWorkspaceTabTitle(detailQuery.data ?? null);

    useEffect(() => {
        if (!isEditing) {
            setForm(emptyAdminUserForm());
            return;
        }
        if (detailQuery.data) setForm(adminUserToFormDto(detailQuery.data));
    }, [isEditing, detailQuery.data]);

    const saveMutation = useMutation({
        mutationFn: async (dto: AdminUserCreateDto) => {
            if (isEditing && editingId) return adminUserService.update(editingId, dto);
            return adminUserService.create(dto);
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: adminUserKeys.all });
            toast.success(isEditing ? "Usuário atualizado" : "Usuário cadastrado");
            goToList();
        },
        onError: (err: unknown) => {
            setError(ExceptionCapture.handle(err, { fallbackMessage: ADMIN_USER_CLIENT_MESSAGES.SAVE_FAILED }).displayMessage);
        },
    });

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        saveMutation.mutate(form);
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
                <InputString label="Nome completo" value={form.fullName} onValueChange={(v) => setForm((p) => ({ ...p, fullName: v }))} required />
                <InputString label="Usuário" value={form.username} onValueChange={(v) => setForm((p) => ({ ...p, username: v }))} required />
                <InputString label="E-mail" value={form.email} onValueChange={(v) => setForm((p) => ({ ...p, email: v }))} required />
                <label className="gommo-field flex flex-col gap-1">
                    <span className="text-xs font-medium text-base-content/70">{isEditing ? "Nova senha (opcional)" : "Senha"}</span>
                    <input
                        type="password"
                        className="input input-bordered w-full focus:outline-none"
                        value={form.password ?? ""}
                        onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                        required={!isEditing}
                    />
                </label>
            </div>
        </CrudFormShell>
    );
}
