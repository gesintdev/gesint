"use client";

import { useCallback, useEffect, useState } from "react";
import { InputAutocomplete } from "@/shared/components/ui/input/index";
import type { SelectSearchFn } from "@/shared/components/ui/input/select-item.types";

type EntityPickerFieldProps = {
  label: string;
  hint?: string;
  value: string;
  onValueChange: (id: string) => void;
  onSearch: SelectSearchFn;
  resolveLabel: (id: string) => Promise<string>;
  placeholder?: string;
  required?: boolean;
  error?: string;
  wrapperClassName?: string;
};

export function EntityPickerField({
  label,
  hint,
  value,
  onValueChange,
  onSearch,
  resolveLabel,
  placeholder = "Digite para buscar…",
  required,
  error,
  wrapperClassName,
}: EntityPickerFieldProps) {
  const [selectedLabel, setSelectedLabel] = useState("");

  useEffect(() => {
    const id = value?.trim();
    if (!id) {
      setSelectedLabel("");
      return;
    }

    let cancelled = false;
    void resolveLabel(id)
      .then((name) => {
        if (!cancelled) setSelectedLabel(name);
      })
      .catch(() => {
        if (!cancelled) setSelectedLabel("");
      });

    return () => {
      cancelled = true;
    };
  }, [value, resolveLabel]);

  const search = useCallback(
    (query: string, page: number) => onSearch(query, page),
    [onSearch],
  );

  return (
    <InputAutocomplete
      label={label}
      hint={hint}
      value={value ?? ""}
      selectedLabel={selectedLabel}
      onValueChange={(v, item) => {
        onValueChange(v);
        setSelectedLabel(item?.label ?? "");
      }}
      onSearch={search}
      placeholder={placeholder}
      required={required}
      error={error}
      wrapperClassName={wrapperClassName}
    />
  );
}
