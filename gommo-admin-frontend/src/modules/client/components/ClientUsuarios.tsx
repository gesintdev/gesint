"use client";

import { Plus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import type { ClientUser } from "@/modules/clientuser/dto/clientuser.dto";
import { clientUserService } from "@/modules/clientuser/services/clientuser.service";
import { statusLabel } from "@/modules/client/lib/client.mapper";
import { AdminBadge } from "@/shared/components/ui/admin/AdminBadge";
import { AdminBtn } from "@/shared/components/ui/admin/AdminBtn";
import { AdminDataGrid } from "@/shared/components/ui/admin/AdminDataGrid";
import { AdminModal } from "@/shared/components/ui/admin/AdminModal";
import { AdminInput } from "@/shared/components/ui/admin/AdminField";
import { AdminFormGrid, AdminSection } from "@/shared/components/ui/admin/AdminSection";
import { AdminSearchBar } from "@/shared/components/ui/admin/AdminSearchBar";
import { ExceptionCapture } from "@/shared/exceptions/exception-capture";

export function ClientUsuarios({ clientId }: { clientId: string }) {
    const [users, setUsers] = useState<ClientUser[]>([]);
    const [search, setSearch] = useState("");
    const [selected, setSelected] = useState<ClientUser | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [creating, setCreating] = useState(false);
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [displayName, setDisplayName] = useState("");
    const [password, setPassword] = useState("");
    const [saving, setSaving] = useState(false);

    const load = useCallback(async () => {
        try {
            const data = await clientUserService.getByClientId(clientId);
            setUsers(data);
        } catch (err) {
            ExceptionCapture.handle(err, { fallbackMessage: "Falha ao carregar usuários." });
        }
    }, [clientId]);

    useEffect(() => {
        void load();
    }, [load]);

    const filtered = users.filter(
        (user) =>
            (user.displayName ?? "").toLowerCase().includes(search.toLowerCase()) ||
            (user.email ?? "").toLowerCase().includes(search.toLowerCase()) ||
            (user.username ?? "").toLowerCase().includes(search.toLowerCase()),
    );

    const openCreate = () => {
        setCreating(true);
        setSelected(null);
        setUsername("");
        setEmail("");
        setDisplayName("");
        setPassword("");
        setModalOpen(true);
    };

    const openEdit = (user: ClientUser) => {
        setCreating(false);
        setSelected(user);
        setUsername(user.username ?? "");
        setEmail(user.email ?? "");
        setDisplayName(user.displayName ?? "");
        setPassword("");
        setModalOpen(true);
    };

    const save = async () => {
        setSaving(true);
        try {
            if (creating) {
                await clientUserService.create({
                    clientId,
                    username: username.trim(),
                    email: email.trim(),
                    displayName: displayName.trim() || undefined,
                    password: password || undefined,
                });
                toast.success("Usuário cadastrado.");
            } else if (selected) {
                await clientUserService.update(selected.id, {
                    clientId,
                    username: username.trim(),
                    email: email.trim(),
                    displayName: displayName.trim() || undefined,
                    password: password || undefined,
                });
                toast.success("Usuário atualizado.");
            }
            setModalOpen(false);
            await load();
        } catch (err) {
            ExceptionCapture.handle(err, { fallbackMessage: "Falha ao salvar usuário." });
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                <AdminSearchBar value={search} onChange={setSearch} placeholder="Pesquisar usuário..." />
                <AdminBtn icon={<Plus size={13} />} size="sm" onClick={openCreate}>
                    Novo Usuário
                </AdminBtn>
            </div>
            <div style={{ fontSize: 11, color: "var(--ga-text-subtle)", marginBottom: 8 }}>
                Duplo clique para editar
            </div>
            <AdminDataGrid
                cols={[
                    { key: "displayName", label: "Nome" },
                    { key: "username", label: "Usuário", width: 140 },
                    { key: "email", label: "E-mail" },
                    {
                        key: "status",
                        label: "Status",
                        width: 90,
                        render: (value) => <AdminBadge status={statusLabel(String(value))} />,
                    },
                ]}
                rows={filtered as unknown as Record<string, unknown>[]}
                onDoubleClick={(row) => openEdit(row as unknown as ClientUser)}
            />

            <AdminModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                title={creating ? "Novo usuário" : (selected?.displayName ?? selected?.username ?? "Usuário")}
            >
                <AdminSection title="Dados de Acesso">
                    <AdminFormGrid cols={2}>
                        <div style={{ gridColumn: "span 2" }}>
                            <AdminInput label="Nome de exibição" value={displayName} onChange={setDisplayName} />
                        </div>
                        <AdminInput label="Usuário" value={username} onChange={setUsername} required />
                        <AdminInput label="E-mail" value={email} onChange={setEmail} type="email" required />
                        <div style={{ gridColumn: "span 2" }}>
                            <AdminInput
                                label={creating ? "Senha" : "Nova senha (opcional)"}
                                value={password}
                                onChange={setPassword}
                                type="password"
                                required={creating}
                            />
                        </div>
                    </AdminFormGrid>
                </AdminSection>
                <div style={{ display: "flex", gap: 8 }}>
                    <AdminBtn onClick={() => void save()} disabled={saving}>
                        {saving ? "Salvando..." : "Salvar"}
                    </AdminBtn>
                    <AdminBtn variant="secondary" onClick={() => setModalOpen(false)}>
                        Cancelar
                    </AdminBtn>
                </div>
            </AdminModal>
        </>
    );
}
