"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { CLIENT_CLIENT_MESSAGES } from "@/modules/client/exceptions/client.messages";
import type { ClientCreateDto } from "@/modules/client/dto/client.dto";
import { emptyClientForm, clientToFormDto } from "@/modules/client/lib/client.mapper";
import { clientKeys } from "@/modules/client/client.query";
import { clientService } from "@/modules/client/services/client.service";
import { useCrudScreen } from "@/shared/components/crud/CrudScreen";
import { CrudFormShell } from "@/shared/components/crud/CrudFormShell";
import { useSyncWorkspaceTabTitle } from "@/shared/workspace/useSyncWorkspaceTabTitle";
import { ExceptionCapture } from "@/shared/exceptions";
import { Button } from "@/shared/components/ui/Button";
import { InputSelect, InputString } from "@/shared/components/ui/input/index";

export function ClientFormClient() {
    const { editingId, isEditing, goToList } = useCrudScreen();
    const queryClient = useQueryClient();
    const [form, setForm] = useState<ClientCreateDto>(emptyClientForm());
    const [error, setError] = useState<string | null>(null);

    const detailQuery = useQuery({
        queryKey: clientKeys.detail(editingId ?? ""),
        queryFn: () => clientService.getById(editingId!),
        enabled: isEditing && Boolean(editingId),
    });

    useSyncWorkspaceTabTitle(detailQuery.data ?? null);

    useEffect(() => {
        if (!isEditing) {
            setForm(emptyClientForm());
            setError(null);
            return;
        }
        if (detailQuery.data) {
            setForm(clientToFormDto(detailQuery.data));
            setError(null);
        }
    }, [isEditing, detailQuery.data]);

    const testConnectionMutation = useMutation({
        mutationFn: () => clientService.testDatabaseConnection(editingId!),
        onSuccess: (result) => {
            if (result.success) {
                toast.success(result.message + (result.latencyMs ? ` (${result.latencyMs} ms)` : ""));
            } else {
                toast.error(result.message);
            }
        },
        onError: (err: unknown) => {
            toast.error(
                ExceptionCapture.handle(err, { fallbackMessage: "Falha ao testar conexão." }).displayMessage,
            );
        },
    });

    const provisionMutation = useMutation({
        mutationFn: () => clientService.startProvisioning(editingId!),
        onSuccess: async (client) => {
            await queryClient.invalidateQueries({ queryKey: clientKeys.all });
            await queryClient.invalidateQueries({ queryKey: clientKeys.detail(editingId!) });
            setForm(clientToFormDto(client));
            toast.success(`Provisionamento: ${client.provisioningStatus}`);
        },
        onError: (err: unknown) => {
            toast.error(
                ExceptionCapture.handle(err, { fallbackMessage: "Falha ao provisionar tenant." }).displayMessage,
            );
        },
    });

    const saveMutation = useMutation({
        mutationFn: async (dto: ClientCreateDto) => {
            if (isEditing && editingId) return clientService.update(editingId, dto);
            return clientService.create(dto);
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: clientKeys.all });
            toast.success(isEditing ? "Cliente atualizado" : "Cliente cadastrado");
            goToList();
        },
        onError: (err: unknown) => {
            const ex = ExceptionCapture.handle(err, { fallbackMessage: CLIENT_CLIENT_MESSAGES.CLIENT_SAVE_FAILED });
            setError(ex.displayMessage);
        },
    });

    const update = <K extends keyof ClientCreateDto>(field: K, value: ClientCreateDto[K]) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const routingItems = [
        { value: "SUBDOMAIN", label: "Subdomínio Gommo (tenant.gommo.com)" },
        { value: "CUSTOM_DOMAIN", label: "Domínio customizado (rh.cliente.com)" },
    ];

    const strategyItems = [
        { value: "DEDICATED_DATABASE", label: "Banco dedicado por cliente" },
        { value: "DEDICATED_SCHEMA", label: "Schema dedicado por cliente" },
    ];

    const provisioningItems = [
        { value: "PENDING", label: "Pendente" },
        { value: "PROVISIONING", label: "Provisionando" },
        { value: "READY", label: "Pronto" },
        { value: "ERROR", label: "Erro" },
        { value: "SUSPENDED", label: "Suspenso" },
    ];

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        saveMutation.mutate(form);
    };

    if (isEditing && detailQuery.isLoading) {
        return (
            <div className="gommo-crud-panel-inset grid gap-2">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="skeleton-shimmer h-10 w-full" />
                ))}
            </div>
        );
    }

    return (
        <CrudFormShell
            title={isEditing ? "Editar cliente" : "Novo cliente"}
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
                <div className="border-b border-[var(--gommo-border-subtle)] pb-2">
                    <p className="text-sm font-semibold text-base-content">Cliente</p>
                    <p className="text-xs text-base-content/55">Dados comerciais e contato principal.</p>
                </div>
                <InputString label="Nome" value={form.name} onValueChange={(v) => update("name", v)} required />
                <InputString label="Slug" value={form.slug} onValueChange={(v) => update("slug", v)} required />
                <InputString label="Documento (CNPJ)" value={form.document ?? ""} onValueChange={(v) => update("document", v)} />
                <InputString label="E-mail de contato" value={form.contactEmail ?? ""} onValueChange={(v) => update("contactEmail", v)} />
                <InputString label="Telefone" value={form.contactPhone ?? ""} onValueChange={(v) => update("contactPhone", v)} />
                <InputString label="Observações" value={form.notes ?? ""} onValueChange={(v) => update("notes", v)} />

                <div className="mt-2 border-b border-[var(--gommo-border-subtle)] pb-2">
                    <p className="text-sm font-semibold text-base-content">Roteamento DNS</p>
                    <p className="text-xs text-base-content/55">Como o tenant será resolvido para direcionar conexão de banco.</p>
                </div>
                <InputSelect
                    label="Modo de roteamento"
                    value={form.routingMode ?? "SUBDOMAIN"}
                    onValueChange={(v) => update("routingMode", v)}
                    items={routingItems}
                    required
                />
                <InputString
                    label="Subdomínio"
                    value={form.subdomain ?? ""}
                    onValueChange={(v) => update("subdomain", v)}
                    hint="Ex.: acme (gera acme.gommo.com)"
                />
                <InputString
                    label="Domínio customizado"
                    value={form.customDomain ?? ""}
                    onValueChange={(v) => update("customDomain", v)}
                    hint="Ex.: rh.acme.com"
                />

                <div className="mt-2 border-b border-[var(--gommo-border-subtle)] pb-2">
                    <p className="text-sm font-semibold text-base-content">Conexão de dados do tenant</p>
                    <p className="text-xs text-base-content/55">Metadados para resolver o banco/schema dedicado de cada cliente.</p>
                </div>
                <InputSelect
                    label="Estratégia de banco"
                    value={form.databaseStrategy ?? "DEDICATED_DATABASE"}
                    onValueChange={(v) => update("databaseStrategy", v)}
                    items={strategyItems}
                    required
                />
                <InputString label="Host do banco" value={form.databaseHost ?? ""} onValueChange={(v) => update("databaseHost", v)} />
                <InputString
                    label="Porta"
                    value={String(form.databasePort ?? "")}
                    onValueChange={(v) => update("databasePort", v ? Number(v) : undefined)}
                />
                <InputString label="Nome do banco" value={form.databaseName ?? ""} onValueChange={(v) => update("databaseName", v)} />
                <InputString label="Schema do tenant" value={form.databaseSchema ?? ""} onValueChange={(v) => update("databaseSchema", v)} />
                <InputString label="Usuário DB" value={form.databaseUser ?? ""} onValueChange={(v) => update("databaseUser", v)} />
                <InputString
                    label="Referência de segredo"
                    value={form.databaseSecretRef ?? ""}
                    onValueChange={(v) => update("databaseSecretRef", v)}
                    hint="Ex.: vault://tenants/acme/db"
                />

                <div className="mt-2 border-b border-[var(--gommo-border-subtle)] pb-2">
                    <p className="text-sm font-semibold text-base-content">Provisionamento</p>
                </div>
                <InputSelect
                    label="Status de provisionamento"
                    value={form.provisioningStatus ?? "PENDING"}
                    onValueChange={(v) => update("provisioningStatus", v)}
                    items={provisioningItems}
                    required
                />
                <InputString
                    label="Notas de provisionamento"
                    value={form.provisioningNotes ?? ""}
                    onValueChange={(v) => update("provisioningNotes", v)}
                />

                {isEditing && editingId ? (
                    <div className="mt-2 flex flex-wrap gap-2 border-t border-[var(--gommo-border-subtle)] pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            loading={testConnectionMutation.isPending}
                            onClick={() => testConnectionMutation.mutate()}
                        >
                            Testar conexão do banco
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            loading={provisionMutation.isPending}
                            onClick={() => provisionMutation.mutate()}
                        >
                            Executar provisionamento
                        </Button>
                    </div>
                ) : null}
            </div>
        </CrudFormShell>
    );
}
