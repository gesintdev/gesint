"use client";

import { Download, Plus, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { ClientCadastro } from "@/modules/client/components/ClientCadastro";
import type { Client } from "@/modules/client/dto/client.dto";
import { slugFromName, statusLabel } from "@/modules/client/lib/client.mapper";
import { clientService } from "@/modules/client/services/client.service";
import { AdminBadge } from "@/shared/components/ui/admin/AdminBadge";
import { AdminBtn } from "@/shared/components/ui/admin/AdminBtn";
import { AdminDataGrid } from "@/shared/components/ui/admin/AdminDataGrid";
import { AdminPagination } from "@/shared/components/ui/admin/AdminPagination";
import { AdminModuleToolbar } from "@/shared/components/ui/admin/AdminModuleToolbar";
import { AdminSearchBar } from "@/shared/components/ui/admin/AdminSearchBar";
import { ExceptionCapture } from "@/shared/exceptions/exception-capture";
import { useOptimisticPath } from "@/shared/hooks/useOptimisticPath";
import {
    clientsCadastroPath,
    clientsListPath,
    type ClientSubTabKey,
    isClientSubTab,
} from "@/shared/routing/admin-nav";

type ClientsPathState = {
    view: "listagem" | "cadastro";
    recordId: string;
    subTab: ClientSubTabKey;
};

const parseClientsPath = (pathname: string): ClientsPathState => {
    const segments = pathname.split("/").filter(Boolean).slice(1);
    const view = segments[0] === "cadastro" ? "cadastro" : "listagem";
    const recordId = view === "cadastro" ? (segments[1] ?? "") : "";
    const subTabParam = view === "cadastro" ? (segments[2] ?? "") : "";
    const subTab: ClientSubTabKey = isClientSubTab(subTabParam) ? subTabParam : "dados";
    return { view, recordId, subTab };
};

const sameClientsPath = (a: ClientsPathState, b: ClientsPathState) =>
    a.view === b.view && a.recordId === b.recordId && a.subTab === b.subTab;

export function ClientsModule() {
    const { pathname, current, navigate, fromPath } = useOptimisticPath(parseClientsPath, sameClientsPath);
    const { view, recordId, subTab } = current;

    const [clients, setClients] = useState<Client[]>([]);
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const perPage = 10;

    const loadClients = useCallback(async () => {
        setLoading(true);
        try {
            const data = await clientService.getAll();
            setClients(data);
        } catch (err) {
            ExceptionCapture.handle(err, { fallbackMessage: "Falha ao carregar clientes." });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadClients();
    }, [loadClients]);

    useEffect(() => {
        if (view !== "cadastro" || !recordId || recordId === "novo") {
            if (recordId === "novo") setSelectedClient(null);
            return;
        }
        const cached = clients.find((client) => client.id === recordId);
        if (cached) {
            setSelectedClient(cached);
            return;
        }
        let cancelled = false;
        void clientService
            .getById(recordId)
            .then((client) => {
                if (!cancelled) setSelectedClient(client);
            })
            .catch(() => {
                if (!cancelled) {
                    navigate(clientsListPath(), { view: "listagem", recordId: "", subTab: "dados" }, "replace");
                }
            });
        return () => {
            cancelled = true;
        };
    }, [view, recordId, clients, navigate]);

    useEffect(() => {
        const segments = pathname.split("/").filter(Boolean).slice(1);
        if (segments.length === 0) {
            navigate(clientsListPath(), { view: "listagem", recordId: "", subTab: "dados" }, "replace");
            return;
        }
        if (fromPath.view === "cadastro" && !fromPath.recordId) {
            navigate(clientsListPath(), { view: "listagem", recordId: "", subTab: "dados" }, "replace");
        }
    }, [pathname, fromPath, navigate]);

    const filtered = clients.filter((client) => {
        const q = search.toLowerCase();
        return (
            client.name.toLowerCase().includes(q) ||
            (client.document ?? "").includes(search) ||
            (client.legalName ?? "").toLowerCase().includes(q) ||
            (client.contactEmail ?? "").toLowerCase().includes(q) ||
            client.slug.toLowerCase().includes(q)
        );
    });
    const paged = filtered.slice((page - 1) * perPage, page * perPage);

    const openCadastro = (client: Client) => {
        navigate(clientsCadastroPath(client.id, "dados"), {
            view: "cadastro",
            recordId: client.id,
            subTab: "dados",
        });
    };

    const onTabSelect = (key: string) => {
        if (key === "listagem") {
            navigate(clientsListPath(), { view: "listagem", recordId: "", subTab: "dados" });
            return;
        }
        if (recordId && recordId !== "novo") {
            navigate(clientsCadastroPath(recordId, "dados"), {
                view: "cadastro",
                recordId,
                subTab: "dados",
            });
            return;
        }
        if (selectedClient) {
            navigate(clientsCadastroPath(selectedClient.id, "dados"), {
                view: "cadastro",
                recordId: selectedClient.id,
                subTab: "dados",
            });
            return;
        }
        navigate(clientsCadastroPath("novo", "dados"), {
            view: "cadastro",
            recordId: "novo",
            subTab: "dados",
        });
    };

    const handleSaved = async (client: Client) => {
        await loadClients();
        setSelectedClient(client);
        if (recordId === "novo" || recordId !== client.id) {
            navigate(clientsCadastroPath(client.id, subTab), {
                view: "cadastro",
                recordId: client.id,
                subTab,
            }, "replace");
        }
    };

    return (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <AdminModuleToolbar
                tabs={[
                    { key: "listagem", label: "Listagem" },
                    { key: "cadastro", label: "Cadastro" },
                ]}
                active={view}
                onSelect={onTabSelect}
                actions={
                    <AdminBtn
                        icon={<Plus size={13} />}
                        onClick={() =>
                            navigate(clientsCadastroPath("novo", "dados"), {
                                view: "cadastro",
                                recordId: "novo",
                                subTab: "dados",
                            })
                        }
                    >
                        Novo Cliente
                    </AdminBtn>
                }
            />

            <div
                style={{
                    flex: 1,
                    minHeight: 0,
                    display: "flex",
                    flexDirection: "column",
                    padding: 20,
                    overflow: view === "listagem" ? "auto" : "hidden",
                }}
            >
                {view === "listagem" ? (
                    <>
                        <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                            <AdminSearchBar
                                value={search}
                                onChange={(value) => {
                                    setSearch(value);
                                    setPage(1);
                                }}
                                placeholder="Pesquisar por nome fantasia, razão social, CNPJ, email..."
                            />
                            <AdminBtn
                                variant="secondary"
                                size="sm"
                                icon={<RefreshCw size={12} />}
                                onClick={() => void loadClients()}
                            >
                                Atualizar
                            </AdminBtn>
                            <AdminBtn variant="secondary" size="sm" icon={<Download size={12} />}>
                                Exportar
                            </AdminBtn>
                        </div>
                        <div style={{ fontSize: 11, color: "var(--ga-text-subtle)", marginBottom: 8 }}>
                            {loading
                                ? "Carregando..."
                                : "Dica: duplo clique na linha para abrir o cadastro"}
                        </div>
                        <AdminDataGrid
                            cols={[
                                { key: "document", label: "CNPJ", width: 160 },
                                { key: "name", label: "Nome Fantasia" },
                                { key: "legalName", label: "Razão Social" },
                                { key: "contactEmail", label: "Email" },
                                { key: "contactPhone", label: "Telefones", width: 160 },
                                {
                                    key: "status",
                                    label: "Status",
                                    width: 90,
                                    render: (value) => <AdminBadge status={statusLabel(String(value))} />,
                                },
                            ]}
                            rows={paged as unknown as Record<string, unknown>[]}
                            onDoubleClick={(row) => openCadastro(row as unknown as Client)}
                            emptyMsg={loading ? "Carregando..." : "Nenhum cliente encontrado."}
                        />
                        <AdminPagination
                            page={page}
                            total={filtered.length}
                            perPage={perPage}
                            onChange={setPage}
                        />
                    </>
                ) : (
                    <ClientCadastro
                        key={recordId || "novo"}
                        client={selectedClient}
                        isNew={recordId === "novo"}
                        subTab={subTab}
                        onSubTabChange={(next) => {
                            if (!recordId) return;
                            navigate(clientsCadastroPath(recordId, next), {
                                view: "cadastro",
                                recordId,
                                subTab: next,
                            });
                        }}
                        onSaved={handleSaved}
                        onCancel={() =>
                            navigate(clientsListPath(), {
                                view: "listagem",
                                recordId: "",
                                subTab: "dados",
                            })
                        }
                        defaultSlugHint={slugFromName}
                    />
                )}
            </div>
        </div>
    );
}
