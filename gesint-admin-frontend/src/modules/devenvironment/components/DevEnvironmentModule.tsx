"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import type { DevEnvironmentSettings } from "@/modules/devenvironment/dto/devenvironment.dto";
import { devEnvironmentService } from "@/modules/devenvironment/services/devenvironment.service";
import { AdminBadge } from "@/shared/components/ui/admin/AdminBadge";
import { AdminBtn } from "@/shared/components/ui/admin/AdminBtn";
import { AdminInput } from "@/shared/components/ui/admin/AdminField";
import { AdminModuleToolbar } from "@/shared/components/ui/admin/AdminModuleToolbar";
import { AdminFormGrid, AdminSection } from "@/shared/components/ui/admin/AdminSection";
import { ExceptionCapture } from "@/shared/exceptions/exception-capture";

type FormState = {
    fullName: string;
    email: string;
    newPassword: string;
    confirmPassword: string;
};

function toForm(data: DevEnvironmentSettings): FormState {
    return {
        fullName: data.fullName ?? "",
        email: data.email ?? "",
        newPassword: "",
        confirmPassword: "",
    };
}

export function DevEnvironmentModule() {
    const [settings, setSettings] = useState<DevEnvironmentSettings | null>(null);
    const [form, setForm] = useState<FormState | null>(null);
    const [saving, setSaving] = useState(false);
    const [unavailable, setUnavailable] = useState(false);

    useEffect(() => {
        let cancelled = false;
        devEnvironmentService
            .get()
            .then((data) => {
                if (cancelled) return;
                setSettings(data);
                setForm(toForm(data));
            })
            .catch((err) => {
                if (cancelled) return;
                setUnavailable(true);
                ExceptionCapture.handle(err, {
                    fallbackMessage: "Ambiente de desenvolvimento indisponivel neste perfil.",
                });
            });
        return () => {
            cancelled = true;
        };
    }, []);

    const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
        setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
    };

    const handleSave = async () => {
        if (!form || !settings) return;
        if (form.newPassword && form.newPassword !== form.confirmPassword) {
            toast.error("A confirmacao da senha nao confere.");
            return;
        }
        if (form.newPassword && form.newPassword.length < 8) {
            toast.error("A nova senha deve ter ao menos 8 caracteres.");
            return;
        }
        setSaving(true);
        try {
            const updated = await devEnvironmentService.updatePlatformUser({
                fullName: form.fullName.trim(),
                email: form.email.trim(),
                newPassword: form.newPassword.trim() || undefined,
            });
            setSettings(updated);
            setForm(toForm(updated));
            toast.success("Usuario de desenvolvimento atualizado.");
        } catch (err) {
            ExceptionCapture.handle(err, { fallbackMessage: "Falha ao salvar usuario de desenvolvimento." });
        } finally {
            setSaving(false);
        }
    };

    if (unavailable) {
        return (
            <div className="p-6 text-sm text-base-content/70">
                Ambiente de desenvolvimento nao esta habilitado neste perfil (somente DEV).
            </div>
        );
    }

    if (!form || !settings) {
        return <div className="p-6 text-sm text-base-content/70">Carregando…</div>;
    }

    return (
        <div className="flex min-h-0 flex-1 flex-col">
            <AdminModuleToolbar
                title="Ambiente de desenvolvimento"
                subtitle="Edicao exclusiva do usuario admGesint (schema public). Indisponivel em producao."
                actions={
                    <AdminBtn variant="primary" onClick={handleSave} disabled={saving}>
                        {saving ? "Salvando…" : "Salvar"}
                    </AdminBtn>
                }
            />
            <div className="flex-1 overflow-auto p-4 sm:p-6">
                <AdminSection title="Usuario da plataforma (DEV)">
                    <div className="mb-4 flex flex-wrap items-center gap-2 text-sm text-base-content/70">
                        <span>
                            Username fixo: <strong>{settings.username}</strong>
                        </span>
                        <AdminBadge
                            status={settings.publicAppUserMirrored ? "Ativo" : "Inativo"}
                        />
                        <span>
                            {settings.publicAppUserMirrored
                                ? "Espelhado em public.app_user"
                                : "Sem espelho em public.app_user"}
                        </span>
                    </div>
                    <AdminFormGrid>
                        <AdminInput
                            label="Nome completo"
                            value={form.fullName}
                            onChange={(e) => update("fullName", e.target.value)}
                        />
                        <AdminInput
                            label="E-mail"
                            type="email"
                            value={form.email}
                            onChange={(e) => update("email", e.target.value)}
                        />
                        <AdminInput
                            label="Nova senha (opcional)"
                            type="password"
                            value={form.newPassword}
                            onChange={(e) => update("newPassword", e.target.value)}
                            autoComplete="new-password"
                        />
                        <AdminInput
                            label="Confirmar nova senha"
                            type="password"
                            value={form.confirmPassword}
                            onChange={(e) => update("confirmPassword", e.target.value)}
                            autoComplete="new-password"
                        />
                    </AdminFormGrid>
                </AdminSection>
            </div>
        </div>
    );
}
