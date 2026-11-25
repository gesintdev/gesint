"use client";

import { Plus, Trash2 } from "lucide-react";

import type { AdmissionDependent } from "@/modules/rh/person/collaborators/admission/dto/admission-process.dto";
import { EMERGENCY_CONTACT_RELATIONSHIP_ITEMS } from "@/modules/rh/person/collaborators/admission/lib/admission-form.constants";
import { Button } from "@/shared/components/ui/Button";
import { InputCPF, InputDate, InputSelect, InputString } from "@/shared/components/ui/input/index";

type AdmissionDependentsFieldProps = {
    dependents: AdmissionDependent[];
    onChange: (dependents: AdmissionDependent[]) => void;
};

function emptyDependent(): AdmissionDependent {
    return { fullName: "", birthDate: "", relationship: "", cpf: "" };
}

export function AdmissionDependentsField({ dependents, onChange }: AdmissionDependentsFieldProps) {
    const rows = dependents.length > 0 ? dependents : [emptyDependent()];

    const updateRow = (index: number, field: keyof AdmissionDependent, value: string) => {
        const next = rows.map((row, rowIndex) => (rowIndex === index ? { ...row, [field]: value } : row));
        onChange(next);
    };

    const addRow = () => onChange([...rows, emptyDependent()]);
    const removeRow = (index: number) => {
        if (rows.length <= 1) {
            onChange([emptyDependent()]);
            return;
        }
        onChange(rows.filter((_, rowIndex) => rowIndex !== index));
    };

    return (
        <div className="grid gap-3 sm:col-span-12">
            {rows.map((row, index) => {
                const showLabels = index === 0;
                const isLast = index === rows.length - 1;
                return (
                    <div key={`dependent-${index}`} className="flex flex-col gap-2 lg:flex-row lg:items-end">
                        <InputString
                            label={showLabels ? "Nome" : undefined}
                            placeholder={showLabels ? undefined : "Nome"}
                            value={row.fullName}
                            onValueChange={(value) => updateRow(index, "fullName", value)}
                            wrapperClassName="min-w-0 flex-1"
                        />
                        <InputSelect
                            label={showLabels ? "Parentesco" : undefined}
                            items={EMERGENCY_CONTACT_RELATIONSHIP_ITEMS}
                            value={row.relationship ?? ""}
                            onValueChange={(value) => updateRow(index, "relationship", value)}
                            placeholder="Selecione"
                            clearable
                            wrapperClassName="w-full lg:w-[11rem] lg:shrink-0"
                        />
                        <InputDate
                            label={showLabels ? "Nascimento" : undefined}
                            value={row.birthDate ?? ""}
                            onValueChange={(value) => updateRow(index, "birthDate", value)}
                            wrapperClassName="w-full lg:w-[10.5rem] lg:shrink-0"
                        />
                        <InputCPF
                            label={showLabels ? "CPF" : undefined}
                            value={row.cpf ?? ""}
                            onValueChange={(value) => updateRow(index, "cpf", value)}
                            wrapperClassName="w-full lg:w-[11rem] lg:shrink-0"
                        />
                        <div className="flex shrink-0 items-end pb-0.5 lg:w-10 lg:justify-center">
                            {isLast ? (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    aria-label="Adicionar dependente"
                                    className="w-full lg:w-10 lg:px-0"
                                    leftIcon={<Plus className="size-4" />}
                                    onClick={addRow}
                                />
                            ) : (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    aria-label={`Remover dependente ${index + 1}`}
                                    className="w-full lg:w-10 lg:px-0"
                                    leftIcon={<Trash2 className="size-4" />}
                                    onClick={() => removeRow(index)}
                                />
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
