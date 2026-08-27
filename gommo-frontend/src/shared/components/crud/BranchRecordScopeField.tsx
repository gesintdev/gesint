"use client";

import { useContext } from "react";

import { ActiveBranchContext } from "@/shared/context/ActiveBranchContext";
import { InputSelect } from "@/shared/components/ui/input/index";

const BRANCH_SCOPE_ITEMS = [
    {value: "false", label: "Somente filial ativa"},
    {value: "true", label: "Todas as filiais"},
] as const;

type BranchRecordScopeFieldProps = {
    sharedAcrossBranches: boolean;
    onChange: (sharedAcrossBranches: boolean) => void;
    wrapperClassName?: string;
};

/**
 * Visivel apenas quando o cliente tem mais de uma filial.
 * Padrao: exclusivo da filial ativa ({@code sharedAcrossBranches = false}).
 */
export function BranchRecordScopeField({
    sharedAcrossBranches,
    onChange,
    wrapperClassName = "sm:col-span-12",
}: BranchRecordScopeFieldProps) {
    const branchContext = useContext(ActiveBranchContext);
    const branches = branchContext?.branches ?? [];

    if (branches.length <= 1) {
        return null;
    }

    return (
        <InputSelect
            label="Disponibilidade"
            items={[...BRANCH_SCOPE_ITEMS]}
            value={sharedAcrossBranches ? "true" : "false"}
            onValueChange={(value) => onChange(value === "true")}
            wrapperClassName={wrapperClassName}
        />
    );
}
