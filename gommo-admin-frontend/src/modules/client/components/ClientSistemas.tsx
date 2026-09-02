"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import type { ClientBranch } from "@/modules/clientbranch/dto/clientbranch.dto";
import { clientBranchService } from "@/modules/clientbranch/services/clientbranch.service";
import type {
    ClientContractedSystem,
    ClientContractedSystemCreateDto,
} from "@/modules/clientcontractedsystem/dto/clientcontractedsystem.dto";
import { clientContractedSystemService } from "@/modules/clientcontractedsystem/services/clientcontractedsystem.service";
import type { ProductSystem } from "@/modules/productsystem/dto/productsystem.dto";
import { productSystemService } from "@/modules/productsystem/services/productsystem.service";
import { AdminBtn } from "@/shared/components/ui/admin/AdminBtn";
import { AdminStatusIcon } from "@/shared/components/ui/admin/AdminBadge";
import { AdminCurrency, AdminInput, AdminSelect } from "@/shared/components/ui/admin/AdminField";
import { AdminFormGrid, AdminSection } from "@/shared/components/ui/admin/AdminSection";
import { ExceptionCapture } from "@/shared/exceptions/exception-capture";
import { isProductSystemKeyVisible } from "@/shared/lib/system-availability";

function operationalLabel(status?: string) {
    switch (status) {
        case "ACTIVE":
            return "Ativo";
        case "INACTIVE":
            return "Inativo";
        case "PAUSED":
            return "Pausado";
        case "CANCELLED":
            return "Cancelado";
        default:
            return status ?? "—";
    }
}

function statusColor(status?: string) {
    if (status === "ACTIVE") return "#16a34a";
    if (status === "INACTIVE") return "#dc2626";
    if (status === "PAUSED") return "#d97706";
    return "#64748b";
}

