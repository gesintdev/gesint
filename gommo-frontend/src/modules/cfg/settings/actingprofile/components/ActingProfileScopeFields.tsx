"use client";

import clsx from "clsx";

import type {DataScope} from "@/modules/cfg/settings/actingprofile/dto/acting-profile.dto";
import {DATA_SCOPE_OPTIONS} from "@/modules/cfg/settings/actingprofile/services/acting-profile.service";
import {DepartmentPickerField} from "@/modules/dp/organization/department/components/DepartmentPickerField";

type ActingProfileScopeFieldsProps = {
    dataScope: DataScope;
    scopeRef: string | null | undefined;
    onDataScopeChange: (value: DataScope) => void;
    onScopeRefChange: (value: string | null) => void;
    disabled?: boolean;
    showPreview?: boolean;
    profileName?: string;
    branchName?: string;
    systemLabel?: string;
    /** Evita conflito de name entre listagem e formulario montados juntos. */
    radioGroupName?: string;
};

export function ActingProfileScopeFields({
    dataScope,
    scopeRef,
    onDataScopeChange,
    onScopeRefChange,
    disabled,
    showPreview = true,
    profileName,
    branchName,
    systemLabel,
    radioGroupName = "acting-profile-data-scope",
}: ActingProfileScopeFieldsProps) {
    const scopeTitle =
        profileName && branchName && systemLabel
            ? `Abrangência do perfil "${profileName}" na ${branchName} · ${systemLabel}`
            : "Abrangência";

    return (
        <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto">
            <div>
                <h3 className="text-xs font-semibold tracking-wide text-base-content/70 uppercase">
                    {scopeTitle}
                </h3>
                <p className="mt-0.5 text-[11px] text-base-content/45">
                    O mesmo perfil serve para todos; só a abrangência muda por vínculo.
                </p>
            </div>

            <div
                className={clsx(
                    "rounded-xl border border-base-content/10 bg-base-100 p-3",
                    disabled && "gommo-disabled-surface",
                )}
                aria-disabled={disabled || undefined}
            >
                <ul className="flex flex-col gap-1.5">
                    {DATA_SCOPE_OPTIONS.map((option) => {
                        const active = dataScope === option.value;
                        return (
                            <li key={option.value}>
                                <label
                                    className={clsx(
                                        "flex items-start gap-3 rounded-lg border px-3 py-2.5 transition-colors",
                                        active
                                            ? "border-primary/35 bg-primary/8"
                                            : "border-transparent",
                                        !disabled && "cursor-pointer hover:bg-base-200/50",
                                        disabled && "cursor-not-allowed",
                                    )}
                                >
                                    <input
                                        type="radio"
                                        className="radio radio-primary radio-sm mt-0.5"
                                        name={radioGroupName}
                                        checked={active}
                                        disabled={disabled}
                                        onChange={() => {
                                            onDataScopeChange(option.value);
                                            if (option.value !== "DEPARTMENT") {
                                                onScopeRefChange(null);
                                            }
                                        }}
                                    />
                                    <span className="min-w-0 flex-1">
                                        <span className="block text-sm font-medium text-base-content">
                                            {option.label}
                                        </span>
                                        <span className="mt-0.5 block text-[11px] text-base-content/50">
                                            {option.hint}
                                        </span>
                                    </span>
                                </label>
                            </li>
                        );
                    })}
                </ul>

                {dataScope === "DEPARTMENT" ? (
                    <div className="mt-3 border-t border-base-content/8 pt-3">
                        <DepartmentPickerField
                            label="Departamento"
                            required
                            disabled={disabled}
                            value={scopeRef ?? ""}
                            onValueChange={(id) => onScopeRefChange(id || null)}
                            hint="Obrigatório quando a abrangência for Departamento."
                        />
                    </div>
                ) : null}

                {dataScope === "TEAM" ? (
                    <p className="mt-3 text-[11px] text-base-content/55">
                        Equipe = colaboradores cujo gestor é o usuário vinculado ao perfil.
                    </p>
                ) : null}
            </div>

            {showPreview ? (
                <div className="rounded-xl border border-primary/20 bg-primary/5 px-3 py-2.5 text-[12px] text-base-content/75">
                    <strong className="font-semibold text-primary">Prévia:</strong> a restrição será
                    aplicada quando o perfil for vinculado a um usuário. A contagem de colaboradores
                    por equipe fica disponível após o cadastro de gestor no colaborador.
                </div>
            ) : null}
        </div>
    );
}
