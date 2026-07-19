"use client";

import { Plus, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { AdminUserCadastro } from "@/modules/adminuser/components/AdminUserCadastro";
import type { AdminUser } from "@/modules/adminuser/dto/adminuser.dto";
import { adminUserService } from "@/modules/adminuser/services/adminuser.service";
import { AdminBadge } from "@/shared/components/ui/admin/AdminBadge";
import { AdminBtn } from "@/shared/components/ui/admin/AdminBtn";
import { AdminDataGrid } from "@/shared/components/ui/admin/AdminDataGrid";
import { AdminModuleToolbar } from "@/shared/components/ui/admin/AdminModuleToolbar";
import { AdminPagination } from "@/shared/components/ui/admin/AdminPagination";
import { AdminSearchBar } from "@/shared/components/ui/admin/AdminSearchBar";
import { ExceptionCapture } from "@/shared/exceptions/exception-capture";
import { useOptimisticPath } from "@/shared/hooks/useOptimisticPath";
import { usersCadastroPath, usersListPath } from "@/shared/routing/admin-nav";

type UsersPathState = {
    view: "listagem" | "cadastro";
    recordId: string;
};

const parseUsersPath = (pathname: string): UsersPathState => {
    const segments = pathname.split("/").filter(Boolean).slice(1);
    const view = segments[0] === "cadastro" ? "cadastro" : "listagem";
    const recordId = view === "cadastro" ? (segments[1] ?? "") : "";
    return { view, recordId };
};

const sameUsersPath = (a: UsersPathState, b: UsersPathState) =>
    a.view === b.view && a.recordId === b.recordId;

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

function formatDate(value?: string) {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString("pt-BR");
}

export function AdminUsersModule() {
    const { pathname, current, navigate, fromPath } = useOptimisticPath(parseUsersPath, sameUsersPath);
    const { view, recordId } = current;

    const [users, setUsers] = useState<AdminUser[]>([]);
    const [selected, setSelected] = useState<AdminUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const perPage = 10;

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const data = await adminUserService.getAll();
            setUsers(data);
        } catch (err) {
            ExceptionCapture.handle(err, { fallbackMessage: "Falha ao carregar usuários." });
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
        const cached = users.find((item) => item.id === recordId);
        if (cached) {
            setSelected(cached);
            return;
        }
        let cancelled = false;
        void adminUserService
            .getById(recordId)
            .then((item) => {
                if (!cancelled) setSelected(item);
            })
            .catch(() => {
                if (!cancelled) {
                    navigate(usersListPath(), { view: "listagem", recordId: "" }, "replace");
                }
            });
        return () => {
            cancelled = true;
        };
    }, [view, recordId, users, navigate]);

    useEffect(() => {
        const segments = pathname.split("/").filter(Boolean).slice(1);
        if (segments.length === 0) {
            navigate(usersListPath(), { view: "listagem", recordId: "" }, "replace");
            return;
        }
        if (fromPath.view === "cadastro" && !fromPath.recordId) {
            navigate(usersListPath(), { view: "listagem", recordId: "" }, "replace");
        }
    }, [pathname, fromPath, navigate]);

    const filtered = users.filter((user) => {
        const q = search.toLowerCase();
        return (
            user.fullName.toLowerCase().includes(q) ||
            user.username.toLowerCase().includes(q) ||
            user.email.toLowerCase().includes(q)
        );
    });
    const paged = filtered.slice((page - 1) * perPage, page * perPage);

    const openCadastro = (user: AdminUser) => {
        navigate(usersCadastroPath(user.id), { view: "cadastro", recordId: user.id });
    };

    const onTabSelect = (key: string) => {
        if (key === "listagem") {
            navigate(usersListPath(), { view: "listagem", recordId: "" });
            return;
        }
        if (recordId && recordId !== "novo") {
            navigate(usersCadastroPath(recordId), { view: "cadastro", recordId });
            return;
        }
        if (selected) {
            navigate(usersCadastroPath(selected.id), { view: "cadastro", recordId: selected.id });
            return;
        }
        navigate(usersCadastroPath("novo"), { view: "cadastro", recordId: "novo" });
    };

    const handleSaved = async (user: AdminUser) => {
        await load();
        setSelected(user);
        if (recordId === "novo" || recordId !== user.id) {
            navigate(usersCadastroPath(user.id), { view: "cadastro", recordId: user.id }, "replace");
        }
    };

    const handleDeleted = async () => {
        await load();
        setSelected(null);
        navigate(usersListPath(), { view: "listagem", recordId: "" });
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
                            navigate(usersCadastroPath("novo"), {
                                view: "cadastro",
                                recordId: "novo",
                            })
                        }
                    >
                        Novo Usuário
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
                                placeholder="Pesquisar por nome, usuário, e-mail..."
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
                                { key: "code", label: "Código", width: 80 },
                                { key: "fullName", label: "Nome completo" },
                                { key: "username", label: "Usuário", width: 140 },
                                { key: "email", label: "E-mail" },
                                {
                                    key: "status",
                                    label: "Status",
                                    width: 90,
                                    render: (value) => <AdminBadge status={statusLabel(String(value))} />,
                                },
                                {
                                    key: "createdAt",
                                    label: "Criado em",
                                    width: 160,
                                    render: (value) => formatDate(value as string | undefined),
                                },
                            ]}
                            rows={paged as unknown as Record<string, unknown>[]}
                            onDoubleClick={(row) => openCadastro(row as unknown as AdminUser)}
                            emptyMsg={loading ? "Carregando..." : "Nenhum usuário encontrado."}
                        />
                        <AdminPagination
                            page={page}
                            total={filtered.length}
                            perPage={perPage}
                            onChange={setPage}
                        />
                    </>
                ) : (
                    <AdminUserCadastro
                        key={recordId || "novo"}
                        user={selected}
                        isNew={recordId === "novo"}
                        onSaved={handleSaved}
                        onDeleted={handleDeleted}
                    />
                )}
            </div>
        </div>
    );
}