function toDateTimeLocalValue(iso?: string): string {
    if (!iso) return "";
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return "";
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function fromDateTimeLocalValue(value?: string): string | undefined {
    const trimmed = value?.trim();
    if (!trimmed) return undefined;
    const date = new Date(trimmed);
    if (Number.isNaN(date.getTime())) return undefined;
    return date.toISOString();
}

function emptyForm(clientId: string, product: ProductSystem): ClientContractedSystemCreateDto {
    return {
        clientId,
        productSystemId: product.id,
        operationalStatus: "ACTIVE",
        negotiatedAmount: product.defaultPrice,
        discountPercent: undefined,
        agreedAmount: undefined,
        contractType: "MONTHLY",
        contractDate: "",
        endDate: "",
        dueDay: "",
        lateTolerance: "",
        withAi: Boolean(product.withAiAvailable),
        sessionPolicy: "KEEP_UNTIL_EXPIRY",
        effectiveFrom: "",
        deactivateAt: "",
        branchMode: "ALL",
        clientBranchIds: [],
        notes: "",
    };
}

function toForm(clientId: string, item: ClientContractedSystem): ClientContractedSystemCreateDto {
    return {
        clientId,
        productSystemId: item.productSystemId,
        operationalStatus: item.operationalStatus ?? "ACTIVE",
        statusDate: item.statusDate ?? "",
        returnDate: item.returnDate ?? "",
        negotiatedAmount: item.negotiatedAmount,
        discountPercent: item.discountPercent,
        agreedAmount: item.agreedAmount,
        contractType: item.contractType ?? "MONTHLY",
        contractDate: item.contractDate ?? "",
        endDate: item.endDate ?? "",
        dueDay: item.dueDay ?? "",
        lateTolerance: item.lateTolerance ?? "",
        withAi: Boolean(item.withAi),
        sessionPolicy: item.sessionPolicy ?? "KEEP_UNTIL_EXPIRY",
        effectiveFrom: toDateTimeLocalValue(item.effectiveFrom),
        deactivateAt: toDateTimeLocalValue(item.deactivateAt),
        branchMode: item.branchMode ?? "ALL",
        includeHeadquarters: item.includeHeadquarters,
        clientBranchIds: item.clientBranchIds ?? [],
        notes: item.notes ?? "",
    };
}

/**
 * Payload de atualização que preserva o contrato como ele está. Diferente de {@link toForm}, as
 * datas ficam no ISO que veio da API: o formato do input `datetime-local` não tem fuso e a API o
 * recusa.
 */
function toPayload(clientId: string, item: ClientContractedSystem): ClientContractedSystemCreateDto {
    return {
        ...toForm(clientId, item),
        statusDate: item.statusDate,
        returnDate: item.returnDate,
        contractDate: item.contractDate,
        endDate: item.endDate,
        effectiveFrom: item.effectiveFrom,
        deactivateAt: item.deactivateAt,
    };
}

/** "ALL" = todas as filiais; "HQ" = a matriz, que vem dos Dados Básicos; qualquer outro valor é um id de filial. */
type BranchScope = "ALL" | "HQ" | (string & {});

/** Em modo ALL não há linhas de associação, então o contrato vale em qualquer escopo. */
function contractAppliesTo(contract: ClientContractedSystem | undefined, scope: BranchScope): boolean {
    if (!contract) return false;
    if ((contract.branchMode ?? "ALL") === "ALL") return true;
    if (scope === "ALL") return false;
    if (scope === "HQ") return Boolean(contract.includeHeadquarters);
    return (contract.clientBranchIds ?? []).includes(scope);
}

function parseOptionalNumber(value: string): number | undefined {
    const trimmed = value.trim().replace(",", ".");
    if (!trimmed) return undefined;
    const num = Number(trimmed);
    return Number.isFinite(num) ? num : undefined;
}

/**
 * Detalhe de um escopo específico. Os valores do contrato são do cliente e não variam por filial,
 * então aparecem apenas como leitura; aqui só se decide onde o sistema está habilitado.
 */
function BranchScopePanel({
    product,
    contract,
    scopeLabel,
    enabled,
    saving,
    onToggle,
    onApplyToAll,
}: {
    product: ProductSystem;
    contract: ClientContractedSystem | null;
    scopeLabel: string;
    enabled: boolean;
    saving: boolean;
    onToggle: (enable: boolean) => void;
    onApplyToAll: () => void;
}) {
    const muted = { fontSize: 12, color: "var(--ga-text-muted)" } as const;

    return (
        <>
            <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: "var(--ga-primary)", fontWeight: 700 }}>{product.key}</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "var(--ga-text)" }}>{product.name}</div>
                <div style={{ ...muted, marginTop: 2 }}>Escopo selecionado: {scopeLabel}</div>
            </div>

            {!contract ? (
                <div style={muted}>
                    Este sistema ainda não foi contratado pelo cliente. Habilite em &ldquo;Todas as filiais&rdquo;
                    antes de definir onde ele vale.
                </div>
            ) : (
                <>
                    <AdminSection title="Disponibilidade">
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <AdminStatusIcon status={enabled ? "Ativo" : "Inativo"} />
                            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--ga-text)" }}>
                                {enabled ? "Habilitado neste escopo" : "Não habilitado neste escopo"}
                            </span>
                            <AdminBtn onClick={() => onToggle(!enabled)} disabled={saving}>
                                {saving ? "Salvando..." : enabled ? "Desabilitar aqui" : "Habilitar aqui"}
                            </AdminBtn>
                            {(contract.branchMode ?? "ALL") === "SELECTED" ? (
                                <AdminBtn variant="secondary" onClick={onApplyToAll} disabled={saving}>
                                    Aplicar a todas as filiais
                                </AdminBtn>
                            ) : null}
                        </div>
                        <p style={{ ...muted, marginTop: 8 }}>
                            {(contract.branchMode ?? "ALL") === "ALL"
                                ? "O contrato hoje vale para todas as filiais, inclusive as cadastradas depois. Desabilitar aqui passa a listar filial por filial."
                                : "O contrato vale apenas nas filiais marcadas. Filial nova não é incluída automaticamente."}
                        </p>
                    </AdminSection>

                    <AdminSection title="Contrato do cliente (somente leitura)">
                        <div style={{ display: "flex", gap: 24, flexWrap: "wrap", ...muted }}>
                            <span>Status: {operationalLabel(contract.operationalStatus)}</span>
                            <span>Tipo: {contract.contractType === "ANNUAL" ? "Anual" : "Mensal"}</span>
                            <span>
                                Valor acordado:{" "}
                                {contract.agreedAmount != null
                                    ? contract.agreedAmount.toLocaleString("pt-BR", {
                                          style: "currency",
                                          currency: "BRL",
                                      })
                                    : "—"}
                            </span>
                            <span>Com I.A.: {contract.withAi ? "Sim" : "Não"}</span>
                        </div>
                        <p style={{ ...muted, marginTop: 8 }}>
                            Valores, descontos e vencimentos são do contrato do cliente e se editam em &ldquo;Todas as
                            filiais&rdquo;.
                        </p>
                    </AdminSection>
                </>
            )}
        </>
    );
}

