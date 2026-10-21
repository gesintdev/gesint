import { useCallback, useState } from "react";

import { isoToMonthBr, maskMonthBr, normalizeMonthIso, parseMonthBrToIso } from "@/shared/lib/input/date";

type UseMonthFieldOptions = {
    value: string;
    onValueChange: (iso: string) => void;
    min?: string;
    max?: string;
};

export function useMonthField({ value, onValueChange, min, max }: UseMonthFieldOptions) {
    const [open, setOpen] = useState(false);
    const [localError, setLocalError] = useState<string | undefined>();
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState("");
    const display = isEditing ? editText : isoToMonthBr(value);
    const commitDisplay = useCallback(
        (raw: string) => {
            const masked = maskMonthBr(raw);
            if (!masked) {
                setLocalError(undefined);
                onValueChange("");
                return;
            }

            if (masked.length < 7) {
                setLocalError(undefined);
                return;
            }
            const iso = parseMonthBrToIso(masked);
            if (!iso) {
                setLocalError("Compet\u00eancia inv\u00e1lida");
                return;
            }

            if (min && iso < min) {
                setLocalError(`Compet\u00eancia m\u00ednima: ${isoToMonthBr(min)}`);
                return;
            }

            if (max && iso > max) {
                setLocalError(`Compet\u00eancia m\u00e1xima: ${isoToMonthBr(max)}`);
                return;
            }
            setLocalError(undefined);
            onValueChange(iso);
        },
        [max, min, onValueChange],
    );
    const handlePick = useCallback(
        (iso: string) => {
            const normalized = normalizeMonthIso(iso);
            setLocalError(undefined);
            onValueChange(normalized);
            setIsEditing(false);
            setOpen(false);
        },
        [onValueChange],
    );
    const startEditing = useCallback(() => {
        setIsEditing(true);
        setEditText(isoToMonthBr(value));
    }, [value]);
    const handleBlur = useCallback(
        (raw: string) => {
            commitDisplay(raw);
            setIsEditing(false);
        },
        [commitDisplay],
    );
    return {
        open,
        setOpen,
        localError,
        display,
        startEditing,
        handleBlur,
        handlePick,
        onChangeEdit: (raw: string) => setEditText(maskMonthBr(raw)),
    };
}
