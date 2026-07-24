"use client";

import { KeyRound, Trash2 } from "lucide-react";
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
import { showAccessTokenReveal } from "@/shared/access-token-reveal";
import { AdminBadge } from "@/shared/components/ui/admin/AdminBadge";
import { AdminBtn } from "@/shared/components/ui/admin/AdminBtn";
import { AdminInput } from "@/shared/components/ui/admin/AdminField";
import { AdminFormGrid, AdminSection } from "@/shared/components/ui/admin/AdminSection";
import { ExceptionCapture } from "@/shared/exceptions/exception-capture";
import { SystemAlert } from "@/shared/system-alert";

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
    const [resetting, setResetting] = useState(false);

    useEffect(() => {
        setForm(user ? adminUserToFormDto(user) : emptyAdminUserForm());
    }, [user]);

    const update = <K extends keyof AdminUserCreateDto>(key: K, value: AdminUserCreateDto[K]) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const save = async () => {
        const validationError = validateAdminUserForm(form);
        if (validationError) {
            toast.error(validationError);
            return;
        }

        setSaving(true);
        try {
            const payload = toAdminUserSavePayload(form);
            const saved =
                isNew || !user
                    ? await adminUserService.create(payload)
                    : await adminUserService.update(user.id, payload);
            if ((isNew || !user) && saved.accessToken) {
                await showAccessTokenReveal(saved.accessToken, "create");
            } else {
                toast.success(isNew || !user ? "Usuário cadastrado." : "Usuário atualizado.");
            }
            await onSaved(saved);
        } catch (err) {
            ExceptionCapture.handle(err, { fallbackMessage: "Falha ao salvar usuário." });
        } finally {
            setSaving(false);
        }
    };

    const resetAccess = async () => {
        if (!user || isNew) {
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

        setResetting(true);
        try {
            const saved = await adminUserService.resetAccess(user.id);
            if (saved.accessToken) {
                await showAccessTokenReveal(saved.accessToken, "reset");
            } else {
                toast.success("Novo token gerado.");
            }
            await onSaved(saved);
        } catch (err) {
            ExceptionCapture.handle(err, { fallbackMessage: "Falha ao gerar novo token." });
        } finally {
            setResetting(false);
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
        <div style={{ width: "100%" }}>
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

            <AdminSection title="Acesso">
                <AdminFormGrid cols={1}>
                    <AdminBtn
                        variant="secondary"
                        icon={<KeyRound size={12} />}
                        onClick={() => void resetAccess()}
                        disabled={isNew || !user || saving || deleting || resetting}
                    >
                        {resetting ? "Gerando..." : "Gerar novo token"}
                    </AdminBtn>
                    {isNew ? (
                        <div style={{ fontSize: 11, color: "var(--ga-text-muted)" }}>
                            Um token de acesso será gerado ao salvar o usuário.
                        </div>
                    ) : null}
                </AdminFormGrid>
            </AdminSection>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <AdminBtn onClick={() => void save()} disabled={saving || deleting || resetting}>
                    {saving ? "Salvando..." : "Salvar Alterações"}
                </AdminBtn>
                {!isNew && user ? (
                    <AdminBtn
                        variant="danger"
                        icon={<Trash2 size={12} />}
                        onClick={() => void remove()}
                        disabled={saving || deleting || resetting}
                    >
                        {deleting ? "Excluindo..." : "Excluir"}
                    </AdminBtn>
                ) : null}
            </div>
        </div>
    );
}
