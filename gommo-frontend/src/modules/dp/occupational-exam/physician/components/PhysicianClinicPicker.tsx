"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import type { MedicalClinic } from "@/modules/dp/occupational-exam/clinic/dto/medical-clinic.dto";
import { medicalClinicKeys } from "@/modules/dp/occupational-exam/clinic/medical-clinic.query";
import { medicalClinicService } from "@/modules/dp/occupational-exam/clinic/services/medical-clinic.service";
import { TablePagination } from "@/shared/components/data/TablePagination";
import { ExceptionCapture } from "@/shared/exceptions";

type PhysicianClinicPickerProps = {
    selectedIds: string[];
    onChange: (ids: string[]) => void;
    disabled?: boolean;
};

const PAGE_SIZE_DEFAULT = 10;

export function PhysicianClinicPicker({ selectedIds, onChange, disabled }: PhysicianClinicPickerProps) {
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(PAGE_SIZE_DEFAULT);

    const clinicsQuery = useQuery({
        queryKey: [...medicalClinicKeys.all, "picker-page", page, size],
        queryFn: () => medicalClinicService.getPage(page, size),
    });

    const content = clinicsQuery.data?.content ?? [];
    const totalPages = clinicsQuery.data?.totalPages ?? 0;
    const totalElements = clinicsQuery.data?.totalElements ?? 0;

    const toggle = (clinicId: string, checked: boolean) => {
        if (disabled) return;
        if (checked) {
            if (selectedIds.includes(clinicId)) return;
            onChange([...selectedIds, clinicId]);
            return;
        }
        onChange(selectedIds.filter((id) => id !== clinicId));
    };

    return (
        <div className="sm:col-span-12 grid gap-3">
            <p className="text-xs text-base-content/60">
                {selectedIds.length > 0
                    ? `${selectedIds.length} clinica(s) selecionada(s).`
                    : "Nenhuma clinica selecionada."}
            </p>

            <div className="overflow-x-auto rounded-box border border-base-300">
                <table className="table table-sm">
                    <thead>
                        <tr>
                            <th className="w-12">Sel.</th>
                            <th>Clinica</th>
                            <th className="hidden md:table-cell">CNPJ</th>
                            <th className="hidden lg:table-cell">Telefone</th>
                        </tr>
                    </thead>
                    <tbody>
                        {clinicsQuery.isLoading ? (
                            <tr>
                                <td colSpan={4}>
                                    <div className="skeleton-shimmer h-8 w-full" />
                                </td>
                            </tr>
                        ) : null}
                        {clinicsQuery.isError ? (
                            <tr>
                                <td colSpan={4} className="text-sm text-error">
                                    {ExceptionCapture.displayMessage(
                                        clinicsQuery.error,
                                        "Falha ao carregar clinicas.",
                                    )}
                                </td>
                            </tr>
                        ) : null}
                        {!clinicsQuery.isLoading && !clinicsQuery.isError && content.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="text-sm text-base-content/60">
                                    Nenhuma clinica cadastrada.
                                </td>
                            </tr>
                        ) : null}
                        {content.map((clinic: MedicalClinic) => {
                            const checked = selectedIds.includes(clinic.id);
                            return (
                                <tr key={clinic.id} className={checked ? "bg-primary/5" : undefined}>
                                    <td>
                                        <input
                                            type="checkbox"
                                            className="checkbox checkbox-sm checkbox-primary"
                                            checked={checked}
                                            disabled={disabled}
                                            onChange={(e) => toggle(clinic.id, e.target.checked)}
                                            aria-label={`Selecionar clinica ${clinic.corporateName}`}
                                        />
                                    </td>
                                    <td className="font-medium">{clinic.corporateName}</td>
                                    <td className="hidden md:table-cell">{clinic.cnpj}</td>
                                    <td className="hidden lg:table-cell">{clinic.phone ?? "—"}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <TablePagination
                page={page}
                totalPages={totalPages}
                totalElements={totalElements}
                size={size}
                loading={clinicsQuery.isFetching}
                onPageChange={setPage}
                onPageSizeChange={(next) => {
                    setSize(next);
                    setPage(0);
                }}
            />
        </div>
    );
}
