"use client";

import { KeyRound, Plus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import type { ClientUser } from "@/modules/clientuser/dto/clientuser.dto";
import { clientUserService } from "@/modules/clientuser/services/clientuser.service";
import { statusLabel } from "@/modules/client/lib/client.mapper";
import { showAccessTokenReveal } from "@/shared/access-token-reveal";
import { AdminBadge } from "@/shared/components/ui/admin/AdminBadge";
import { AdminBtn } from "@/shared/components/ui/admin/AdminBtn";
import { AdminDataGrid } from "@/shared/components/ui/admin/AdminDataGrid";
import { AdminModal } from "@/shared/components/ui/admin/AdminModal";
import { AdminInput } from "@/shared/components/ui/admin/AdminField";
import { AdminFormGrid, AdminSection } from "@/shared/components/ui/admin/AdminSection";
import { AdminSearchBar } from "@/shared/components/ui/admin/AdminSearchBar";
import { ExceptionCapture } from "@/shared/exceptions/exception-capture";
import { SystemAlert } from "@/shared/system-alert";
import { DataType } from "@/shared/types/data-type";

export function ClientUsuarios({ clientId }: { clientId: string }) {
    const [users, setUsers] = useState<ClientUser[]>([]);
    const [search, setSearch] = useState("");
    const [selected, setSelected] = useState<ClientUser | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [creating, setCreating] = useState(false);
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [displayName, setDisplayName] = useState("");
    const [saving, setSaving] = useState(false);
    const [resetting, setResetting] = useState(false);

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
        setModalOpen(true);
    };

    const openEdit = (user: ClientUser) => {
        setCreating(false);
        setSelected(user);
        setUsername(user.username ?? "");
        setEmail(user.email ?? "");
        setDisplayName(user.displayName ?? "");
        setModalOpen(true);
    };

    const save = async () => {
        if (!username.trim() || !email.trim()) {
            toast.error("Informe usuário e e-mail.");
            return;
        }
        setSaving(true);
        try {
            if (creating) {
                const saved = await clientUserService.create({
                    clientId,
                    username: username.trim(),
                    email: email.trim(),
                    displayName: displayName.trim() || undefined,
                });
                if (saved.accessToken) {
                    await showAccessTokenReveal(saved.accessToken, "create");
                } else {
                    toast.success("Usuário cadastrado.");
                }
            } else if (selected) {
                await clientUserService.update(selected.id, {
                    clientId,
                    username: username.trim(),
                    email: email.trim(),
                    displayName: displayName.trim() || undefined,
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

    const resetAccess = async () => {
        if (!selected || creating) {
            toast.message("Salve o usuário antes de gerar um novo token.");
            return;
        }
        const confirmed = await SystemAlert.confirm({
            title: "Gerar novo token",
            message:
                "A senha atual será removida e um novo token de acesso será gerado. O token anterior deixará de valer. Deseja continuar?",
            confirmLabel: "Gerar novo token",
            cancelLabel: "Cancelar",
        });
        if (!confirmed) return;

        setResetting(true);
        try {
            const saved = await clientUserService.resetAccess(selected.id);
            if (saved.accessToken) {
                await showAccessTokenReveal(saved.accessToken, "reset");
            } else {
                toast.success("Novo token gerado.");
            }
            setSelected(saved);
            await load();
        } catch (err) {
            ExceptionCapture.handle(err, { fallbackMessage: "Falha ao gerar novo token." });
        } finally {
            setResetting(false);
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
                    { key: "displayName", label: "Nome", dataType: DataType.STRING },
                    { key: "username", label: "Usuário", width: 140, dataType: DataType.STRING },
                    { key: "email", label: "E-mail", dataType: DataType.EMAIL },
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
                        {!creating ? (
                            <div style={{ gridColumn: "span 2" }}>
                                <AdminBtn
                                    variant="secondary"
                                    icon={<KeyRound size={12} />}
                                    onClick={() => void resetAccess()}
                                    disabled={saving || resetting}
                                >
                                    {resetting ? "Gerando..." : "Gerar novo token"}
                                </AdminBtn>
                            </div>
                        ) : (
                            <div style={{ gridColumn: "span 2", fontSize: 11, color: "var(--ga-text-muted)" }}>
                                Um token de acesso será gerado ao salvar o usuário.
                            </div>
                        )}
                    </AdminFormGrid>
                </AdminSection>
                <div style={{ display: "flex", gap: 8 }}>
                    <AdminBtn onClick={() => void save()} disabled={saving || resetting}>
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