export function ClientSistemas({ clientId }: { clientId: string }) {
    const [contracts, setContracts] = useState<ClientContractedSystem[]>([]);
    const [catalog, setCatalog] = useState<ProductSystem[]>([]);
    const [branches, setBranches] = useState<ClientBranch[]>([]);
    const [scope, setScope] = useState<BranchScope>("ALL");
    const [selectedProductId, setSelectedProductId] = useState<string>("");
    const [form, setForm] = useState<ClientContractedSystemCreateDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const selectedProduct = catalog.find((item) => item.id === selectedProductId) ?? null;
    const selectedContract = contracts.find((item) => item.productSystemId === selectedProductId) ?? null;
    const isEnabled = Boolean(selectedContract);
    // Sem filiais o cliente é só a matriz, e escolher escopo não teria significado.
    const hasBranches = branches.length > 0;

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const [contractRows, systems, branchRows] = await Promise.all([
                clientContractedSystemService.getByClientId(clientId),
                productSystemService.getAll(),
                clientBranchService.getByClientId(clientId),
            ]);
            setBranches(branchRows);
            const activeCatalog = systems
                .filter((item) => item.status === "ACTIVE")
                .filter((item) => isProductSystemKeyVisible(item.key));
            setContracts(contractRows);
            setCatalog(activeCatalog);

            setSelectedProductId((prev) => {
                if (prev && activeCatalog.some((item) => item.id === prev)) return prev;
                const firstContracted = activeCatalog.find((item) =>
                    contractRows.some((row) => row.productSystemId === item.id),
                );
                return firstContracted?.id ?? activeCatalog[0]?.id ?? "";
            });
        } catch (err) {
            ExceptionCapture.handle(err, { fallbackMessage: "Falha ao carregar sistemas." });
        } finally {
            setLoading(false);
        }
    }, [clientId]);

    useEffect(() => {
        void load();
    }, [load]);

    useEffect(() => {
        if (!selectedProductId) {
            setForm(null);
            return;
        }
        const product = catalog.find((item) => item.id === selectedProductId);
        if (!product) {
            setForm(null);
            return;
        }
        const contract = contracts.find((item) => item.productSystemId === selectedProductId);
        setForm(contract ? toForm(clientId, contract) : emptyForm(clientId, product));
    }, [selectedProductId, catalog, contracts, clientId]);

    const updateForm = <K extends keyof ClientContractedSystemCreateDto>(
        key: K,
        value: ClientContractedSystemCreateDto[K],
    ) => {
        setForm((prev) => {
            if (!prev) return prev;
            if (key === "operationalStatus" && value === "ACTIVE") {
                // Reativar: limpa desativação residual e FORCE_LOGOUT do ciclo anterior.
                return {
                    ...prev,
                    operationalStatus: "ACTIVE",
                    deactivateAt: "",
                    sessionPolicy:
                        prev.sessionPolicy === "FORCE_LOGOUT" ? "KEEP_UNTIL_EXPIRY" : prev.sessionPolicy,
                };
            }
            return { ...prev, [key]: value };
        });
    };

    const selectProduct = (productId: string) => {
        setSelectedProductId(productId);
    };

    /**
     * Habilita ou desabilita o contrato no escopo selecionado. Desabilitar um escopo enquanto o
     * contrato está em ALL só ganha significado se as demais filiais forem materializadas, então
     * nesse caso o modo passa a SELECTED com todo o resto marcado.
     */
    const toggleScope = async (enable: boolean) => {
        if (!selectedContract) return;
        const branchIds = branches.map((branch) => branch.id);
        const currentMode = selectedContract.branchMode ?? "ALL";
        const currentHq = currentMode === "ALL" ? true : Boolean(selectedContract.includeHeadquarters);
        const currentBranches =
            currentMode === "ALL" ? branchIds : (selectedContract.clientBranchIds ?? []);

        const nextHq = scope === "HQ" ? enable : currentHq;
        const nextBranches = branchIds.filter((id) =>
            id === scope ? enable : currentBranches.includes(id),
        );

        setSaving(true);
        try {
            const updated = await clientContractedSystemService.update(selectedContract.id, {
                ...toPayload(clientId, selectedContract),
                branchMode: "SELECTED",
                includeHeadquarters: nextHq,
                clientBranchIds: nextBranches,
            });
            setContracts((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
            toast.success(enable ? "Sistema habilitado nesta filial." : "Sistema desabilitado nesta filial.");
        } catch (err) {
            ExceptionCapture.handle(err, { fallbackMessage: "Falha ao alterar o escopo do sistema." });
        } finally {
            setSaving(false);
        }
    };

    const applyToAllBranches = async () => {
        if (!selectedContract) return;
        setSaving(true);
        try {
            const updated = await clientContractedSystemService.update(selectedContract.id, {
                ...toPayload(clientId, selectedContract),
                branchMode: "ALL",
                includeHeadquarters: true,
                clientBranchIds: [],
            });
            setContracts((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
            toast.success("Sistema aplicado a todas as filiais.");
        } catch (err) {
            ExceptionCapture.handle(err, { fallbackMessage: "Falha ao alterar o escopo do sistema." });
        } finally {
            setSaving(false);
        }
    };

    const save = async () => {
        if (!form || !selectedProduct) return;
        setSaving(true);
        try {
            const operationalStatus = form.operationalStatus || "ACTIVE";
            let sessionPolicy = form.sessionPolicy || "KEEP_UNTIL_EXPIRY";
            let deactivateAt = fromDateTimeLocalValue(form.deactivateAt);
            // ACTIVE sem agendamento futuro: não enviar deactivateAt/FORCE_LOGOUT residuais.
            if (operationalStatus === "ACTIVE") {
                if (sessionPolicy === "FORCE_LOGOUT") {
                    sessionPolicy = "KEEP_UNTIL_EXPIRY";
                }
                if (sessionPolicy !== "SCHEDULED") {
                    deactivateAt = undefined;
                } else if (deactivateAt && new Date(deactivateAt).getTime() <= Date.now()) {
                    deactivateAt = undefined;
                    sessionPolicy = "KEEP_UNTIL_EXPIRY";
                }
            }
            const payload: ClientContractedSystemCreateDto = {
                ...form,
                clientId,
                productSystemId: selectedProduct.id,
                operationalStatus,
                contractDate: form.contractDate?.trim() || undefined,
                endDate: form.endDate?.trim() || undefined,
                dueDay: form.dueDay?.trim() || undefined,
                lateTolerance: form.lateTolerance?.trim() || undefined,
                notes: form.notes?.trim() || undefined,
                withAi: Boolean(form.withAi),
                sessionPolicy,
                effectiveFrom: fromDateTimeLocalValue(form.effectiveFrom),
                deactivateAt,
            };
            if (payload.sessionPolicy === "SCHEDULED" && !payload.deactivateAt) {
                toast.error("Informe a data de desativação para a política Agendar.");
                setSaving(false);
                return;
            }

            if (selectedContract) {
                const updated = await clientContractedSystemService.update(selectedContract.id, payload);
                setContracts((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
                toast.success("Dados do sistema atualizados.");
            } else {
                const created = await clientContractedSystemService.create(payload);
                setContracts((prev) => [created, ...prev]);
                toast.success("Sistema habilitado para este cliente.");
            }
        } catch (err) {
            ExceptionCapture.handle(err, { fallbackMessage: "Falha ao salvar sistema." });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div style={{ fontSize: 13, color: "var(--ga-text-muted)" }}>Carregando sistemas...</div>;
    }

    if (catalog.length === 0) {
        return (
            <div style={{ fontSize: 13, color: "var(--ga-text-muted)" }}>
                Nenhum sistema no catálogo. Cadastre em Sistemas antes de habilitar para o cliente.
            </div>
        );
    }

    return (
        <div style={{ height: "100%", minHeight: 0, display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", gap: 16, flex: 1, minHeight: 0 }}>
                {hasBranches ? (
                    <div
                        style={{
                            width: 200,
                            flexShrink: 0,
                            border: "1px solid var(--ga-border)",
                            borderRadius: "var(--ga-radius-sm)",
                            overflow: "auto",
                            background: "var(--ga-surface)",
                        }}
                    >
                        {[
                            { id: "ALL" as BranchScope, title: "Todas as filiais", subtitle: "Contrato do cliente" },
                            { id: "HQ" as BranchScope, title: "Matriz", subtitle: "Dados Básicos" },
                            ...branches.map((branch) => ({
                                id: branch.id as BranchScope,
                                title: branch.tradeName?.trim() || branch.legalName,
                                subtitle: branch.cnpj,
                            })),
                        ].map((option) => {
                            const active = scope === option.id;
                            return (
                                <div
                                    key={option.id}
                                    onClick={() => setScope(option.id)}
                                    style={{
                                        padding: "11px 14px",
                                        cursor: "pointer",
                                        borderBottom: "1px solid var(--ga-border)",
                                        background: active ? "var(--ga-primary-50)" : "var(--ga-surface)",
                                        borderLeft: active
                                            ? "3px solid var(--ga-primary)"
                                            : "3px solid transparent",
                                    }}
                                >
                                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ga-text)" }}>
                                        {option.title}
                                    </div>
                                    <div style={{ fontSize: 11, color: "var(--ga-text-subtle)", marginTop: 2 }}>
                                        {option.subtitle}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : null}

                <div
                    style={{
                        width: 220,
                        flexShrink: 0,
                        border: "1px solid var(--ga-border)",
                        borderRadius: "var(--ga-radius-sm)",
                        overflow: "auto",
                        background: "var(--ga-surface)",
                    }}
                >
                    {catalog.map((system) => {
                        const contract = contracts.find((item) => item.productSystemId === system.id);
                        const active = selectedProductId === system.id;
                        const enabled = hasBranches
                            ? contractAppliesTo(contract, scope)
                            : Boolean(contract);
                        const disabledLabel = contract ? "Fora deste escopo" : "Não habilitado";
                        return (
                            <div
                                key={system.id}
                                onClick={() => selectProduct(system.id)}
                                style={{
                                    padding: "11px 14px",
                                    cursor: "pointer",
                                    borderBottom: "1px solid var(--ga-border)",
                                    background: active ? "var(--ga-primary-50)" : "var(--ga-surface)",
                                    borderLeft: active
                                        ? "3px solid var(--ga-primary)"
                                        : "3px solid transparent",
                                }}
                            >
                                <div
                                    style={{
                                        fontSize: 11,
                                        fontWeight: 700,
                                        color: "var(--ga-primary)",
                                        marginBottom: 2,
                                    }}
                                >
                                    {system.key}
                                </div>
                                <div
                                    style={{
                                        fontSize: 13,
                                        fontWeight: 600,
                                        color: "var(--ga-text)",
                                        marginBottom: 5,
                                    }}
                                >
                                    {system.name}
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                                    <AdminStatusIcon
                                        status={enabled ? operationalLabel(contract?.operationalStatus) : "Inativo"}
                                    />
                                    <span
                                        style={{
                                            fontSize: 11,
                                            color: enabled
                                                ? statusColor(contract?.operationalStatus)
                                                : "var(--ga-text-subtle)",
                                            fontWeight: 600,
                                        }}
                                    >
                                        {enabled ? operationalLabel(contract?.operationalStatus) : disabledLabel}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div
                    style={{
                        flex: 1,
                        border: "1px solid var(--ga-border)",
                        borderRadius: "var(--ga-radius-sm)",
                        background: "var(--ga-surface)",
                        overflow: "auto",
                        padding: 18,
                    }}
                >
                    {selectedProduct && form ? (
                        hasBranches && scope !== "ALL" ? (
                            <BranchScopePanel
                                product={selectedProduct}
                                contract={selectedContract}
                                scopeLabel={
                                    scope === "HQ"
                                        ? "Matriz"
                                        : (branches.find((branch) => branch.id === scope)?.tradeName?.trim() ??
                                          branches.find((branch) => branch.id === scope)?.legalName ??
                                          "Filial")
                                }
                                enabled={contractAppliesTo(selectedContract ?? undefined, scope)}
                                saving={saving}
                                onToggle={(enable) => void toggleScope(enable)}
                                onApplyToAll={() => void applyToAllBranches()}
                            />
                        ) : (
                        <>
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    gap: 8,
                                    marginBottom: 16,
                                }}
                            >
                                <div>
                                    <div style={{ fontSize: 12, color: "var(--ga-primary)", fontWeight: 700 }}>
                                        {selectedProduct.key}
                                    </div>
                                    <div style={{ fontSize: 15, fontWeight: 700, color: "var(--ga-text)" }}>
                                        {selectedProduct.name}
                                    </div>
                                    <div style={{ fontSize: 12, color: "var(--ga-text-muted)", marginTop: 2 }}>
                                        {isEnabled
                                            ? "Sistema habilitado — edite os dados do contrato abaixo."
                                            : "Clique em Salvar para habilitar este sistema para o cliente."}
                                    </div>
                                </div>
                                <AdminBtn onClick={() => void save()} disabled={saving}>
                                    {saving ? "Salvando..." : isEnabled ? "Salvar Alterações" : "Habilitar e Salvar"}
                                </AdminBtn>
                            </div>

                            <AdminSection title="Contrato">
                                <AdminFormGrid cols={3}>
                                    <AdminSelect
                                        label="Status operacional"
                                        value={form.operationalStatus ?? "ACTIVE"}
                                        onChange={(v) => updateForm("operationalStatus", v)}
                                        options={[
                                            { value: "ACTIVE", label: "Ativo" },
                                            { value: "INACTIVE", label: "Inativo" },
                                            { value: "PAUSED", label: "Pausado" },
                                            { value: "CANCELLED", label: "Cancelado" },
                                        ]}
                                    />
                                    <AdminSelect
                                        label="Tipo de contrato"
                                        value={form.contractType ?? "MONTHLY"}
                                        onChange={(v) => updateForm("contractType", v)}
                                        options={[
                                            { value: "MONTHLY", label: "Mensal" },
                                            { value: "ANNUAL", label: "Anual" },
                                        ]}
                                    />
                                    <AdminSelect
                                        label="Com I.A."
                                        value={form.withAi ? "true" : "false"}
                                        onChange={(v) => updateForm("withAi", v === "true")}
                                        options={[
                                            { value: "false", label: "Não" },
                                            { value: "true", label: "Sim" },
                                        ]}
                                    />
                                </AdminFormGrid>
                            </AdminSection>

                            <AdminSection title="Ciclo de vida e sessões">
                                <AdminFormGrid cols={3}>
                                    <AdminSelect
                                        label="Política de sessão"
                                        value={form.sessionPolicy ?? "KEEP_UNTIL_EXPIRY"}
                                        onChange={(v) => updateForm("sessionPolicy", v)}
                                        options={[
                                            {
                                                value: "FORCE_LOGOUT",
                                                label: "Deslogar agora (revoga refresh)",
                                            },
                                            {
                                                value: "KEEP_UNTIL_EXPIRY",
                                                label: "Manter sessões até expirar",
                                            },
                                            {
                                                value: "SCHEDULED",
                                                label: "Agendar desativação",
                                            },
                                        ]}
                                    />
                                    <AdminInput
                                        label="Vigência a partir de"
                                        type="datetime-local"
                                        value={form.effectiveFrom ?? ""}
                                        onChange={(v) => updateForm("effectiveFrom", v)}
                                    />
                                    <AdminInput
                                        label="Desativar em"
                                        type="datetime-local"
                                        value={form.deactivateAt ?? ""}
                                        onChange={(v) => updateForm("deactivateAt", v)}
                                    />
                                </AdminFormGrid>
                                <p style={{ marginTop: 8, fontSize: 12, color: "var(--ga-text-muted)" }}>
                                    Em Agendar, o sistema continua visível no Gommo até a data. Deslogar agora revoga
                                    imediatamente as sessões do tenant (refresh) ao salvar — o usuário cai no próximo
                                    request autenticado.
                                </p>
                            </AdminSection>

                            <AdminSection title="Valores">
                                <AdminFormGrid cols={3}>
                                    <AdminCurrency
                                        label="Valor negociado"
                                        value={form.negotiatedAmount}
                                        onChange={(v) => updateForm("negotiatedAmount", v)}
                                    />
                                    <AdminInput
                                        label="Desconto (%)"
                                        value={form.discountPercent != null ? String(form.discountPercent) : ""}
                                        onChange={(v) => updateForm("discountPercent", parseOptionalNumber(v))}
                                    />
                                    <AdminCurrency
                                        label="Valor acordado"
                                        value={form.agreedAmount}
                                        onChange={(v) => updateForm("agreedAmount", v)}
                                    />
                                </AdminFormGrid>
                            </AdminSection>

                            <AdminSection title="Datas e vencimento">
                                <AdminFormGrid cols={3}>
                                    <AdminInput
                                        label="Data do contrato"
                                        value={form.contractDate ?? ""}
                                        onChange={(v) => updateForm("contractDate", v)}
                                        type="date"
                                    />
                                    <AdminInput
                                        label="Data final"
                                        value={form.endDate ?? ""}
                                        onChange={(v) => updateForm("endDate", v)}
                                        type="date"
                                    />
                                    <AdminInput
                                        label="Vencimento (dia)"
                                        value={form.dueDay ?? ""}
                                        onChange={(v) => updateForm("dueDay", v.slice(0, 2))}
                                        placeholder="01"
                                    />
                                    <AdminInput
                                        label="Tolerância de atraso"
                                        value={form.lateTolerance ?? ""}
                                        onChange={(v) => updateForm("lateTolerance", v)}
                                    />
                                    <div style={{ gridColumn: "span 2" }}>
                                        <AdminInput
                                            label="Observações"
                                            value={form.notes ?? ""}
                                            onChange={(v) => updateForm("notes", v)}
                                        />
                                    </div>
                                </AdminFormGrid>
                            </AdminSection>
                        </>
                        )
                    ) : (
                        <div style={{ fontSize: 13, color: "var(--ga-text-muted)" }}>
                            Selecione um sistema na lista ao lado.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
