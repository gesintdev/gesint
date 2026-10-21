"use client";

import { Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { statusLabel } from "@/modules/client/lib/client.mapper";
import type { ClientBranch } from "@/modules/clientbranch/dto/clientbranch.dto";
import { clientBranchService } from "@/modules/clientbranch/services/clientbranch.service";
import { AdminBadge } from "@/shared/components/ui/admin/AdminBadge";
import { AdminBtn } from "@/shared/components/ui/admin/AdminBtn";
import { AdminDataGrid } from "@/shared/components/ui/admin/AdminDataGrid";
import { AdminInput } from "@/shared/components/ui/admin/AdminField";
import { AdminModal } from "@/shared/components/ui/admin/AdminModal";
import { AdminSearchBar } from "@/shared/components/ui/admin/AdminSearchBar";
import { AdminFormGrid, AdminSection } from "@/shared/components/ui/admin/AdminSection";
import { ExceptionCapture } from "@/shared/exceptions/exception-capture";
import { isValidCnpj, maskCnpj } from "@/shared/lib/input/cnpj";
import { digitsOnly } from "@/shared/lib/input/digits";
import { SystemAlert } from "@/shared/system-alert";
import { DataType } from "@/shared/types/data-type";

type BranchForm = {
    legalName: string;
    tradeName: string;
    cnpj: string;
    sortOrder: string;
    stateRegistration: string;
    municipalRegistration: string;
    email: string;
    phone: string;
    zipCode: string;
    street: string;
    number: string;
    complement: string;
    district: string;
    city: string;
    stateCode: string;
};

const emptyForm = (): BranchForm => ({
    legalName: "",
    tradeName: "",
    cnpj: "",
    sortOrder: "0",
    stateRegistration: "",
    municipalRegistration: "",
    email: "",
    phone: "",
    zipCode: "",
    street: "",
    number: "",
    complement: "",
    district: "",
    city: "",
    stateCode: "",
});

const toForm = (branch: ClientBranch): BranchForm => ({
    legalName: branch.legalName ?? "",
    tradeName: branch.tradeName ?? "",
    cnpj: branch.cnpj ?? "",
    sortOrder: String(branch.sortOrder ?? 0),
    stateRegistration: branch.stateRegistration ?? "",
    municipalRegistration: branch.municipalRegistration ?? "",
    email: branch.email ?? "",
    phone: branch.phone ?? "",
    zipCode: branch.zipCode ?? "",
    street: branch.street ?? "",
    number: branch.number ?? "",
    complement: branch.complement ?? "",
    district: branch.district ?? "",
    city: branch.city ?? "",
    stateCode: branch.stateCode ?? "",
});

/**
 * Cadastro das filiais do cliente, sempre filhas da matriz.
 *
 * A matriz nao aparece aqui: ela e o proprio cadastro de Dados Basicos. Um cliente sem nenhuma
 * linha nesta aba opera com estabelecimento unico e nem chega a ver o seletor de filial.
 *
 * Cada filial vira uma company no schema do tenant, que e a dimensao usada para escopar dados e
 * permissoes.
 */
export function ClientFiliais({ clientId }: { clientId: string }) {
    const [branches, setBranches] = useState<ClientBranch[]>([]);
    const [search, setSearch] = useState("");
    const [selected, setSelected] = useState<ClientBranch | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [creating, setCreating] = useState(false);
    const [form, setForm] = useState<BranchForm>(emptyForm());
    const [saving, setSaving] = useState(false);

    const load = useCallback(async () => {
        try {
            setBranches(await clientBranchService.getByClientId(clientId));
        } catch (err) {
            ExceptionCapture.handle(err, { fallbackMessage: "Falha ao carregar filiais." });
        }
    }, [clientId]);

    useEffect(() => {
        void load();
    }, [load]);

    const term = search.toLowerCase();
    const filtered = branches.filter(
        (branch) =>
            branch.legalName.toLowerCase().includes(term) ||
            (branch.tradeName ?? "").toLowerCase().includes(term) ||
            branch.cnpj.includes(term.replace(/\D/g, "")),
    );

    const updateForm = <K extends keyof BranchForm>(key: K, value: BranchForm[K]) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const openCreate = () => {
        setCreating(true);
        setSelected(null);
        setForm(emptyForm());
        setModalOpen(true);
    };

    const openEdit = (branch: ClientBranch) => {
        setCreating(false);
        setSelected(branch);
        setForm(toForm(branch));
        setModalOpen(true);
    };

    const save = async () => {
        const cnpjDigits = digitsOnly(form.cnpj);
        if (!form.legalName.trim() || cnpjDigits.length !== 14) {
            toast.error("Informe a razão social e um CNPJ com 14 dígitos.");
            return;
        }
        if (!isValidCnpj(cnpjDigits)) {
            toast.error("CNPJ inválido.");
            return;
        }
        setSaving(true);
        try {
            const payload = {
                clientId,
                legalName: form.legalName.trim(),
                tradeName: form.tradeName.trim() || undefined,
                cnpj: cnpjDigits,
                sortOrder: Number(form.sortOrder) || 0,
                stateRegistration: form.stateRegistration.trim() || undefined,
                municipalRegistration: form.municipalRegistration.trim() || undefined,
                email: form.email.trim() || undefined,
                phone: form.phone.trim() || undefined,
                zipCode: form.zipCode.trim() || undefined,
                street: form.street.trim() || undefined,
                number: form.number.trim() || undefined,
                complement: form.complement.trim() || undefined,
                district: form.district.trim() || undefined,
                city: form.city.trim() || undefined,
                stateCode: form.stateCode.trim().toUpperCase() || undefined,
            };
            if (creating) {
                await clientBranchService.create(payload);
                toast.success("Filial cadastrada.");
            } else if (selected) {
                await clientBranchService.update(selected.id, payload);
                toast.success("Filial atualizada.");
            }
            setModalOpen(false);
            await load();
        } catch (err) {
            ExceptionCapture.handle(err, { fallbackMessage: "Falha ao salvar filial." });
        } finally {
            setSaving(false);
        }
    };

    const remove = async () => {
        if (!selected || creating) return;
        const confirmed = await SystemAlert.confirm({
            title: "Excluir filial",
            message:
                "A filial será removida do cadastro e inativada no ambiente do cliente. Os dados já lançados nela continuam existindo. Deseja continuar?",
            confirmLabel: "Excluir",
            cancelLabel: "Cancelar",
        });
        if (!confirmed) return;
        try {
            await clientBranchService.remove(selected.id);
            toast.success("Filial excluída.");
            setModalOpen(false);
            await load();
        } catch (err) {
            ExceptionCapture.handle(err, { fallbackMessage: "Falha ao excluir filial." });
        }
    };

    return (
        <>
            <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                <AdminSearchBar value={search} onChange={setSearch} placeholder="Pesquisar filial..." />
                <AdminBtn icon={<Plus size={13} />} size="sm" onClick={openCreate}>
                    Nova Filial
                </AdminBtn>
            </div>
            <div style={{ fontSize: 11, color: "var(--ga-text-subtle)", marginBottom: 8 }}>
                Duplo clique para editar. A matriz é o cadastro de Dados Básicos; liste aqui apenas os
                estabelecimentos filiados a ela.
            </div>
            <AdminDataGrid
                cols={[
                    { key: "legalName", label: "Razão Social", dataType: DataType.STRING },
                    { key: "tradeName", label: "Nome Fantasia", dataType: DataType.STRING },
                    { key: "cnpj", label: "CNPJ", width: 150, dataType: DataType.CNPJ },
                    { key: "city", label: "Cidade", width: 140, dataType: DataType.STRING },
                    {
                        key: "status",
                        label: "Status",
                        width: 90,
                        render: (value) => <AdminBadge status={statusLabel(String(value))} />,
                    },
                ]}
                rows={filtered as unknown as Record<string, unknown>[]}
                onDoubleClick={(row) => openEdit(row as unknown as ClientBranch)}
                emptyMsg="Nenhuma filial cadastrada. O cliente opera apenas com a matriz e não vê o seletor de filial."
            />

            <AdminModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                title={creating ? "Nova filial" : (selected?.tradeName ?? selected?.legalName ?? "Filial")}
            >
                <AdminSection title="Identificação">
                    <AdminFormGrid cols={2}>
                        <div style={{ gridColumn: "span 2" }}>
                            <AdminInput
                                label="Razão Social"
                                value={form.legalName}
                                onChange={(value) => updateForm("legalName", value)}
                                required
                            />
                        </div>
                        <AdminInput
                            label="Nome Fantasia"
                            value={form.tradeName}
                            onChange={(value) => updateForm("tradeName", value)}
                        />
                        <AdminInput
                            label="CNPJ"
                            value={maskCnpj(form.cnpj)}
                            onChange={(value) => updateForm("cnpj", digitsOnly(value).slice(0, 14))}
                            placeholder="00.000.000/0000-00"
                            required
                        />
                        <AdminInput
                            label="Inscrição Estadual"
                            value={form.stateRegistration}
                            onChange={(value) => updateForm("stateRegistration", value)}
                        />
                        <AdminInput
                            label="Inscrição Municipal"
                            value={form.municipalRegistration}
                            onChange={(value) => updateForm("municipalRegistration", value)}
                        />
                        <AdminInput
                            label="E-mail"
                            value={form.email}
                            onChange={(value) => updateForm("email", value)}
                            type="email"
                        />
                        <AdminInput
                            label="Telefone"
                            value={form.phone}
                            onChange={(value) => updateForm("phone", value)}
                        />
                        <AdminInput
                            label="Ordem de exibição"
                            value={form.sortOrder}
                            onChange={(value) => updateForm("sortOrder", value)}
                            type="number"
                        />
                    </AdminFormGrid>
                </AdminSection>

                <AdminSection title="Endereço">
                    <AdminFormGrid cols={3}>
                        <AdminInput
                            label="CEP"
                            value={form.zipCode}
                            onChange={(value) => updateForm("zipCode", value)}
                        />
                        <div style={{ gridColumn: "span 2" }}>
                            <AdminInput
                                label="Logradouro"
                                value={form.street}
                                onChange={(value) => updateForm("street", value)}
                            />
                        </div>
                        <AdminInput
                            label="Número"
                            value={form.number}
                            onChange={(value) => updateForm("number", value)}
                        />
                        <AdminInput
                            label="Complemento"
                            value={form.complement}
                            onChange={(value) => updateForm("complement", value)}
                        />
                        <AdminInput
                            label="Bairro"
                            value={form.district}
                            onChange={(value) => updateForm("district", value)}
                        />
                        <div style={{ gridColumn: "span 2" }}>
                            <AdminInput
                                label="Cidade"
                                value={form.city}
                                onChange={(value) => updateForm("city", value)}
                            />
                        </div>
                        <AdminInput
                            label="UF"
                            value={form.stateCode}
                            onChange={(value) => updateForm("stateCode", value)}
                        />
                    </AdminFormGrid>
                </AdminSection>

                <div style={{ display: "flex", gap: 8 }}>
                    <AdminBtn onClick={() => void save()} disabled={saving}>
                        {saving ? "Salvando..." : "Salvar"}
                    </AdminBtn>
                    <AdminBtn variant="secondary" onClick={() => setModalOpen(false)}>
                        Cancelar
                    </AdminBtn>
                    {!creating ? (
                        <AdminBtn variant="secondary" icon={<Trash2 size={12} />} onClick={() => void remove()}>
                            Excluir
                        </AdminBtn>
                    ) : null}
                </div>
            </AdminModal>
        </>
    );
}
