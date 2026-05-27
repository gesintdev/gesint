"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { CLIENT_USER_CLIENT_MESSAGES } from "@/modules/clientuser/exceptions/clientuser.messages";
import type { ClientUserCreateDto } from "@/modules/clientuser/dto/clientuser.dto";
import { emptyClientUserForm, clientUserToFormDto } from "@/modules/clientuser/lib/clientuser.mapper";
import { clientUserKeys } from "@/modules/clientuser/clientuser.query";
import { clientUserService } from "@/modules/clientuser/services/clientuser.service";
import { clientKeys } from "@/modules/client/client.query";
import { clientService } from "@/modules/client/services/client.service";
import { useCrudScreen } from "@/shared/components/crud/CrudScreen";
import { CrudFormShell } from "@/shared/components/crud/CrudFormShell";
import { useSyncWorkspaceTabTitle } from "@/shared/workspace/useSyncWorkspaceTabTitle";
import { ExceptionCapture } from "@/shared/exceptions";
import { Button } from "@/shared/components/ui/Button";
import { InputString, InputSelect } from "@/shared/components/ui/input/index";

export function ClientUserFormClient() {
    const { editingId, isEditing, goToList } = useCrudScreen();
    const queryClient = useQueryClient();
    const [form, setForm] = useState<ClientUserCreateDto>(emptyClientUserForm());
    const [error, setError] = useState<string | null>(null);

    const clientsQuery = useQuery({
        queryKey: clientKeys.all,
        queryFn: () => clientService.getAll(),
    });

    const detailQuery = useQuery({
        queryKey: clientUserKeys.detail(editingId ?? ""),
        queryFn: () => clientUserService.getById(editingId!),
        enabled: isEditing && Boolean(editingId),
    });

    useSyncWorkspaceTabTitle(detailQuery.data ?? null);

    useEffect(() => {
        if (!isEditing) {
            setForm(emptyClientUserForm());
            return;
        }
        if (detailQuery.data) setForm(clientUserToFormDto(detailQuery.data));
    }, [isEditing, detailQuery.data]);

    const saveMutation = useMutation({
        mutationFn: async (dto: ClientUserCreateDto) => {
            if (isEditing && editingId) return clientUserService.update(editingId, dto);
            return clientUserService.create(dto);
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: clientUserKeys.all });
            toast.success(isEditing ? "Usuário atualizado" : "Usuário cadastrado");
            goToList();
        },
        onError: (err: unknown) => {
            setError(ExceptionCapture.handle(err, { fallbackMessage: CLIENT_USER_CLIENT_MESSAGES.SAVE_FAILED }).displayMessage);
        },
    });

    const clientOptions = (clientsQuery.data ?? []).map((c) => ({ value: c.id, label: c.name }));

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        saveMutation.mutate(form);
    };

    return (
        <CrudFormShell
            title={isEditing ? "Editar usuário do cliente" : "Novo usuário do cliente"}
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
                <InputSelect label="Cliente" value={form.clientId} onValueChange={(v) => setForm((p) => ({ ...p, clientId: v }))} items={clientOptions} required />
                <InputString label="Nome de exibição" value={form.displayName ?? ""} onValueChange={(v) => setForm((p) => ({ ...p, displayName: v }))} />
                <InputString label="Usuário" value={form.username} onValueChange={(v) => setForm((p) => ({ ...p, username: v }))} required />
                <InputString label="E-mail" value={form.email} onValueChange={(v) => setForm((p) => ({ ...p, email: v }))} required />
                <label className="gommo-field flex flex-col gap-1">
                    <span className="text-xs font-medium text-base-content/70">{isEditing ? "Nova senha (opcional)" : "Senha"}</span>
                    <input
                        type="password"
                        className="input input-bordered w-full focus:outline-none"
                        value={form.password}
                        onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                        required={!isEditing}
                    />
                </label>
            </div>
        </CrudFormShell>
    );
}
