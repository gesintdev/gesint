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
import { systemsFormPath, systemsListPath } from "@/shared/routing/admin-nav";
import { DataType } from "@/shared/types/data-type";

type SystemsPathState = {
    view: "list" | "form";
    recordId: string;
};

const parseSystemsPath = (pathname: string): SystemsPathState => {
    const segments = pathname.split("/").filter(Boolean).slice(1);
    const view = segments[0] === "form" ? "form" : "list";
    const recordId = view === "form" ? (segments[1] ?? "") : "";
    return { view, recordId };
};

const sameSystemsPath = (a: SystemsPathState, b: SystemsPathState) =>
    a.view === b.view && a.recordId === b.recordId;

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
        if (view !== "form" || !recordId || recordId === "new") {
            if (recordId === "new") setSelected(null);
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
                    navigate(systemsListPath(), { view: "list", recordId: "" }, "replace");
                }
            });
        return () => {
            cancelled = true;
        };
    }, [view, recordId, systems, navigate]);

    useEffect(() => {
        const segments = pathname.split("/").filter(Boolean).slice(1);
        if (segments.length === 0) {
            navigate(systemsListPath(), { view: "list", recordId: "" }, "replace");
            return;
        }
        if (fromPath.view === "form" && !fromPath.recordId) {
            navigate(systemsListPath(), { view: "list", recordId: "" }, "replace");
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

    const openForm = (item: ProductSystem) => {
        navigate(systemsFormPath(item.id), { view: "form", recordId: item.id });
    };

    const onTabSelect = (key: string) => {
        if (key === "list") {
            navigate(systemsListPath(), { view: "list", recordId: "" });
            return;
        }
        if (recordId && recordId !== "new") {
            navigate(systemsFormPath(recordId), { view: "form", recordId });
            return;
        }
        if (selected) {
            navigate(systemsFormPath(selected.id), { view: "form", recordId: selected.id });
            return;
        }
        navigate(systemsFormPath("new"), { view: "form", recordId: "new" });
    };

    const handleSaved = async (item: ProductSystem) => {
        await load();
        setSelected(item);
        if (recordId === "new" || recordId !== item.id) {
            navigate(systemsFormPath(item.id), { view: "form", recordId: item.id }, "replace");
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
                            navigate(systemsFormPath("new"), {
                                view: "form",
                                recordId: "new",
                            })
                        }
                    >
                        Novo Sistema
                    </AdminBtn>
                }
            />

            <div style={{ flex: 1, overflowY: "auto", padding: 20 }}>
                {view === "list" ? (
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
                                { key: "key", label: "Chave", width: 90, dataType: DataType.STRING },
                                { key: "name", label: "Nome", dataType: DataType.STRING },
                                {
                                    key: "defaultPrice",
                                    label: "Preço padrão",
                                    width: 130,
                                    dataType: DataType.CURRENCY,
                                },
                                {
                                    key: "withAiAvailable",
                                    label: "I.A.",
                                    width: 70,
                                    dataType: DataType.BOOLEAN,
                                },
                                {
                                    key: "status",
                                    label: "Status",
                                    width: 90,
                                    render: (value) => <AdminBadge status={statusLabel(String(value))} />,
                                },
                            ]}
                            rows={paged as unknown as Record<string, unknown>[]}
                            onDoubleClick={(row) => openForm(row as unknown as ProductSystem)}
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
                        key={recordId || "new"}
                        system={selected}
                        isNew={recordId === "new"}
                        onSaved={handleSaved}
                    />
                )}
            </div>
        </div>
    );
}
