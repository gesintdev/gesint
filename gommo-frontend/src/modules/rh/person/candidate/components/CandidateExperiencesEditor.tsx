"use client";

import { Plus, Trash2 } from "lucide-react";

import type { CandidateExperience } from "@/modules/rh/person/candidate/dto/candidate.dto";
import { emptyExperience } from "@/modules/rh/person/candidate/lib/candidate.mapper";
import { Button } from "@/shared/components/ui/Button";
import { InputDate, InputString } from "@/shared/components/ui/input/index";

type CandidateExperiencesEditorProps = {
    experiences: CandidateExperience[];
    onChange: (experiences: CandidateExperience[]) => void;
};

export function CandidateExperiencesEditor({ experiences, onChange }: CandidateExperiencesEditorProps) {
    const rows = experiences.length > 0 ? experiences : [];

    const updateRow = (index: number, patch: Partial<CandidateExperience>) => {
        onChange(rows.map((row, rowIndex) => (rowIndex === index ? { ...row, ...patch } : row)));
    };

    const addRow = () => {
        onChange([...rows, emptyExperience()]);
    };

    const removeRow = (index: number) => {
        onChange(rows.filter((_, rowIndex) => rowIndex !== index));
    };

    return (
        <div className="grid gap-4 sm:col-span-12">
            {rows.length === 0 ? (
                <p className="text-sm text-base-content/55">Nenhuma experiência adicionada.</p>
            ) : null}
            {rows.map((row, index) => (
                <div
                    key={row.id ?? `experience-${index}`}
                    className="grid gap-3 rounded-xl border border-base-content/10 bg-base-200/30 p-4 sm:grid-cols-12"
                >
                    <InputString
                        label="Empresa"
                        value={row.companyName}
                        onValueChange={(value) => updateRow(index, { companyName: value })}
                        required
                        wrapperClassName="sm:col-span-6"
                    />
                    <InputString
                        label="Cargo"
                        value={row.jobTitle}
                        onValueChange={(value) => updateRow(index, { jobTitle: value })}
                        required
                        wrapperClassName="sm:col-span-6"
                    />
                    <InputDate
                        label="Início"
                        value={row.startDate}
                        onValueChange={(value) => updateRow(index, { startDate: value })}
                        required
                        wrapperClassName="sm:col-span-3"
                    />
                    <InputDate
                        label="Fim"
                        value={row.endDate ?? ""}
                        onValueChange={(value) => updateRow(index, { endDate: value })}
                        disabled={Boolean(row.currentJob)}
                        wrapperClassName="sm:col-span-3"
                    />
                    <label className="flex items-center gap-2 pt-6 text-sm text-base-content/75 sm:col-span-4">
                        <input
                            type="checkbox"
                            className="checkbox checkbox-sm checkbox-primary"
                            checked={Boolean(row.currentJob)}
                            onChange={(event) =>
                                updateRow(index, {
                                    currentJob: event.target.checked,
                                    endDate: event.target.checked ? "" : row.endDate,
                                })
                            }
                        />
                        Emprego atual
                    </label>
                    <div className="flex items-end justify-end sm:col-span-2">
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            aria-label={`Remover experiência ${index + 1}`}
                            leftIcon={<Trash2 className="size-4" />}
                            onClick={() => removeRow(index)}
                        />
                    </div>
                    <InputString
                        label="Descrição"
                        value={row.description ?? ""}
                        onValueChange={(value) => updateRow(index, { description: value })}
                        wrapperClassName="sm:col-span-12"
                    />
                </div>
            ))}
            <div>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    leftIcon={<Plus className="size-4" />}
                    onClick={addRow}
                >
                    Adicionar experiência
                </Button>
            </div>
        </div>
    );
}
