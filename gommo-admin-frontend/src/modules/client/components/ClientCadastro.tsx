"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { ClientFiliais } from "@/modules/client/components/ClientFiliais";
import { ClientSistemas } from "@/modules/client/components/ClientSistemas";
import { ClientUsuarios } from "@/modules/client/components/ClientUsuarios";
import type { Client, ClientFormDto } from "@/modules/client/dto/client.dto";
import { BRAZIL_UF_OPTIONS } from "@/modules/client/lib/brazil-states";
import {
    clientToFormDto,
    emptyClientForm,
    formToCreateDto,
    statusLabel,
} from "@/modules/client/lib/client.mapper";
import { lookupCnpj } from "@/modules/client/lib/cnpj-lookup";
import { formatTenantSchemaSyncSummary } from "@/modules/client/lib/tenant-schema-sync";
import { addressService } from "@/modules/client/services/address.service";
import { clientService } from "@/modules/client/services/client.service";
import type { ClientEnvironmentConfigUpsertDto } from "@/modules/clientenvironmentconfig/dto/clientenvironmentconfig.dto";
import { clientEnvironmentConfigService } from "@/modules/clientenvironmentconfig/services/clientenvironmentconfig.service";
import { AdminBadge } from "@/shared/components/ui/admin/AdminBadge";
import { AdminBtn } from "@/shared/components/ui/admin/AdminBtn";
import { AdminInput, AdminSelect } from "@/shared/components/ui/admin/AdminField";
import { AdminHelpTip } from "@/shared/components/ui/admin/AdminHelpTip";
import { AdminModal } from "@/shared/components/ui/admin/AdminModal";
import {
    AdminMultiValue,
    type AdminMultiValueHandle,
} from "@/shared/components/ui/admin/AdminMultiValue";
import { AdminFormGrid, AdminSection } from "@/shared/components/ui/admin/AdminSection";
import { AdminSubTabBar } from "@/shared/components/ui/admin/AdminTabBar";
import { ExceptionCapture } from "@/shared/exceptions/exception-capture";
import { digitsOnly } from "@/shared/lib/input/digits";
import { isValidCnpj, maskCnpj } from "@/shared/lib/input/cnpj";
import { maskCep } from "@/shared/lib/input/cep";
import { maskSinglePhone } from "@/shared/lib/input/phone";
import { CLIENT_SUB_TABS, type ClientSubTabKey } from "@/shared/routing/admin-nav";

function emptyEnvForm(clientId = ""): ClientEnvironmentConfigUpsertDto {
    return {
        clientId,
        routingMode: "SUBDOMAIN",
        subdomain: "",
        customDomain: "",
        databaseStrategy: "DEDICATED_SCHEMA",
        databaseHost: "localhost",
        databasePort: 5432,
        databaseName: "gommo",
        databaseSchema: "",
        databaseUser: "gommo",
        databaseSecretRef: "DB_PASSWORD",
        provisioningStatus: "PENDING",
        provisioningNotes: "",
    };
}

