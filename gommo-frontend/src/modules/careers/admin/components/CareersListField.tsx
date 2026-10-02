"use client";

import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";

import { CareersImageField } from "@/modules/careers/admin/components/CareersImageField";
import { Button } from "@/shared/components/ui/Button";
import { InputString } from "@/shared/components/ui/input/index";

type ListFieldDef = {
    key: string;
    label: string;
    placeholder?: string;
    multiline?: boolean;
    image?: boolean;
};

type CareersListFieldProps = {
    label: string;
    items: Record<string, string>[];
    fields: ListFieldDef[];
    addLabel: string;
    max?: number;
    disabled?: boolean;
    onChange: (items: Record<string, string>[]) => void;
};

const TEXTAREA_CLASS =
    "w-full resize-y rounded-lg border border-base-content/15 bg-base-100 px-3 py-2 text-sm outline-none focus:border-primary";

/** Lista editável de itens (benefícios, números, perguntas...). */
export function CareersListField({ label, items, fields, addLabel, max = 12, disabled, onChange }: CareersListFieldProps) {
    const update = (index: number, key: string, value: string) => {
        onChange(items.map((item, i) => (i === index ? { ...item, [key]: value } : item)));
    };
    const move = (index: number, delta: number) => {
        const target = index + delta;
        if (target < 0 || target >= items.length) return;
        const next = [...items];
        [next[index], next[target]] = [next[target], next[index]];
        onChange(next);
    };

    return (
        <div className="grid gap-2">
            <span className="text-sm text-base-content/80">{label}</span>
            {items.map((item, index) => (
                <div key={index} className="grid gap-2 rounded-lg border border-(--gommo-border-subtle) bg-base-200/40 p-3">
                    {fields.map((field) =>
                        field.image ? (
                            <CareersImageField
                                key={field.key}
                                label={field.label}
                                value={item[field.key]}
                                disabled={disabled}
                                onChange={(objectId) => update(index, field.key, objectId)}
                            />
                        ) : field.multiline ? (
                            <label key={field.key} className="grid gap-1">
                                <span className="text-xs text-base-content/60">{field.label}</span>
                                <textarea
                                    rows={3}
                                    value={item[field.key] ?? ""}
                                    placeholder={field.placeholder}
                                    disabled={disabled}
                                    onChange={(event) => update(index, field.key, event.target.value)}
                                    className={TEXTAREA_CLASS}
                                />
                            </label>
                        ) : (
                            <InputString
                                key={field.key}
                                label={field.label}
                                value={item[field.key] ?? ""}
                                placeholder={field.placeholder}
                                disabled={disabled}
                                onValueChange={(value) => update(index, field.key, value)}
                            />
                        ),
                    )}
                    <div className="flex justify-end gap-1">
                        <Button
                            variant="ghost"
                            size="sm"
                            aria-label="Mover para cima"
                            disabled={disabled || index === 0}
                            onClick={() => move(index, -1)}
                            leftIcon={<ArrowUp className="size-3.5" strokeWidth={2} />}
                        />
                        <Button
                            variant="ghost"
                            size="sm"
                            aria-label="Mover para baixo"
                            disabled={disabled || index === items.length - 1}
                            onClick={() => move(index, 1)}
                            leftIcon={<ArrowDown className="size-3.5" strokeWidth={2} />}
                        />
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-base-content/50 hover:text-error"
                            aria-label="Remover item"
                            disabled={disabled}
                            onClick={() => onChange(items.filter((_, i) => i !== index))}
                            leftIcon={<Trash2 className="size-3.5" strokeWidth={2} />}
                        />
                    </div>
                </div>
            ))}
            {items.length < max ? (
                <button
                    type="button"
                    disabled={disabled}
                    onClick={() => onChange([...items, Object.fromEntries(fields.map((field) => [field.key, ""]))])}
                    className="flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-base-content/20 px-3 py-2 text-sm font-medium text-primary hover:border-primary disabled:opacity-50"
                >
                    <Plus className="size-4" strokeWidth={2} />
                    {addLabel}
                </button>
            ) : null}
        </div>
    );
}
