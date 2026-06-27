"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type SubmitEvent, useEffect, useState } from "react";
import { toast } from "sonner";

import { clientKeys } from "@/modules/client/client.query";
import { clientService } from "@/modules/client/services/client.service";
import { clientUserKeys } from "@/modules/clientuser/clientuser.query";
import type { ClientUserCreateDto } from "@/modules/clientuser/dto/clientuser.dto";
import { CLIENT_USER_CLIENT_MESSAGES } from "@/modules/clientuser/exceptions/clientuser.messages";
import {
    CLIENT_USER_PASSWORD_MIN_LENGTH,
    clientUserToFormDto,
    emptyClientUserForm,
    toClientUserSavePayload,
    validateClientUserForm,
} from "@/modules/clientuser/lib/clientuser.mapper";
import { clientUserService } from "@/modules/clientuser/services/clientuser.service";
import { CrudFormShell } from "@/shared/components/crud/CrudFormShell";
import { useCrudScreen } from "@/shared/components/crud/CrudScreen";
import { EntityCodeField } from "@/shared/components/crud/EntityCodeField";
import { Button } from "@/shared/components/ui/Button";
import { InputPassword, InputSelect, InputString } from "@/shared/components/ui/input/index";
import { ExceptionCapture } from "@/shared/exceptions";
import { useSyncWorkspaceTabTitle } from "@/shared/workspace/useSyncWorkspaceTabTitle";

export function ClientUserFormClient() {
    const { editingId, isEditing, goToList } = useCrudScreen();
    const queryClient = useQueryClient();
    const [form, setForm] = useState<ClientUserCreateDto>(emptyClientUserForm());
    const [error, setError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
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
            setFieldErrors({});
        }
    }, [isEditing]);

    useEffect(() => {
        if (isEditing && detailQuery.data) {
            setForm(clientUserToFormDto(detailQuery.data));
        }
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
            setError(
                ExceptionCapture.handle(err, { fallbackMessage: CLIENT_USER_CLIENT_MESSAGES.SAVE_FAILED })
                    .displayMessage,
            );
        },
    });
    const clientOptions = (clientsQuery.data ?? []).map((c) => ({ value: c.id, label: c.name }));
    const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        const errors = validateClientUserForm(form, isEditing);
        setFieldErrors(errors);
        if (Object.keys(errors).length > 0) {
            const first = Object.values(errors)[0];
            if (first) toast.error(first);
            return;
        }
        saveMutation.mutate(toClientUserSavePayload(form, isEditing));
    };
    const clearFieldError = (field: string) => {
        setFieldErrors((current) => {
            if (!current[field]) return current;
            const next = { ...current };
            delete next[field];
            return next;
        });
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
                <EntityCodeField code={isEditing ? detailQuery.data?.code : undefined} />
                <InputSelect
                    label="Cliente"
                    value={form.clientId}
                    onValueChange={(v) => {
                        clearFieldError("clientId");
                        setForm((p) => ({ ...p, clientId: v }));
                    }}
                    items={clientOptions}
                    required
                    error={fieldErrors.clientId}
                />
                <InputString
                    label="Nome de exibição"
                    value={form.displayName ?? ""}
                    onValueChange={(v) => setForm((p) => ({ ...p, displayName: v }))}
                />
                <InputString
                    label="Usuário"
                    value={form.username}
                    onValueChange={(v) => {
                        clearFieldError("username");
                        setForm((p) => ({ ...p, username: v }));
                    }}
                    required
                    error={fieldErrors.username}
                />
                <InputString
                    label="E-mail"
                    value={form.email}
                    onValueChange={(v) => {
                        clearFieldError("email");
                        setForm((p) => ({ ...p, email: v }));
                    }}
                    required
                    error={fieldErrors.email}
                />
                <InputPassword
                    label={isEditing ? "Nova senha (opcional)" : "Senha"}
                    value={form.password ?? ""}
                    onValueChange={(v) => {
                        clearFieldError("password");
                        setForm((p) => ({ ...p, password: v }));
                    }}
                    required={!isEditing}
                    hint={`Mínimo de ${CLIENT_USER_PASSWORD_MIN_LENGTH} caracteres`}
                    error={fieldErrors.password}
                />
            </div>
        </CrudFormShell>
    );
}
