"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, type SubmitEvent } from "react";
import { toast } from "sonner";
import { PAYROLL_CLIENT_MESSAGES } from "@/modules/payroll/exceptions/payroll-run.messages";
import type { PayrollRunCreateDto } from "@/modules/payroll/dto/payroll-run.dto";
import { emptyPayrollRunForm, payrollrunToFormDto } from "@/modules/payroll/lib/payroll-run.mapper";
import { payrollrunKeys } from "@/modules/payroll/payroll.query";
import { payrollrunService } from "@/modules/payroll/services/payroll-run.service";
import { useCrudScreen } from "@/shared/components/crud/CrudScreen";
import { CrudFormShell } from "@/shared/components/crud/CrudFormShell";
import { EntityCodeField } from "@/shared/components/crud/EntityCodeField";
import { ExceptionCapture } from "@/shared/exceptions";
import { Button } from "@/shared/components/ui/Button";
import { InputSelect, InputDecimal } from "@/shared/components/ui/input/index";

export function PayrollRunFormClient() {
  const { editingId, isEditing, goToList, startCreate } = useCrudScreen();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<PayrollRunCreateDto>(emptyPayrollRunForm);
  const [error, setError] = useState<string | null>(null);

  const detailQuery = useQuery({
    queryKey: payrollrunKeys.detail(editingId ?? ""),
    queryFn: () => payrollrunService.getById(editingId!),
    enabled: isEditing && Boolean(editingId),
  });

  useEffect(() => {
    if (!isEditing) {
      setForm(emptyPayrollRunForm());
      setError(null);
      return;
    }
    if (detailQuery.data) {
      setForm(payrollrunToFormDto(detailQuery.data));
      setError(null);
    }
  }, [isEditing, detailQuery.data]);

  const saveMutation = useMutation({
    mutationFn: async (dto: PayrollRunCreateDto) => {
      if (isEditing && editingId) return payrollrunService.update(editingId, dto);
      return payrollrunService.create(dto);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: payrollrunKeys.all });
      if (editingId) await queryClient.invalidateQueries({ queryKey: payrollrunKeys.detail(editingId) });
      toast.success(isEditing ? "Folha atualizado(a)" : "Folha cadastrado(a)");
      setForm(emptyPayrollRunForm());
      goToList();
    },
    onError: (err: unknown) => {
      const ex = ExceptionCapture.handle(err, { fallbackMessage: PAYROLL_CLIENT_MESSAGES.PAYROLL_SAVE_FAILED });
      setError(ex.displayMessage);
    },
  });

  const update = <K extends keyof PayrollRunCreateDto>(field: K, value: PayrollRunCreateDto[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    saveMutation.mutate(form);
  };

  if (isEditing && detailQuery.isLoading) {
    return <div className="gommo-crud-panel-inset grid gap-2">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton-shimmer h-10 w-full" />)}</div>;
  }

  if (isEditing && detailQuery.isError) {
    return (
      <div className="gommo-crud-panel-inset">
        <p className="text-sm font-medium text-error">{ExceptionCapture.displayMessage(detailQuery.error, PAYROLL_CLIENT_MESSAGES.PAYROLL_LOAD_FAILED)}</p>
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
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <p className="text-sm font-semibold text-base-content">{isEditing ? "Editar folha" : "Novo(a) folha"}</p>
      </div>
                <EntityCodeField code={isEditing ? detailQuery.data?.code : undefined} />
      <InputDecimal label="Reference Year" value={String(form.referenceYear ?? "")} onValueChange={(v) => update("referenceYear", Number(v) || 0)} required />
      <InputDecimal label="Reference Month" value={String(form.referenceMonth ?? "")} onValueChange={(v) => update("referenceMonth", Number(v) || 0)} required />
      <InputSelect
        label="Payroll Status"
        items={[  { value: "DRAFT", label: "Rascunho" },
  { value: "PROCESSING", label: "Processando" },
  { value: "CLOSED", label: "Fechado" },
  { value: "CANCELLED", label: "Cancelado" },]}
        value={form.payrollStatus ?? ""}
        onValueChange={(v) => update("payrollStatus", (v || undefined) as PayrollRunCreateDto["payrollStatus"])}
        placeholder="Selecione"
        clearable
      />
      {error && <p className="text-sm font-medium text-error sm:col-span-2">{error}</p>}
    </div>
    </CrudFormShell>
  );
}
