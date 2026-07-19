"use client";

import { Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import type { AdminUser, AdminUserCreateDto } from "@/modules/adminuser/dto/adminuser.dto";
import {
    adminUserToFormDto,
    emptyAdminUserForm,
    toAdminUserSavePayload,
    validateAdminUserForm,
} from "@/modules/adminuser/lib/adminuser.mapper";
import { adminUserService } from "@/modules/adminuser/services/adminuser.service";
import { AdminBadge } from "@/shared/components/ui/admin/AdminBadge";
import { AdminBtn } from "@/shared/components/ui/admin/AdminBtn";
import { AdminInput } from "@/shared/components/ui/admin/AdminField";
import { AdminFormGrid, AdminSection } from "@/shared/components/ui/admin/AdminSection";
import { ExceptionCapture } from "@/shared/exceptions/exception-capture";

function statusLabel(status?: string): string {
    switch (status) {
        case "ACTIVE":
            return "Ativo";
        case "INACTIVE":
            return "Inativo";
        case "DELETED":
            return "Excluído";
        default:
            return status ?? "—";
    }
}

export function AdminUserCadastro({
    user,
    isNew = false,
    onSaved,
    onDeleted,
}: {
    user: AdminUser | null;
    isNew?: boolean;
    onSaved: (user: AdminUser) => void | Promise<void>;
    onDeleted?: () => void | Promise<void>;
}) {
    const [form, setForm] = useState<AdminUserCreateDto>(emptyAdminUserForm());
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        setForm(user ? adminUserToFormDto(user) : emptyAdminUserForm());
    }, [user]);

    const update = <K extends keyof AdminUserCreateDto>(key: K, value: AdminUserCreateDto[K]) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const save = async () => {
        const validationError = validateAdminUserForm(form, !isNew && Boolean(user));
        if (validationError) {
            toast.error(validationError);
            return;
        }

        setSaving(true);
        try {
            const payload = toAdminUserSavePayload(form, !isNew && Boolean(user));
            const saved =
                isNew || !user
                    ? await adminUserService.create(payload)
                    : await adminUserService.update(user.id, payload);
            toast.success(isNew || !user ? "Usuário cadastrado." : "Usuário atualizado.");
            await onSaved(saved);
        } catch (err) {
            ExceptionCapture.handle(err, { fallbackMessage: "Falha ao salvar usuário." });
        } finally {
            setSaving(false);
        }
    };

    const remove = async () => {
        if (!user || isNew) return;
        if (!window.confirm(`Excluir o usuário "${user.fullName}"? Esta ação faz soft delete.`)) {
            return;
        }
        setDeleting(true);
        try {
            await adminUserService.remove(user.id);
            toast.success("Usuário excluído.");
            await onDeleted?.();
        } catch (err) {
            ExceptionCapture.handle(err, { fallbackMessage: "Falha ao excluir usuário." });
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div style={{ maxWidth: 720 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <div style={{ fontWeight: 600, fontSize: 14, color: "var(--ga-text)" }}>
                    {isNew ? "Novo usuário" : (user?.fullName ?? "Usuário")}
                </div>
                {!isNew && user ? <AdminBadge status={statusLabel(user.status)} /> : null}
                {!isNew && user?.code != null ? (
                    <span style={{ fontSize: 11, color: "var(--ga-text-muted)" }}>Código {user.code}</span>
                ) : null}
            </div>

            <AdminSection title="Identificação">
                <AdminFormGrid cols={2}>
                    <div style={{ gridColumn: "span 2" }}>
                        <AdminInput
                            label="Nome completo"
                            value={form.fullName}
                            onChange={(v) => update("fullName", v)}
                            required
                        />
                    </div>
                    <AdminInput
                        label="Usuário"
                        value={form.username}
                        onChange={(v) => update("username", v)}
                        required
                    />
                    <AdminInput
                        label="E-mail"
                        value={form.email}
                        onChange={(v) => update("email", v)}
                        type="email"
                        required
                    />
                </AdminFormGrid>
            </AdminSection>

            <AdminSection title="Senha">
                <AdminFormGrid cols={2}>
                    <div style={{ gridColumn: "span 2" }}>
                        <AdminInput
                            label={isNew ? "Senha" : "Nova senha (opcional)"}
                            value={form.password ?? ""}
                            onChange={(v) => update("password", v)}
                            type="password"
                            required={isNew}
                            placeholder={isNew ? "Mínimo 8 caracteres" : "Deixe em branco para manter"}
                        />
                    </div>
                </AdminFormGrid>
            </AdminSection>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <AdminBtn onClick={() => void save()} disabled={saving || deleting}>
                    {saving ? "Salvando..." : "Salvar Alterações"}
                </AdminBtn>
                {!isNew && user ? (
                    <AdminBtn
                        variant="danger"
                        icon={<Trash2 size={12} />}
                        onClick={() => void remove()}
                        disabled={saving || deleting}
                    >
                        {deleting ? "Excluindo..." : "Excluir"}
                    </AdminBtn>
                ) : null}
            </div>
        </div>
    );
}
