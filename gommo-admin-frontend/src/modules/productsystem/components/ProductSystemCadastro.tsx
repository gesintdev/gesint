"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import type { ProductSystem, ProductSystemCreateDto } from "@/modules/productsystem/dto/productsystem.dto";
import {
    emptyProductSystemForm,
    productSystemToForm,
    statusLabel,
} from "@/modules/productsystem/lib/productsystem.mapper";
import { productSystemService } from "@/modules/productsystem/services/productsystem.service";
import { AdminBadge } from "@/shared/components/ui/admin/AdminBadge";
import { AdminBtn } from "@/shared/components/ui/admin/AdminBtn";
import { AdminCurrency, AdminInput, AdminSelect } from "@/shared/components/ui/admin/AdminField";
import { AdminFormGrid, AdminSection } from "@/shared/components/ui/admin/AdminSection";
import { ExceptionCapture } from "@/shared/exceptions/exception-capture";

function parseOptionalNumber(value: string): number | undefined {
    const trimmed = value.trim().replace(",", ".");
    if (!trimmed) return undefined;
    const num = Number(trimmed);
    return Number.isFinite(num) ? num : undefined;
}

export function ProductSystemCadastro({
    system,
    isNew = false,
    onSaved,
}: {
    system: ProductSystem | null;
    isNew?: boolean;
    onSaved: (system: ProductSystem) => void | Promise<void>;
}) {
    const [form, setForm] = useState<ProductSystemCreateDto>(emptyProductSystemForm());
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        setForm(system ? productSystemToForm(system) : emptyProductSystemForm());
    }, [system]);

    const update = <K extends keyof ProductSystemCreateDto>(key: K, value: ProductSystemCreateDto[K]) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const save = async () => {
        setSaving(true);
        try {
            const payload: ProductSystemCreateDto = {
                key: form.key.trim().toUpperCase(),
                name: form.name.trim(),
                description: form.description?.trim() || undefined,
                defaultPrice: form.defaultPrice,
                withAiAvailable: Boolean(form.withAiAvailable),
                sortOrder: form.sortOrder ?? 0,
                notes: form.notes?.trim() || undefined,
            };
            if (!payload.key || !payload.name) {
                toast.error("Informe a chave e o nome do sistema.");
                return;
            }
            const saved =
                isNew || !system
                    ? await productSystemService.create(payload)
                    : await productSystemService.update(system.id, payload);
            toast.success("Sistema salvo com sucesso.");
            await onSaved(saved);
        } catch (err) {
            ExceptionCapture.handle(err, { fallbackMessage: "Falha ao salvar sistema." });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div style={{ maxWidth: 720 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <div style={{ fontWeight: 600, fontSize: 14, color: "var(--ga-text)" }}>
                    {isNew ? "Novo sistema" : (system?.name ?? "Sistema")}
                </div>
                {!isNew && system ? <AdminBadge status={statusLabel(system.status)} /> : null}
            </div>

            <AdminSection title="Identificação">
                <AdminFormGrid cols={2}>
                    <AdminInput
                        label="Chave"
                        value={form.key}
                        onChange={(v) => update("key", v.toUpperCase())}
                        placeholder="DP"
                        required
                    />
                    <AdminInput
                        label="Nome"
                        value={form.name}
                        onChange={(v) => update("name", v)}
                        placeholder="Departamento Pessoal"
                        required
                    />
                    <div style={{ gridColumn: "span 2" }}>
                        <AdminInput
                            label="Descrição"
                            value={form.description ?? ""}
                            onChange={(v) => update("description", v)}
                        />
                    </div>
                </AdminFormGrid>
            </AdminSection>

            <AdminSection title="Comercial">
                <AdminFormGrid cols={3}>
                    <AdminCurrency
                        label="Preço padrão"
                        value={form.defaultPrice}
                        onChange={(v) => update("defaultPrice", v)}
                    />
                    <AdminInput
                        label="Ordem"
                        value={form.sortOrder != null ? String(form.sortOrder) : "0"}
                        onChange={(v) => update("sortOrder", parseOptionalNumber(v) ?? 0)}
                    />
                    <AdminSelect
                        label="I.A. disponível"
                        value={form.withAiAvailable ? "true" : "false"}
                        onChange={(v) => update("withAiAvailable", v === "true")}
                        options={[
                            { value: "false", label: "Não" },
                            { value: "true", label: "Sim" },
                        ]}
                    />
                    <div style={{ gridColumn: "span 3" }}>
                        <AdminInput
                            label="Observações"
                            value={form.notes ?? ""}
                            onChange={(v) => update("notes", v)}
                        />
                    </div>
                </AdminFormGrid>
            </AdminSection>

            <AdminBtn onClick={() => void save()} disabled={saving}>
                {saving ? "Salvando..." : "Salvar Alterações"}
            </AdminBtn>
        </div>
    );
}
