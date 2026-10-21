"use client";

import { RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import type { AssistantErrorLog } from "@/modules/assistanterrorlog/dto/assistanterrorlog.dto";
import { assistantErrorLogService } from "@/modules/assistanterrorlog/services/assistanterrorlog.service";
import { AdminBtn } from "@/shared/components/ui/admin/AdminBtn";
import { AdminDataGrid } from "@/shared/components/ui/admin/AdminDataGrid";
import { AdminModuleToolbar } from "@/shared/components/ui/admin/AdminModuleToolbar";
import { AdminPagination } from "@/shared/components/ui/admin/AdminPagination";
import { AdminSearchBar } from "@/shared/components/ui/admin/AdminSearchBar";
import { AdminSection } from "@/shared/components/ui/admin/AdminSection";
import { ExceptionCapture } from "@/shared/exceptions/exception-capture";
import { DataType } from "@/shared/types/data-type";

function formatDateTime(value?: string | null) {
    if (!value) return "—";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleString("pt-BR");
}

export function AssistantErrorLogModule() {
    const [rows, setRows] = useState<AssistantErrorLog[]>([]);
    const [selected, setSelected] = useState<AssistantErrorLog | null>(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [totalElements, setTotalElements] = useState(0);
    const perPage = 20;

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const data = await assistantErrorLogService.findPage(page - 1, perPage, search);
            setRows(data.content ?? []);
            setTotalElements(data.totalElements ?? 0);
        } catch (err) {
            ExceptionCapture.handle(err, { fallbackMessage: "Falha ao carregar logs do assistente." });
        } finally {
            setLoading(false);
        }
    }, [page, search]);

    useEffect(() => {
        void load();
    }, [load]);

    return (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <AdminModuleToolbar
                tabs={[{ key: "logs", label: "Logs do Assistente I.A." }]}
                active="logs"
                onSelect={() => {}}
                actions={
                    <AdminBtn
                        variant="secondary"
                        size="sm"
                        icon={<RefreshCw size={12} />}
                        onClick={() => void load()}
                        disabled={loading}
                    >
                        Atualizar
                    </AdminBtn>
                }
            />

            <div style={{ flex: 1, overflowY: "auto", padding: 20 }}>
                <div style={{ fontSize: 12, color: "var(--ga-text-muted)", marginBottom: 14 }}>
                    Falhas técnicas do chat/skills no Client. Sem conteúdo sensível da conversa.
                </div>

                <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                    <AdminSearchBar
                        value={search}
                        onChange={(value) => {
                            setSearch(value);
                            setPage(1);
                        }}
                        placeholder="Buscar por cliente, usuário, classe ou resumo…"
                    />
                </div>

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: selected ? "1.5fr 1fr" : "1fr",
                        gap: 16,
                        alignItems: "start",
                    }}
                >
                    <div>
                        <AdminDataGrid
                            cols={[
                                {
                                    key: "createdAt",
                                    label: "Quando",
                                    width: 160,
                                    render: (value) => formatDateTime(value as string),
                                },
                                { key: "clientName", label: "Cliente", width: 160 },
                                { key: "userName", label: "Usuário", width: 140 },
                                { key: "errorClass", label: "Classe", width: 160 },
                                { key: "summary", label: "Resumo", dataType: DataType.TEXT },
                            ]}
                            rows={rows as Array<AssistantErrorLog & Record<string, unknown>>}
                            emptyMsg={loading ? "Carregando…" : "Nenhum erro registrado."}
                            onDoubleClick={(row) => setSelected(row as AssistantErrorLog)}
                        />
                        <AdminPagination
                            page={page}
                            total={totalElements}
                            perPage={perPage}
                            onChange={setPage}
                        />
                    </div>

                    {selected ? (
                        <AdminSection title="Detalhe">
                            <div style={{ display: "grid", gap: 10, fontSize: 13 }}>
                                <div>
                                    <div style={{ color: "var(--ga-text-muted)", fontSize: 11 }}>Quando</div>
                                    <div>{formatDateTime(selected.createdAt)}</div>
                                </div>
                                <div>
                                    <div style={{ color: "var(--ga-text-muted)", fontSize: 11 }}>Cliente</div>
                                    <div>{selected.clientName || "—"}</div>
                                </div>
                                <div>
                                    <div style={{ color: "var(--ga-text-muted)", fontSize: 11 }}>Schema</div>
                                    <div>{selected.tenantSchema || "—"}</div>
                                </div>
                                <div>
                                    <div style={{ color: "var(--ga-text-muted)", fontSize: 11 }}>Usuário</div>
                                    <div>
                                        {selected.userName || "—"}
                                        {selected.userEmail ? ` · ${selected.userEmail}` : ""}
                                    </div>
                                </div>
                                <div>
                                    <div style={{ color: "var(--ga-text-muted)", fontSize: 11 }}>Classe</div>
                                    <div>{selected.errorClass || "—"}</div>
                                </div>
                                <div>
                                    <div style={{ color: "var(--ga-text-muted)", fontSize: 11 }}>Resumo</div>
                                    <div style={{ whiteSpace: "pre-wrap" }}>{selected.summary}</div>
                                </div>
                                <AdminBtn type="button" variant="ghost" onClick={() => setSelected(null)}>
                                    Fechar detalhe
                                </AdminBtn>
                            </div>
                        </AdminSection>
                    ) : null}
                </div>
            </div>
        </div>
    );
}
