"use client";

import { useEffect, useMemo, useState } from "react";

import { InputDate } from "@/shared/components/ui/input/InputDate";
import { InputSelect } from "@/shared/components/ui/input/InputSelect";
import type { SelectItem } from "@/shared/components/ui/input/select-item.types";
import { formatBadgeCellValue, formatCellValue } from "@/shared/lib/table/format-cell-value";
import {
    isSelectFilterDataType,
    type TableColumnConfig,
    TableDataType,
} from "@/shared/types/table.types";

type ColumnFilterControlProps = {
    column: TableColumnConfig;
    options: string[];
    value: string[];
    onChange: (_value: string[]) => void;
};

const TEXT_DEBOUNCE_MS = 350;

function optionLabel(column: TableColumnConfig, option: string): string {
    if (column.dataType === TableDataType.BADGE || column.dataType === TableDataType.SELECT) {
        return formatBadgeCellValue(option, column.badgeLabels);
    }
    if (column.dataType === TableDataType.BOOLEAN) {
        if (option === "true") return "Sim";
        if (option === "false") return "Não";
    }
    if (column.avatarTagLabels?.[option]) return column.avatarTagLabels[option];
    return formatCellValue(option, column.dataType);
}

function toSingle(value: string[]): string {
    return value[0] ?? "";
}

function fromSingle(raw: string): string[] {
    const trimmed = raw.trim();
    return trimmed ? [trimmed] : [];
}

export function ColumnFilterControl({ column, options, value, onChange }: ColumnFilterControlProps) {
    const dataType = column.dataType ?? TableDataType.STRING;
    const current = toSingle(value);
    const [draft, setDraft] = useState(current);

    useEffect(() => {
        setDraft(current);
    }, [current]);

    useEffect(() => {
        if (isSelectFilterDataType(dataType) || dataType === TableDataType.DATE || dataType === TableDataType.DATETIME) {
            return;
        }
        const handle = window.setTimeout(() => {
            const next = fromSingle(draft);
            const prev = fromSingle(current);
            if (next[0] === prev[0]) return;
            onChange(next);
        }, TEXT_DEBOUNCE_MS);
        return () => window.clearTimeout(handle);
    }, [current, dataType, draft, onChange]);

    const selectItems: SelectItem[] = useMemo(() => {
        const source =
            dataType === TableDataType.BOOLEAN && options.length === 0 ? ["true", "false"] : options;
        return source.map((option) => ({
            value: option,
            label: optionLabel(column, option),
        }));
    }, [column, dataType, options]);

    if (isSelectFilterDataType(dataType)) {
        return (
            <InputSelect
                items={selectItems}
                value={current}
                onValueChange={(next) => onChange(fromSingle(next))}
                placeholder="Todos"
                clearable
                wrapperClassName="min-w-0"
            />
        );
    }

    if (dataType === TableDataType.DATE || dataType === TableDataType.DATETIME) {
        return (
            <InputDate
                value={current}
                onValueChange={(iso) => onChange(fromSingle(iso))}
                wrapperClassName="min-w-0"
            />
        );
    }

    const inputMode =
        dataType === TableDataType.INTEGER ||
        dataType === TableDataType.DECIMAL ||
        dataType === TableDataType.FLOAT ||
        dataType === TableDataType.MONEY ||
        dataType === TableDataType.CURRENCY ||
        dataType === TableDataType.PERCENT
            ? "decimal"
            : dataType === TableDataType.CPF ||
                dataType === TableDataType.CNPJ ||
                dataType === TableDataType.CEP ||
                dataType === TableDataType.PHONE
              ? "numeric"
              : "text";

    return (
        <label className="gommo-field w-full cursor-text">
            <input
                type="text"
                inputMode={inputMode}
                value={draft}
                placeholder="Filtrar…"
                aria-label={`Filtrar ${column.columnName}`}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                    if (event.key === "Enter") {
                        onChange(fromSingle(draft));
                    }
                }}
            />
        </label>
    );
}
