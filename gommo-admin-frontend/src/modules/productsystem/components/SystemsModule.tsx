"use client";

import { Plus, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { ProductSystemCadastro } from "@/modules/productsystem/components/ProductSystemCadastro";
import type { ProductSystem } from "@/modules/productsystem/dto/productsystem.dto";
import { statusLabel } from "@/modules/productsystem/lib/productsystem.mapper";
import { productSystemService } from "@/modules/productsystem/services/productsystem.service";
import { AdminBadge } from "@/shared/components/ui/admin/AdminBadge";
import { AdminBtn } from "@/shared/components/ui/admin/AdminBtn";
import { AdminDataGrid } from "@/shared/components/ui/admin/AdminDataGrid";
import { AdminModuleToolbar } from "@/shared/components/ui/admin/AdminModuleToolbar";
import { AdminPagination } from "@/shared/components/ui/admin/AdminPagination";
import { AdminSearchBar } from "@/shared/components/ui/admin/AdminSearchBar";
import { ExceptionCapture } from "@/shared/exceptions/exception-capture";
import { useOptimisticPath } from "@/shared/hooks/useOptimisticPath";
import { systemsCadastroPath, systemsListPath } from "@/shared/routing/admin-nav";

type SystemsPathState = {
    view: "listagem" | "cadastro";
    recordId: string;
};

const parseSystemsPath = (pathname: string): SystemsPathState => {
    const segments = pathname.split("/").filter(Boolean).slice(1);
    const view = segments[0] === "cadastro" ? "cadastro" : "listagem";
    const recordId = view === "cadastro" ? (segments[1] ?? "") : "";
    return { view, recordId };
};

const sameSystemsPath = (a: SystemsPathState, b: SystemsPathState) =>
    a.view === b.view && a.recordId === b.recordId;

function money(value?: number) {
    if (value == null) return "—";
    return `R$ ${Number(value).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
}

export function SystemsModule() {
    const { pathname, current, navigate, fromPath } = useOptimisticPath(parseSystemsPath, sameSystemsPath);
    const { view, recordId } = current;

    const [systems, setSystems] = useState<ProductSystem[]>([]);
    const [selected, setSelected] = useState<ProductSystem | null>(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const perPage = 10;

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const data = await productSystemService.getAll();
            setSystems(data);
        } catch (err) {
            ExceptionCapture.handle(err, { fallbackMessage: "Falha ao carregar sistemas." });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void load();
    }, [load]);

    useEffect(() => {
        if (view !== "cadastro" || !recordId || recordId === "novo") {
            if (recordId === "novo") setSelected(null);
            return;
        }
        const cached = systems.find((item) => item.id === recordId);
        if (cached) {
            setSelected(cached);
            return;
        }
        let cancelled = false;
        void productSystemService
            .getById(recordId)
            .then((item) => {
                if (!cancelled) setSelected(item);
            })
            .catch(() => {
                if (!cancelled) {
                    navigate(systemsListPath(), { view: "listagem", recordId: "" }, "replace");
                }
            });
        return () => {
            cancelled = true;
        };
    }, [view, recordId, systems, navigate]);

    useEffect(() => {
        const segments = pathname.split("/").filter(Boolean).slice(1);
        if (segments.length === 0) {
            navigate(systemsListPath(), { view: "listagem", recordId: "" }, "replace");
            return;
        }
        if (fromPath.view === "cadastro" && !fromPath.recordId) {
            navigate(systemsListPath(), { view: "listagem", recordId: "" }, "replace");
        }
    }, [pathname, fromPath, navigate]);

    const filtered = systems.filter((item) => {
        const q = search.toLowerCase();
        return (
            item.name.toLowerCase().includes(q) ||
            item.key.toLowerCase().includes(q) ||
            (item.description ?? "").toLowerCase().includes(q)
        );
    });
    const paged = filtered.slice((page - 1) * perPage, page * perPage);

    const openCadastro = (item: ProductSystem) => {
        navigate(systemsCadastroPath(item.id), { view: "cadastro", recordId: item.id });
    };

    const onTabSelect = (key: string) => {
        if (key === "listagem") {
            navigate(systemsListPath(), { view: "listagem", recordId: "" });
            return;
        }
        if (recordId && recordId !== "novo") {
            navigate(systemsCadastroPath(recordId), { view: "cadastro", recordId });
            return;
        }
        if (selected) {
            navigate(systemsCadastroPath(selected.id), { view: "cadastro", recordId: selected.id });
            return;
        }
        navigate(systemsCadastroPath("novo"), { view: "cadastro", recordId: "novo" });
    };

    const handleSaved = async (item: ProductSystem) => {
        await load();
        setSelected(item);
        if (recordId === "novo" || recordId !== item.id) {
            navigate(systemsCadastroPath(item.id), { view: "cadastro", recordId: item.id }, "replace");
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
                            navigate(systemsCadastroPath("novo"), {
                                view: "cadastro",
                                recordId: "novo",
                            })
                        }
                    >
                        Novo Sistema
                    </AdminBtn>
                }
            />

            <div style={{ flex: 1, overflowY: "auto", padding: 20 }}>
                {view === "listagem" ? (
                    <>
                        <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                            <AdminSearchBar
                                value={search}
                                onChange={(value) => {
                                    setSearch(value);
                                    setPage(1);
                                }}
                                placeholder="Pesquisar por chave, nome..."
                            />
                            <AdminBtn
                                variant="secondary"
                                size="sm"
                                icon={<RefreshCw size={12} />}
                                onClick={() => void load()}
                            >
                                Atualizar
                            </AdminBtn>
                        </div>
                        <div style={{ fontSize: 11, color: "var(--ga-text-subtle)", marginBottom: 8 }}>
                            {loading
                                ? "Carregando..."
                                : "Dica: duplo clique na linha para abrir o cadastro"}
                        </div>
                        <AdminDataGrid
                            cols={[
                                { key: "key", label: "Chave", width: 90 },
                                { key: "name", label: "Nome" },
                                {
                                    key: "defaultPrice",
                                    label: "Preço padrão",
                                    width: 130,
                                    render: (value) => money(value as number | undefined),
                                },
                                {
                                    key: "withAiAvailable",
                                    label: "I.A.",
                                    width: 70,
                                    render: (value) => (value ? "Sim" : "Não"),
                                },
                                {
                                    key: "status",
                                    label: "Status",
                                    width: 90,
                                    render: (value) => <AdminBadge status={statusLabel(String(value))} />,
                                },
                            ]}
                            rows={paged as unknown as Record<string, unknown>[]}
                            onDoubleClick={(row) => openCadastro(row as unknown as ProductSystem)}
                            emptyMsg={loading ? "Carregando..." : "Nenhum sistema cadastrado."}
                        />
                        <AdminPagination
                            page={page}
                            total={filtered.length}
                            perPage={perPage}
                            onChange={setPage}
                        />
                    </>
                ) : (
                    <ProductSystemCadastro
                        key={recordId || "novo"}
                        system={selected}
                        isNew={recordId === "novo"}
                        onSaved={handleSaved}
                    />
                )}
            </div>
        </div>
    );
}
