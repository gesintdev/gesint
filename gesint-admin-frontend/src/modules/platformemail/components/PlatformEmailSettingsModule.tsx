"use client";

import { CheckCircle, Send, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import type {
    PlatformEmailSecurity,
    PlatformEmailSettings,
    PlatformEmailSettingsUpsertDto,
} from "@/modules/platformemail/dto/platformemail.dto";
import { platformEmailService } from "@/modules/platformemail/services/platformemail.service";
import { AdminBadge } from "@/shared/components/ui/admin/AdminBadge";
import { AdminBtn } from "@/shared/components/ui/admin/AdminBtn";
import { AdminInput, AdminSelect } from "@/shared/components/ui/admin/AdminField";
import { AdminModuleToolbar } from "@/shared/components/ui/admin/AdminModuleToolbar";
import { AdminFormGrid, AdminSection } from "@/shared/components/ui/admin/AdminSection";
import { ExceptionCapture } from "@/shared/exceptions/exception-capture";

type FormState = {
    enabled: boolean;
    host: string;
    port: string;
    security: PlatformEmailSecurity;
    username: string;
    password: string;
    clearPassword: boolean;
    fromAddress: string;
    fromName: string;
    replyTo: string;
};

const SECURITY_OPTIONS: { value: PlatformEmailSecurity; label: string }[] = [
    { value: "STARTTLS", label: "STARTTLS (porta 587)" },
    { value: "SSL", label: "SSL/TLS (porta 465)" },
    { value: "NONE", label: "Sem criptografia" },
];

const DEFAULT_PORT: Record<PlatformEmailSecurity, string> = { STARTTLS: "587", SSL: "465", NONE: "25" };

function toForm(settings: PlatformEmailSettings): FormState {
    return {
        enabled: settings.enabled,
        host: settings.host ?? "",
        port: settings.port != null ? String(settings.port) : "",
        security: settings.security ?? "STARTTLS",
        username: settings.username ?? "",
        password: "",
        clearPassword: false,
        fromAddress: settings.fromAddress ?? "",
        fromName: settings.fromName ?? "",
        replyTo: settings.replyTo ?? "",
    };
}

function toPayload(form: FormState): PlatformEmailSettingsUpsertDto {
    const port = Number(form.port.trim());
    return {
        enabled: form.enabled,
        host: form.host.trim() || undefined,
        port: Number.isInteger(port) && port > 0 ? port : undefined,
        security: form.security,
        username: form.username.trim() || undefined,
        password: form.password.trim() || undefined,
        clearPassword: form.clearPassword,
        fromAddress: form.fromAddress.trim() || undefined,
        fromName: form.fromName.trim() || undefined,
        replyTo: form.replyTo.trim() || undefined,
    };
}

function formatDateTime(value?: string | null) {
    if (!value) return "";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "" : date.toLocaleString("pt-BR");
}

export function PlatformEmailSettingsModule() {
    const [settings, setSettings] = useState<PlatformEmailSettings | null>(null);
    const [form, setForm] = useState<FormState | null>(null);
    const [saving, setSaving] = useState(false);
    const [testing, setTesting] = useState(false);
    const [testTo, setTestTo] = useState("");

    useEffect(() => {
        let cancelled = false;
        platformEmailService
            .get()
            .then((data) => {
                if (cancelled) return;
                setSettings(data);
                setForm(toForm(data));
            })
            .catch((err) => ExceptionCapture.handle(err, { fallbackMessage: "Falha ao carregar configuração de e-mail." }));
        return () => {
            cancelled = true;
        };
    }, []);

    const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
        setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
    };

    const applySaved = (data: PlatformEmailSettings) => {
        setSettings(data);
        setForm(toForm(data));
    };

    const save = async () => {
        if (!form) return;
        setSaving(true);
        try {
            applySaved(await platformEmailService.save(toPayload(form)));
            toast.success("Configuração de e-mail salva.");
        } catch (err) {
            ExceptionCapture.handle(err, { fallbackMessage: "Falha ao salvar configuração de e-mail." });
        } finally {
            setSaving(false);
        }
    };

    const sendTest = async () => {
        if (!testTo.trim()) {
            toast.error("Informe o e-mail que vai receber o teste.");
            return;
        }
        setTesting(true);
        try {
            const data = await platformEmailService.sendTest(testTo.trim());
            setSettings(data);
            if (data.lastTestSuccess) toast.success("E-mail de teste enviado.");
            else toast.error("O envio de teste falhou. Veja o detalhe abaixo.");
        } catch (err) {
            ExceptionCapture.handle(err, { fallbackMessage: "Falha ao enviar e-mail de teste." });
        } finally {
            setTesting(false);
        }
    };

    return (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <AdminModuleToolbar tabs={[{ key: "email", label: "E-mail (SMTP)" }]} active="email" onSelect={() => {}} />

            <div style={{ flex: 1, overflowY: "auto", padding: 20 }}>
                {!form || !settings ? (
                    <div style={{ fontSize: 12, color: "var(--ga-text-subtle)" }}>Carregando...</div>
                ) : (
                    <div style={{ width: "100%", maxWidth: 880 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                            <div style={{ fontWeight: 600, fontSize: 14, color: "var(--ga-text)" }}>
                                Envio de e-mails da plataforma
                            </div>
                            <AdminBadge status={settings.enabled ? "Ativo" : "Inativo"} />
                        </div>
                        <div style={{ fontSize: 12, color: "var(--ga-text-muted)", marginBottom: 18 }}>
                            Conta SMTP usada por todos os ambientes de clientes para enviar e-mails automáticos
                            (retorno a candidatos, recibos de pagamento etc.).
                        </div>

                        <AdminSection title="Servidor">
                            <AdminFormGrid cols={3}>
                                <AdminSelect
                                    label="Envio habilitado"
                                    value={form.enabled ? "true" : "false"}
                                    onChange={(v) => update("enabled", v === "true")}
                                    options={[
                                        { value: "false", label: "Não" },
                                        { value: "true", label: "Sim" },
                                    ]}
                                />
                                <AdminInput
                                    label="Servidor SMTP"
                                    value={form.host}
                                    onChange={(v) => update("host", v)}
                                    placeholder="smtp.gmail.com"
                                    required={form.enabled}
                                />
                                <AdminInput
                                    label="Porta"
                                    value={form.port}
                                    onChange={(v) => update("port", v.replace(/\D/g, ""))}
                                    placeholder="587"
                                    required={form.enabled}
                                />
                                <AdminSelect
                                    label="Criptografia"
                                    value={form.security}
                                    onChange={(v) => {
                                        const security = v as PlatformEmailSecurity;
                                        setForm((prev) =>
                                            prev
                                                ? {
                                                      ...prev,
                                                      security,
                                                      port:
                                                          !prev.port || prev.port === DEFAULT_PORT[prev.security]
                                                              ? DEFAULT_PORT[security]
                                                              : prev.port,
                                                  }
                                                : prev,
                                        );
                                    }}
                                    options={SECURITY_OPTIONS}
                                />
                            </AdminFormGrid>
                        </AdminSection>

                        <AdminSection title="Autenticação">
                            <AdminFormGrid cols={2}>
                                <AdminInput
                                    label="Usuário"
                                    value={form.username}
                                    onChange={(v) => update("username", v)}
                                    placeholder="conta@gmail.com"
                                    required={form.enabled}
                                />
                                <AdminInput
                                    label="Senha de app"
                                    type="password"
                                    value={form.password}
                                    onChange={(v) => setForm((prev) => (prev ? { ...prev, password: v, clearPassword: false } : prev))}
                                    placeholder={
                                        settings.passwordConfigured && !form.clearPassword
                                            ? "•••••••• (deixe vazio para manter)"
                                            : "16 caracteres gerados pelo Google"
                                    }
                                    required={form.enabled && !settings.passwordConfigured}
                                />
                            </AdminFormGrid>
                            {settings.passwordConfigured ? (
                                <label
                                    style={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: 6,
                                        marginTop: 10,
                                        fontSize: 12,
                                        color: "var(--ga-text-muted)",
                                        cursor: "pointer",
                                    }}
                                >
                                    <input
                                        type="checkbox"
                                        checked={form.clearPassword}
                                        onChange={(e) =>
                                            setForm((prev) =>
                                                prev
                                                    ? { ...prev, clearPassword: e.target.checked, password: "" }
                                                    : prev,
                                            )
                                        }
                                    />
                                    Remover a senha salva
                                </label>
                            ) : null}
                        </AdminSection>

                        <AdminSection title="Remetente">
                            <AdminFormGrid cols={3}>
                                <AdminInput
                                    label="E-mail do remetente"
                                    value={form.fromAddress}
                                    onChange={(v) => update("fromAddress", v)}
                                    placeholder="Vazio usa o usuário"
                                />
                                <AdminInput
                                    label="Nome do remetente"
                                    value={form.fromName}
                                    onChange={(v) => update("fromName", v)}
                                    placeholder="Gesint"
                                />
                                <AdminInput
                                    label="Responder para"
                                    value={form.replyTo}
                                    onChange={(v) => update("replyTo", v)}
                                    placeholder="Opcional"
                                />
                            </AdminFormGrid>
                        </AdminSection>

                        <AdminBtn onClick={() => void save()} disabled={saving}>
                            {saving ? "Salvando..." : "Salvar Alterações"}
                        </AdminBtn>

                        <div style={{ marginTop: 28 }}>
                            <AdminSection title="Teste de envio">
                                {!settings.persisted ? (
                                    <div style={{ fontSize: 12, color: "var(--ga-text-muted)" }}>
                                        Salve a configuração antes de enviar um teste.
                                    </div>
                                ) : (
                                    <div style={{ display: "flex", alignItems: "flex-end", gap: 8, maxWidth: 520 }}>
                                        <div style={{ flex: 1 }}>
                                            <AdminInput
                                                label="Enviar para"
                                                type="email"
                                                value={testTo}
                                                onChange={setTestTo}
                                                placeholder="voce@empresa.com.br"
                                            />
                                        </div>
                                        <AdminBtn
                                            variant="secondary"
                                            icon={<Send size={12} />}
                                            onClick={() => void sendTest()}
                                            disabled={testing}
                                        >
                                            {testing ? "Enviando..." : "Enviar teste"}
                                        </AdminBtn>
                                    </div>
                                )}
                                {settings.lastTestAt ? (
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "flex-start",
                                            gap: 8,
                                            marginTop: 12,
                                            fontSize: 12,
                                            color: "var(--ga-text-muted)",
                                        }}
                                    >
                                        {settings.lastTestSuccess ? (
                                            <CheckCircle size={15} color="var(--ga-badge-active-fg)" />
                                        ) : (
                                            <XCircle size={15} color="#dc2626" />
                                        )}
                                        <div>
                                            <div style={{ fontWeight: 600, color: "var(--ga-text)" }}>
                                                Último teste em {formatDateTime(settings.lastTestAt)}
                                            </div>
                                            <div style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                                                {settings.lastTestMessage}
                                            </div>
                                        </div>
                                    </div>
                                ) : null}
                            </AdminSection>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
