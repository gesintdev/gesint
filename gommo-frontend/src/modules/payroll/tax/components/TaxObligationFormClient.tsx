"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { TAX_CLIENT_MESSAGES } from "@/modules/payroll/tax/exceptions/tax-obligation.messages";
import type { TaxObligationCreateDto } from "@/modules/payroll/tax/dto/tax-obligation.dto";
import { emptyTaxObligationForm, taxObligationToFormDto } from "@/modules/payroll/tax/lib/tax-obligation.mapper";
import { taxObligationKeys } from "@/modules/payroll/tax/tax.query";
import { taxObligationService } from "@/modules/payroll/tax/services/tax-obligation.service";
import { useCrudScreen } from "@/shared/components/crud/CrudScreen";
import { CrudFormShell } from "@/shared/components/crud/CrudFormShell";
import { EntityCodeField } from "@/shared/components/crud/EntityCodeField";
import { CollaboratorPickerField } from "@/shared/components/crud/CollaboratorPickerField";
import { ExceptionCapture } from "@/shared/exceptions";
import { Button } from "@/shared/components/ui/Button";
import { InputString, InputDate, InputCurrency, InputSelect } from "@/shared/components/ui/input/index";

const OBLIGATION_TYPE_ITEMS = [
  { value: "IRRF", label: "IRRF" },
  { value: "INSS", label: "INSS" },
  { value: "FGTS", label: "FGTS" },
  { value: "OTHER", label: "Outro" },
];

export function TaxObligationFormClient() {
  const { editingId, isEditing, goToList, startCreate } = useCrudScreen();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<TaxObligationCreateDto>(emptyTaxObligationForm);
  const [error, setError] = useState<string | null>(null);

  const detailQuery = useQuery({
    queryKey: taxObligationKeys.detail(editingId ?? ""),
    queryFn: () => taxObligationService.getById(editingId!),
    enabled: isEditing && Boolean(editingId),
  });

  useEffect(() => {
    if (!isEditing) {
      setForm(emptyTaxObligationForm());
      setError(null);
      return;
    }
    if (detailQuery.data) {
      setForm(taxObligationToFormDto(detailQuery.data));
      setError(null);
    }
  }, [isEditing, detailQuery.data]);

  const saveMutation = useMutation({
    mutationFn: async (dto: TaxObligationCreateDto) => {
      const payload = {
        ...dto,
        baseAmount: dto.baseAmount ? Number(dto.baseAmount) : undefined,
        ratePercent: dto.ratePercent ? Number(dto.ratePercent) : undefined,
      };
      if (isEditing && editingId) return taxObligationService.update(editingId, payload as TaxObligationCreateDto);
      return taxObligationService.create(payload as TaxObligationCreateDto);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: taxObligationKeys.all });
      if (editingId) await queryClient.invalidateQueries({ queryKey: taxObligationKeys.detail(editingId) });
      toast.success(isEditing ? "Obrigação fiscal atualizada" : "Obrigação fiscal cadastrada");
      setForm(emptyTaxObligationForm());
      goToList();
    },
    onError: (err: unknown) => {
      const ex = ExceptionCapture.handle(err, { fallbackMessage: TAX_CLIENT_MESSAGES.TAX_SAVE_FAILED });
      setError(ex.displayMessage);
    },
  });

  const update = <K extends keyof TaxObligationCreateDto>(field: K, value: TaxObligationCreateDto[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    saveMutation.mutate(form);
  };

  if (isEditing && detailQuery.isLoading) {
    return <div className="grid gap-2 p-5">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton-shimmer h-10 w-full" />)}</div>;
  }

  if (isEditing && detailQuery.isError) {
    return (
      <div className="p-5">
        <p className="text-sm font-medium text-error">{ExceptionCapture.displayMessage(detailQuery.error, TAX_CLIENT_MESSAGES.TAX_LOAD_FAILED)}</p>
        <Button variant="ghost" size="sm" className="mt-3" onClick={goToList}>Voltar</Button>
      </div>
    );
  }

  return (
    <CrudFormShell
      onSubmit={handleSubmit}
      footer={
        <>
          <Button type="button" variant="ghost" onClick={goToList}>Cancelar</Button>
          {isEditing && <Button type="button" variant="outline" onClick={startCreate}>Novo</Button>}
          <Button type="submit" loading={saveMutation.isPending}>{isEditing ? "Salvar" : "Cadastrar"}</Button>
        </>
      }
    >
      <div className="grid gap-3 p-4 sm:grid-cols-2">
        <EntityCodeField code={isEditing ? detailQuery.data?.code : undefined} />
        <div className="sm:col-span-2">
          <CollaboratorPickerField value={form.collaboratorId} onValueChange={(v) => update("collaboratorId", v)} required />
        </div>
        <InputSelect
          label="Tipo de obrigação"
          items={OBLIGATION_TYPE_ITEMS}
          value={form.obligationType ?? ""}
          onValueChange={(v) => update("obligationType", (v || undefined) as TaxObligationCreateDto["obligationType"])}
          placeholder="Selecione"
          required
        />
        <InputString label="Código de referência" value={form.referenceCode ?? ""} onValueChange={(v) => update("referenceCode", v)} />
        <InputDate label="Vigência — início" value={form.startDate} onValueChange={(v) => update("startDate", v)} required />
        <InputDate label="Vigência — fim" value={form.endDate ?? ""} onValueChange={(v) => update("endDate", v)} />
        <InputCurrency label="Base de cálculo" value={form.baseAmount ?? ""} onValueChange={(v) => update("baseAmount", v)} emitAsDecimal />
        <InputString label="Alíquota (%)" value={form.ratePercent ?? ""} onValueChange={(v) => update("ratePercent", v)} hint="Ex.: 7.5" />
        <InputString label="Observações" value={form.notes ?? ""} onValueChange={(v) => update("notes", v)} wrapperClassName="sm:col-span-2" />
        {error && <p className="text-sm font-medium text-error sm:col-span-2">{error}</p>}
      </div>
    </CrudFormShell>
  );
}
