"use client";

import {useMemo} from "react";

import {useActiveBranch} from "@/shared/context/ActiveBranchContext";
import {InputSelect} from "@/shared/components/ui/input/index";

/** Valor sentinela do select para cadastro disponível em todas as filiais ({@code company_id} nulo). */
export const BRANCH_CATALOG_TOTAL_VALUE = "__TOTAL__";

type BranchRecordScopeFieldProps = {
    companyId?: string | null;
    onChange: (companyId: string | null) => void;
    wrapperClassName?: string;
};

/**
 * Select com as filiais acessiveis ao usuario e a opcao Total (todas as filiais).
 */
export function BranchRecordScopeField({
    companyId,
    onChange,
    wrapperClassName = "sm:col-span-12",
}: BranchRecordScopeFieldProps) {
    const {branches} = useActiveBranch();

    const items = useMemo(
        () => [
            {value: BRANCH_CATALOG_TOTAL_VALUE, label: "Total"},
            ...branches.map((branch) => ({value: branch.id, label: branch.name})),
        ],
        [branches],
    );

    if (branches.length === 0) {
        return null;
    }

    const value = companyId == null ? BRANCH_CATALOG_TOTAL_VALUE : companyId;

    return (
        <InputSelect
            label="Disponibilidade"
            items={items}
            value={value}
            onValueChange={(next) => onChange(next === BRANCH_CATALOG_TOTAL_VALUE ? null : next)}
            wrapperClassName={wrapperClassName}
        />
    );
}
