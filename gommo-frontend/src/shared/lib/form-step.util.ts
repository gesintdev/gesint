export type StepFieldCheck = {
    value: unknown;
    empty?: unknown;
};

export function isFormValueFilled(value: unknown): boolean {
    if (value === null || value === undefined) return false;
    if (typeof value === "string") return value.trim() !== "";
    if (typeof value === "number") return !Number.isNaN(value);
    if (typeof value === "boolean") return value;
    return true;
}

/** Step has at least one field with meaningful content (optionally ignoring empty defaults). */
export function isStepFilled(fields: StepFieldCheck[]): boolean {
    return fields.some(({ value, empty }) => {
        if (!isFormValueFilled(value)) return false;
        if (empty !== undefined && value === empty) return false;
        return true;
    });
}

/** True when any listed key differs from the empty form snapshot. */
export function sectionHasChanges<T extends object>(
    form: T,
    empty: T,
    keys: (keyof T)[],
): boolean {
    return keys.some((key) => {
        const value = form[key];
        const baseline = empty[key];
        if (!isFormValueFilled(value)) return false;
        return value !== baseline;
    });
}
