"use client";
import { useCallback, useState } from "react";
import { isoToDateBr, maskDateBr, parseDateBrToIso } from "@/shared/lib/input/date";

type UseDateFieldOptions = {
    value: string;
    onValueChange: (iso: string) => void;
    min?: string;
    max?: string;
};

export function useDateField({ value, onValueChange, min, max }: UseDateFieldOptions) {
    const [open, setOpen] = useState(false);
    const [localError, setLocalError] = useState<string | undefined>();
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState("");
    const display = isEditing ? editText : isoToDateBr(value);
    const commitDisplay = useCallback(
        (raw: string) => {
            const masked = maskDateBr(raw);
            if (!masked) {
                setLocalError(undefined);
                onValueChange("");
                return;
            }

            if (masked.length < 10) {
                setLocalError(undefined);
                return;
            }
            const iso = parseDateBrToIso(masked);
            if (!iso) {
                setLocalError("Data inválida");
                return;
            }

            if (min && iso < min) {
                setLocalError(`Data mínima: ${isoToDateBr(min)}`);
                return;
            }

            if (max && iso > max) {
                setLocalError(`Data máxima: ${isoToDateBr(max)}`);
                return;
            }
            setLocalError(undefined);
            onValueChange(iso);
        },
        [max, min, onValueChange],
    );
    const handlePick = useCallback(
        (iso: string) => {
            setLocalError(undefined);
            onValueChange(iso);
            setIsEditing(false);
            setOpen(false);
        },
        [onValueChange],
    );
    const startEditing = useCallback(() => {
        setIsEditing(true);
        setEditText(isoToDateBr(value));
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
        onChangeEdit: (raw: string) => setEditText(maskDateBr(raw)),
    };
}
