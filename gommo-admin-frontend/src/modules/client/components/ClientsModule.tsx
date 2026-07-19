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
import { AdminModuleToolbar } from "@/shared/components/ui/admin/AdminModuleToolbar";
import { AdminPagination } from "@/shared/components/ui/admin/AdminPagination";
import { AdminSearchBar } from "@/shared/components/ui/admin/AdminSearchBar";
import { ExceptionCapture } from "@/shared/exceptions/exception-capture";
import { useOptimisticPath } from "@/shared/hooks/useOptimisticPath";
import {
    clientsFormPath,
    clientsListPath,
    type ClientSubTabKey,
    isClientSubTab,
} from "@/shared/routing/admin-nav";
import { DataType } from "@/shared/types/data-type";

type ClientsPathState = {
    view: "list" | "form";
    recordId: string;
    subTab: ClientSubTabKey;
};

const parseClientsPath = (pathname: string): ClientsPathState => {
    const segments = pathname.split("/").filter(Boolean).slice(1);
    const view = segments[0] === "form" ? "form" : "list";
    const recordId = view === "form" ? (segments[1] ?? "") : "";
    const subTabParam = view === "form" ? (segments[2] ?? "") : "";
    const subTab: ClientSubTabKey = isClientSubTab(subTabParam) ? subTabParam : "basics";
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
        if (view !== "form" || !recordId || recordId === "new") {
            if (recordId === "new") setSelectedClient(null);
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
                    navigate(clientsListPath(), { view: "list", recordId: "", subTab: "basics" }, "replace");
                }
            });
        return () => {
            cancelled = true;
        };
    }, [view, recordId, clients, navigate]);

    useEffect(() => {
        const segments = pathname.split("/").filter(Boolean).slice(1);
        if (segments.length === 0) {
            navigate(clientsListPath(), { view: "list", recordId: "", subTab: "basics" }, "replace");
            return;
        }
        if (fromPath.view === "form" && !fromPath.recordId) {
            navigate(clientsListPath(), { view: "list", recordId: "", subTab: "basics" }, "replace");
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

    const openForm = (client: Client) => {
        navigate(clientsFormPath(client.id, "basics"), {
            view: "form",
            recordId: client.id,
            subTab: "basics",
        });
    };

    const onTabSelect = (key: string) => {
        if (key === "list") {
            navigate(clientsListPath(), { view: "list", recordId: "", subTab: "basics" });
            return;
        }
        if (recordId && recordId !== "new") {
            navigate(clientsFormPath(recordId, "basics"), {
                view: "form",
                recordId,
                subTab: "basics",
            });
            return;
        }
        if (selectedClient) {
            navigate(clientsFormPath(selectedClient.id, "basics"), {
                view: "form",
                recordId: selectedClient.id,
                subTab: "basics",
            });
            return;
        }
        navigate(clientsFormPath("new", "basics"), {
            view: "form",
            recordId: "new",
            subTab: "basics",
        });
    };

    const handleSaved = async (client: Client) => {
        await loadClients();
        setSelectedClient(client);
        if (recordId === "new" || recordId !== client.id) {
            navigate(clientsFormPath(client.id, subTab), {
                view: "form",
                recordId: client.id,
                subTab,
            }, "replace");
        }
    };

    return (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <AdminModuleToolbar
                tabs={[
                    { key: "list", label: "Listagem" },
                    { key: "form", label: "Cadastro" },
                ]}
                active={view}
                onSelect={onTabSelect}
                actions={
                    <AdminBtn
                        icon={<Plus size={13} />}
                        onClick={() =>
                            navigate(clientsFormPath("new", "basics"), {
                                view: "form",
                                recordId: "new",
                                subTab: "basics",
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
                    overflow: view === "list" ? "auto" : "hidden",
                }}
            >
                {view === "list" ? (
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
                                { key: "document", label: "CNPJ", width: 160, dataType: DataType.CNPJ },
                                { key: "name", label: "Nome Fantasia", dataType: DataType.STRING },
                                { key: "legalName", label: "Razão Social", dataType: DataType.STRING },
                                { key: "contactEmail", label: "Email", dataType: DataType.EMAIL },
                                { key: "contactPhone", label: "Telefones", width: 160, dataType: DataType.PHONE },
                                {
                                    key: "status",
                                    label: "Status",
                                    width: 90,
                                    render: (value) => <AdminBadge status={statusLabel(String(value))} />,
                                },
                            ]}
                            rows={paged as unknown as Record<string, unknown>[]}
                            onDoubleClick={(row) => openForm(row as unknown as Client)}
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
                        key={recordId || "new"}
                        client={selectedClient}
                        isNew={recordId === "new"}
                        subTab={subTab}
                        onSubTabChange={(next) => {
                            if (!recordId) return;
                            navigate(clientsFormPath(recordId, next), {
                                view: "form",
                                recordId,
                                subTab: next,
                            });
                        }}
                        onSaved={handleSaved}
                        onCancel={() =>
                            navigate(clientsListPath(), {
                                view: "list",
                                recordId: "",
                                subTab: "basics",
                            })
                        }
                        defaultSlugHint={slugFromName}
                    />
                )}
            </div>
        </div>
    );
}
