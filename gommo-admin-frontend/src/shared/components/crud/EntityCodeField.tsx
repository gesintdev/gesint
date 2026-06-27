"use client";

import { InputString } from "@/shared/components/ui/input/index";

type EntityCodeFieldProps = {
    code?: number | null;
};

export function EntityCodeField({ code }: EntityCodeFieldProps) {
    if (code == null) return null;

    return <InputString label="Código" value={String(code)} onValueChange={() => {}} disabled />;
}