export function ClientCadastro({
    client,
    isNew = false,
    subTab,
    onSubTabChange,
    onSaved,
    onCancel,
    defaultSlugHint,
}: {
    client: Client | null;
    isNew?: boolean;
    subTab: ClientSubTabKey;
    onSubTabChange: (subTab: ClientSubTabKey) => void;
    onSaved: (client: Client) => void | Promise<void>;
    onCancel: () => void;
    defaultSlugHint: (name: string) => string;
}) {
    const [form, setForm] = useState<ClientFormDto>(emptyClientForm());
    const [envForm, setEnvForm] = useState<ClientEnvironmentConfigUpsertDto>(() => emptyEnvForm(client?.id));
    const [envConfigReady, setEnvConfigReady] = useState(false);
    const [saving, setSaving] = useState(false);
    const [lookingUpCnpj, setLookingUpCnpj] = useState(false);
    const [lookingUpCep, setLookingUpCep] = useState(false);
    const [cnpjNotFoundOpen, setCnpjNotFoundOpen] = useState(false);
    const lastLookupRef = useRef("");
    const lastCepLookupRef = useRef("");
    const phonesFieldRef = useRef<AdminMultiValueHandle>(null);

    const applyEnvConfig = (
        config: Awaited<ReturnType<typeof clientEnvironmentConfigService.getByClientId>>,
        clientId = client?.id ?? config.clientId,
    ) => {
        setEnvForm({
            clientId,
            routingMode: config.routingMode ?? "SUBDOMAIN",
            subdomain: config.subdomain ?? "",
            customDomain: config.customDomain ?? "",
            databaseStrategy: config.databaseStrategy ?? "DEDICATED_SCHEMA",
            databaseHost: config.databaseHost ?? "localhost",
            databasePort: config.databasePort ?? 5432,
            databaseName: config.databaseName ?? "gommo",
            databaseSchema: config.databaseSchema ?? "",
            databaseUser: config.databaseUser ?? "gommo",
            databaseSecretRef: config.databaseSecretRef ?? "DB_PASSWORD",
            provisioningStatus: config.provisioningStatus ?? "PENDING",
            provisioningNotes: config.provisioningNotes ?? "",
        });
    };

    useEffect(() => {
        if (!client) {
            setForm(emptyClientForm());
            lastLookupRef.current = "";
            lastCepLookupRef.current = "";
            return;
        }
        const next = clientToFormDto(client);
        setForm(next);
        lastLookupRef.current = digitsOnly(client.document ?? "");
        lastCepLookupRef.current = digitsOnly(next.zipCode ?? "");
    }, [client]);

    useEffect(() => {
        if (!client?.id) {
            setEnvForm(emptyEnvForm());
            setEnvConfigReady(false);
            return;
        }

        const clientId = client.id;
        setEnvForm(emptyEnvForm(clientId));
        setEnvConfigReady(false);

        let cancelled = false;
        void clientEnvironmentConfigService
            .getByClientId(clientId)
            .then((config) => {
                if (cancelled) return;
                applyEnvConfig(config, clientId);
                setEnvConfigReady(true);
            })
            .catch(() => {
                if (!cancelled) {
                    setEnvConfigReady(true);
                }
            });

        return () => {
            cancelled = true;
        };
    }, [client?.id]);

    const updateForm = <K extends keyof ClientFormDto>(key: K, value: ClientFormDto[K]) => {
        setForm((prev) => {
            const next = { ...prev, [key]: value };
            if (key === "name" && isNew && (!prev.slug || prev.slug === defaultSlugHint(prev.name))) {
                next.slug = defaultSlugHint(String(value ?? ""));
            }
            return next;
        });
    };

    const applyCnpjResult = (result: Awaited<ReturnType<typeof lookupCnpj>>) => {
        if (!result) return;
        if (result.zipCode) {
            lastCepLookupRef.current = digitsOnly(result.zipCode);
        }
        setForm((prev) => {
            const next: ClientFormDto = {
                ...prev,
                document: result.document,
                name: result.name || prev.name,
                legalName: result.legalName || prev.legalName,
                street: result.street || prev.street,
                number: result.number || prev.number,
                complement: result.complement || prev.complement,
                district: result.district || prev.district,
                city: result.city || prev.city,
                stateCode: result.stateCode || prev.stateCode,
                zipCode: result.zipCode || prev.zipCode,
                contactEmail: result.contactEmail || prev.contactEmail,
                phones: result.phones.length ? result.phones.join("; ") : prev.phones,
            };
            if (isNew && (!prev.slug || prev.slug === defaultSlugHint(prev.name))) {
                next.slug = defaultSlugHint(next.name);
            }
            return next;
        });
    };

    const handleCepLookup = async (digits: string) => {
        if (digits.length !== 8 || digits === lastCepLookupRef.current) return;
        lastCepLookupRef.current = digits;
        setLookingUpCep(true);
        try {
            const address = await addressService.findByPostalCode(digits);
            setForm((prev) => ({
                ...prev,
                zipCode: address.zipCode || prev.zipCode,
                street: address.street || prev.street,
                complement: address.complement || prev.complement,
                district: address.district || prev.district,
                city: address.city || prev.city,
                stateCode: address.stateCode || prev.stateCode,
            }));
            toast.success("Endereço preenchido pelo CEP.");
        } catch (err) {
            ExceptionCapture.handle(err, { fallbackMessage: "Falha ao consultar CEP." });
            lastCepLookupRef.current = "";
        } finally {
            setLookingUpCep(false);
        }
    };

    const onZipCodeChange = (value: string) => {
        const digits = digitsOnly(value).slice(0, 8);
        updateForm("zipCode", digits);
        if (digits.length < 8) {
            lastCepLookupRef.current = "";
            return;
        }
        void handleCepLookup(digits);
    };

    const handleCnpjLookup = async (digits: string) => {
        if (digits.length !== 14 || digits === lastLookupRef.current) return;
        lastLookupRef.current = digits;
        setLookingUpCnpj(true);
        try {
            if (!isValidCnpj(digits)) {
                toast.error("CNPJ inválido.");
                return;
            }
            const result = await lookupCnpj(digits);
            if (!result) {
                setCnpjNotFoundOpen(true);
                return;
            }
            applyCnpjResult(result);
            toast.success("Dados do CNPJ preenchidos automaticamente.");
        } catch (err) {
            ExceptionCapture.handle(err, { fallbackMessage: "Falha ao consultar CNPJ." });
            lastLookupRef.current = "";
        } finally {
            setLookingUpCnpj(false);
        }
    };

    const onDocumentChange = (value: string) => {
        const digits = digitsOnly(value).slice(0, 14);
        updateForm("document", digits);
        if (digits.length < 14) {
            lastLookupRef.current = "";
            return;
        }
        void handleCnpjLookup(digits);
    };

    const updateEnv = <K extends keyof ClientEnvironmentConfigUpsertDto>(
        key: K,
        value: ClientEnvironmentConfigUpsertDto[K],
    ) => {
        setEnvForm((prev) => ({ ...prev, [key]: value }));
    };

    const saveDados = async () => {
        setSaving(true);
        try {
            const phones = phonesFieldRef.current?.flush() ?? form.phones ?? "";
            const payload = formToCreateDto({ ...form, phones }, defaultSlugHint);
            if (!payload.name) {
                toast.error("Informe o Nome Fantasia.");
                return;
            }
            if (payload.document && digitsOnly(payload.document).length === 14 && !isValidCnpj(payload.document)) {
                toast.error("CNPJ inválido.");
                return;
            }
            const saved = isNew || !client
                ? await clientService.create(payload)
                : await clientService.update(client.id, payload);
            toast.success("Dados salvos com sucesso.");
            await onSaved(saved);
        } catch (err) {
            ExceptionCapture.handle(err, { fallbackMessage: "Falha ao salvar cliente." });
        } finally {
            setSaving(false);
        }
    };

    const getReadyClient = (): Client | null => {
        if (!client?.id) {
            toast.error("Salve os dados básicos antes de configurar o ambiente.");
            return null;
        }
        if (!envConfigReady || envForm.clientId !== client.id) {
            toast.error("Aguarde o carregamento da configuração de ambiente deste cliente.");
            return null;
        }
        return client;
    };

    const saveConfig = async () => {
        const readyClient = getReadyClient();
        if (!readyClient) {
            return;
        }
        setSaving(true);
        try {
            const saved = await clientEnvironmentConfigService.upsertByClientId(readyClient.id, {
                ...envForm,
                clientId: readyClient.id,
            });
            applyEnvConfig(saved);
            toast.success("Configuração do ambiente salva.");
        } catch (err) {
            ExceptionCapture.handle(err, { fallbackMessage: "Falha ao salvar configuração." });
        } finally {
            setSaving(false);
        }
    };

    const testConnection = async () => {
        const readyClient = getReadyClient();
        if (!readyClient) {
            return;
        }
        setSaving(true);
        try {
            const saved = await clientEnvironmentConfigService.upsertByClientId(readyClient.id, {
                ...envForm,
                clientId: readyClient.id,
            });
            applyEnvConfig(saved);
            const result = await clientService.testDatabaseConnection(readyClient.id);
            if (result.success) {
                toast.success(result.message);
            } else {
                toast.error(result.message);
            }
        } catch (err) {
            ExceptionCapture.handle(err, { fallbackMessage: "Falha ao testar conexão." });
        } finally {
            setSaving(false);
        }
    };

    const startProvisioning = async () => {
        const readyClient = getReadyClient();
        if (!readyClient) {
            return;
        }
        setSaving(true);
        try {
            const saved = await clientEnvironmentConfigService.upsertByClientId(readyClient.id, {
                ...envForm,
                clientId: readyClient.id,
            });
            applyEnvConfig(saved);
            await clientService.startProvisioning(readyClient.id);
            await onSaved(readyClient);
            const config = await clientEnvironmentConfigService.getByClientId(readyClient.id);
            applyEnvConfig(config);
            if (config.provisioningStatus === "READY") {
                toast.success("Tenant provisionado com sucesso.");
            } else if (config.provisioningStatus === "ERROR") {
                toast.error(config.provisioningNotes || "Falha no provisionamento.");
            } else {
                toast.success("Provisionamento solicitado.");
            }
        } catch (err) {
            ExceptionCapture.handle(err, { fallbackMessage: "Falha no provisionamento." });
        } finally {
            setSaving(false);
        }
    };

    const syncSchema = async () => {
        const readyClient = getReadyClient();
        if (!readyClient) {
            return;
        }
        if (envForm.databaseStrategy !== "DEDICATED_SCHEMA") {
            toast.error("Sincronização de schema só se aplica a tenants com schema dedicado.");
            return;
        }
        if (envForm.provisioningStatus !== "READY") {
            toast.error("Provisione o tenant antes de sincronizar a estrutura.");
            return;
        }
        setSaving(true);
        try {
            const result = await clientService.syncSchema(readyClient.id);
            const summary = formatTenantSchemaSyncSummary(result);
            if (result.warnings?.length) {
                toast.warning(summary);
            } else {
                toast.success(summary);
            }
        } catch (err) {
            ExceptionCapture.handle(err, { fallbackMessage: "Falha ao sincronizar schema." });
        } finally {
            setSaving(false);
        }
    };

    const canSyncSchema =
        envConfigReady &&
        envForm.databaseStrategy === "DEDICATED_SCHEMA" &&
        envForm.provisioningStatus === "READY";

    return (
        <div
            style={{
                flex: 1,
                minHeight: 0,
                display: "flex",
                flexDirection: "column",
                overflow: subTab === "systems" ? "hidden" : "auto",
            }}
        >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, flexShrink: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 14, color: "var(--ga-text)" }}>
                    {isNew ? "Novo cliente" : (client?.name ?? "Cliente")}
                </div>
                {!isNew && client ? <AdminBadge status={statusLabel(client.status)} /> : null}
                {!isNew && client?.mobileLoginCode ? (
                    <span style={{ fontSize: 11, color: "var(--ga-text-muted)" }}>
                        Código do empregador: {client.mobileLoginCode}
                    </span>
                ) : null}
            </div>

            <div style={{ flexShrink: 0 }}>
                <AdminSubTabBar
                    tabs={[...CLIENT_SUB_TABS]}
                    active={subTab}
                    onSelect={(key) => onSubTabChange(key as ClientSubTabKey)}
                />
            </div>

            {subTab === "basics" ? (
                <div style={{ width: "100%" }}>
                    <AdminSection title="Dados do Cliente">
                        <AdminFormGrid cols={3}>
                            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                                <AdminInput
                                    label="CNPJ"
                                    value={maskCnpj(form.document ?? "")}
                                    onChange={onDocumentChange}
                                    placeholder="00.000.000/0000-00"
                                    required
                                />
                                <div style={{ fontSize: 11, color: "var(--ga-text-muted)", lineHeight: 1.35 }}>
                                    {lookingUpCnpj ? "Consultando CNPJ..." : "Busca de dados automática."}
                                </div>
                            </div>
                            <AdminInput
                                label="Nome Fantasia"
                                value={form.name}
                                onChange={(v) => updateForm("name", v)}
                                required
                            />
                            <AdminInput
                                label="Razão Social"
                                value={form.legalName ?? ""}
                                onChange={(v) => updateForm("legalName", v)}
                            />
                            <div style={{ gridColumn: "span 3" }}>
                                <AdminFormGrid cols={2}>
                                    <AdminInput
                                        label="Email"
                                        value={form.contactEmail ?? ""}
                                        onChange={(v) => updateForm("contactEmail", v)}
                                        type="email"
                                    />
                                    <AdminMultiValue
                                        ref={phonesFieldRef}
                                        label="Telefones"
                                        value={form.phones ?? ""}
                                        onChange={(v) => updateForm("phones", v)}
                                        placeholder="Digite e pressione Tab"
                                        maskValue={maskSinglePhone}
                                    />
                                </AdminFormGrid>
                            </div>
                        </AdminFormGrid>
                    </AdminSection>

                    <AdminSection title="Endereço">
                        <AdminFormGrid cols={3}>
                            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                                <AdminInput
                                    label="CEP"
                                    value={maskCep(form.zipCode ?? "")}
                                    onChange={onZipCodeChange}
                                    placeholder="00000-000"
                                    disabled={lookingUpCep}
                                />
                                <div style={{ fontSize: 11, color: "var(--ga-text-muted)", lineHeight: 1.35 }}>
                                    {lookingUpCep ? "Consultando CEP..." : "Busca automática ao completar 8 dígitos."}
                                </div>
                            </div>
                            <AdminSelect
                                label="UF"
                                value={form.stateCode ?? ""}
                                onChange={(v) => updateForm("stateCode", v)}
                                options={BRAZIL_UF_OPTIONS}
                            />
                            <AdminInput
                                label="Cidade"
                                value={form.city ?? ""}
                                onChange={(v) => updateForm("city", v)}
                            />
                            <div style={{ gridColumn: "span 2" }}>
                                <AdminInput
                                    label="Logradouro"
                                    value={form.street ?? ""}
                                    onChange={(v) => updateForm("street", v)}
                                />
                            </div>
                            <AdminInput
                                label="Número"
                                value={form.number ?? ""}
                                onChange={(v) => updateForm("number", v)}
                            />
                            <AdminInput
                                label="Bairro"
                                value={form.district ?? ""}
                                onChange={(v) => updateForm("district", v)}
                            />
                            <div style={{ gridColumn: "span 2" }}>
                                <AdminInput
                                    label="Complemento"
                                    value={form.complement ?? ""}
                                    onChange={(v) => updateForm("complement", v)}
                                />
                            </div>
                        </AdminFormGrid>
                    </AdminSection>

                    <div style={{ display: "flex", gap: 8 }}>
                        <AdminBtn
                            onClick={() => void saveDados()}
                            disabled={saving || lookingUpCnpj || lookingUpCep}
                        >
                            {saving ? "Salvando..." : "Salvar Alterações"}
                        </AdminBtn>
                    </div>
                </div>
            ) : null}

            {subTab === "branches" ? (
                client ? <ClientFiliais clientId={client.id} /> : (
                    <div style={{ fontSize: 13, color: "var(--ga-text-muted)" }}>
                        Salve os dados básicos para cadastrar as filiais.
                    </div>
                )
            ) : null}

            {subTab === "environment" ? (
                <div style={{ width: "100%" }}>
                    {!client ? (
                        <div style={{ fontSize: 13, color: "var(--ga-text-muted)" }}>
                            Salve os dados básicos para configurar o ambiente.
                        </div>
                    ) : !envConfigReady ? (
                        <div style={{ fontSize: 13, color: "var(--ga-text-muted)" }}>
                            Carregando configuração de ambiente...
                        </div>
                    ) : (
                        <>
                            <AdminSection title="Roteamento">
                                <AdminFormGrid cols={3}>
                                    <AdminSelect
                                        label="Modo de Roteamento"
                                        value={envForm.routingMode ?? "SUBDOMAIN"}
                                        onChange={(v) => updateEnv("routingMode", v)}
                                        options={[
                                            { value: "SUBDOMAIN", label: "Subdomínio" },
                                            { value: "CUSTOM_DOMAIN", label: "Domínio personalizado" },
                                        ]}
                                    />
                                    <AdminInput
                                        label="Subdomínio"
                                        value={envForm.subdomain ?? ""}
                                        onChange={(v) => updateEnv("subdomain", v)}
                                    />
                                    <AdminInput
                                        label="Domínio personalizado"
                                        value={envForm.customDomain ?? ""}
                                        onChange={(v) => updateEnv("customDomain", v)}
                                    />
                                </AdminFormGrid>
                            </AdminSection>

                            <AdminSection title="Banco de Dados">
                                <AdminFormGrid cols={4}>
                                    <AdminSelect
                                        label="Estratégia"
                                        value={envForm.databaseStrategy ?? "DEDICATED_SCHEMA"}
                                        onChange={(v) => updateEnv("databaseStrategy", v)}
                                        options={[
                                            { value: "DEDICATED_SCHEMA", label: "Schema dedicado" },
                                            { value: "DEDICATED_DATABASE", label: "Banco dedicado" },
                                        ]}
                                    />
                                    <AdminInput
                                        label="Host"
                                        value={envForm.databaseHost ?? ""}
                                        onChange={(v) => updateEnv("databaseHost", v)}
                                    />
                                    <AdminInput
                                        label="Porta"
                                        value={String(envForm.databasePort ?? "")}
                                        onChange={(v) =>
                                            updateEnv("databasePort", v ? Number(v) : undefined)
                                        }
                                    />
                                    <AdminInput
                                        label="Database"
                                        value={envForm.databaseName ?? ""}
                                        onChange={(v) => updateEnv("databaseName", v)}
                                    />
                                    <AdminInput
                                        label="Schema"
                                        value={envForm.databaseSchema ?? ""}
                                        onChange={(v) => updateEnv("databaseSchema", v)}
                                    />
                                    <AdminInput
                                        label="Usuário"
                                        value={envForm.databaseUser ?? ""}
                                        onChange={(v) => updateEnv("databaseUser", v)}
                                    />
                                    <AdminInput
                                        label="Secret Ref"
                                        value={envForm.databaseSecretRef ?? ""}
                                        onChange={(v) => updateEnv("databaseSecretRef", v)}
                                    />
                                    <AdminInput
                                        label="Provisioning"
                                        value={envForm.provisioningStatus ?? ""}
                                        disabled
                                    />
                                </AdminFormGrid>
                                {envForm.provisioningNotes ? (
                                    envForm.provisioningStatus === "ERROR" ? (
                                        <div className="ga-callout-error" style={{ marginTop: 10 }}>
                                            {envForm.provisioningNotes}
                                        </div>
                                    ) : (
                                        <div
                                            style={{
                                                marginTop: 10,
                                                padding: "8px 10px",
                                                borderRadius: "var(--ga-radius-sm)",
                                                border: "1px solid var(--ga-border)",
                                                background: "var(--ga-surface-2)",
                                                color: "var(--ga-text-muted)",
                                                fontSize: 12,
                                                lineHeight: 1.45,
                                            }}
                                        >
                                            {envForm.provisioningNotes}
                                        </div>
                                    )
                                ) : null}
                            </AdminSection>

                            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                                <AdminBtn onClick={() => void saveConfig()} disabled={saving || !envConfigReady}>
                                    Salvar Configurações
                                </AdminBtn>
                                <AdminBtn
                                    variant="secondary"
                                    onClick={() => void testConnection()}
                                    disabled={saving || !envConfigReady}
                                >
                                    Testar Conexão
                                </AdminBtn>
                                <div style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                                    <AdminBtn
                                        variant="secondary"
                                        onClick={() => void startProvisioning()}
                                        disabled={saving || !envConfigReady}
                                    >
                                        Provisionar
                                    </AdminBtn>
                                    <AdminHelpTip
                                        tooltip="Usa exatamente o Schema gravado em Config. do Ambiente. So sugere tenant_{slug} se o campo estiver vazio. Clique no icone para a documentacao."
                                        href="/docs/provision-environment"
                                    />
                                </div>
                                <div style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                                    <AdminBtn
                                        variant="secondary"
                                        onClick={() => void syncSchema()}
                                        disabled={saving || !canSyncSchema}
                                    >
                                        Sincronizar schema
                                    </AdminBtn>
                                    <AdminHelpTip tooltip="Atualiza tabelas, colunas e índices do tenant já provisionado com base no template public. Use após deploy de migrations novas." />
                                </div>
                            </div>
                        </>
                    )}
                </div>
            ) : null}

            {subTab === "systems" ? (
                client ? (
                    <div style={{ flex: 1, minHeight: 0, marginTop: 4 }}>
                        <ClientSistemas clientId={client.id} />
                    </div>
                ) : (
                    <div style={{ fontSize: 13, color: "var(--ga-text-muted)" }}>
                        Salve os dados básicos para gerenciar sistemas contratados.
                    </div>
                )
            ) : null}

            {subTab === "users" ? (
                client ? <ClientUsuarios clientId={client.id} /> : (
                    <div style={{ fontSize: 13, color: "var(--ga-text-muted)" }}>
                        Salve os dados básicos para gerenciar usuários.
                    </div>
                )
            ) : null}

            <AdminModal
                open={cnpjNotFoundOpen}
                onClose={() => setCnpjNotFoundOpen(false)}
                title="Dados não encontrados"
            >
                <p style={{ margin: "0 0 16px", fontSize: 13, color: "var(--ga-text)", lineHeight: 1.5 }}>
                    Não encontramos dados para este CNPJ na base pública. Você pode preencher o cadastro
                    manualmente ou cancelar o cadastro.
                </p>
                <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", flexWrap: "wrap" }}>
                    <AdminBtn
                        variant="secondary"
                        onClick={() => {
                            setCnpjNotFoundOpen(false);
                            onCancel();
                        }}
                    >
                        Cancelar cadastro
                    </AdminBtn>
                    <AdminBtn onClick={() => setCnpjNotFoundOpen(false)}>
                        Inserir manualmente
                    </AdminBtn>
                </div>
            </AdminModal>
        </div>
    );
}
