"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type SubmitEvent,useEffect, useState } from "react";
import { toast } from "sonner";

import type { PayrollRunCreateDto } from "@/modules/ctb/payroll/dto/payroll-run.dto";
import { PAYROLL_CLIENT_MESSAGES } from "@/modules/ctb/payroll/exceptions/payroll-run.messages";
import { emptyPayrollRunForm, payrollrunToFormDto } from "@/modules/ctb/payroll/lib/payroll-run.mapper";
import {
    canEditPayrollRun,
    isPayrollRunLocked,
    payrollStatusLabel,
} from "@/modules/ctb/payroll/lib/payroll-run-lifecycle";
import { payrollrunKeys } from "@/modules/ctb/payroll/payroll.query";
import { payrollrunService } from "@/modules/ctb/payroll/services/payroll-run.service";
import { CrudFormShell } from "@/shared/components/crud/CrudFormShell";
import { useCrudScreen } from "@/shared/components/crud/CrudScreen";
import { Button } from "@/shared/components/ui/Button";
import { FormSection } from "@/shared/components/ui/FormSection";
import { type FormStepNavItem } from "@/shared/components/ui/FormStepper";
import { InputDate, InputMonth, InputString } from "@/shared/components/ui/input/index";
import { ExceptionCapture } from "@/shared/exceptions";

const FORM_STEPS: FormStepNavItem[] = [{ id: "cadastro", label: "Competência" }];

export function PayrollRunFormClient() {
  const { editingId, isEditing, goToList, startCreate } = useCrudScreen();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<PayrollRunCreateDto>(() => emptyPayrollRunForm());
  const [error, setError] = useState<string | null>(null);

  const detailQuery = useQuery({
    queryKey: payrollrunKeys.detail(editingId ?? ""),
    queryFn: () => payrollrunService.getById(editingId!),
    enabled: isEditing && Boolean(editingId),
  });

  const currentStatus = detailQuery.data?.payrollStatus ?? form.payrollStatus;
  const readOnly = isEditing && !canEditPayrollRun(currentStatus);

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
      const payload: PayrollRunCreateDto = {
        referenceDate: dto.referenceDate,
        notes: dto.notes,
      };
      if (isEditing && editingId) return payrollrunService.update(editingId, payload);
      return payrollrunService.create(payload);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: payrollrunKeys.all });
      if (editingId) await queryClient.invalidateQueries({ queryKey: payrollrunKeys.detail(editingId) });
      toast.success(isEditing ? "Competência atualizada" : "Competência cadastrada");
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
    return <div className="grid gap-2 p-5">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton-shimmer h-10 w-full" />)}</div>;
  }

  if (isEditing && detailQuery.isError) {
    return (
      <div className="p-5">
        <p className="text-sm font-medium text-error">{ExceptionCapture.displayMessage(detailQuery.error, PAYROLL_CLIENT_MESSAGES.PAYROLL_LOAD_FAILED)}</p>
        <Button variant="ghost" size="sm" className="mt-3" onClick={goToList}>Voltar</Button>
      </div>
    );
  }

  return (
    <CrudFormShell
      onSubmit={handleSubmit}
      stepper={{
        steps: FORM_STEPS,
        entityCode: isEditing ? detailQuery.data?.code : undefined,
        resetKey: editingId ?? "new",
      }}
      footer={
        <>
          <Button type="button" variant="ghost" onClick={goToList}>Cancelar</Button>
          {isEditing && !readOnly ? <Button type="button" variant="outline" onClick={startCreate}>Novo</Button> : null}
          {!readOnly ? <Button type="submit" loading={saveMutation.isPending}>{isEditing ? "Salvar" : "Cadastrar"}</Button> : null}
        </>
      }
    >
      <FormSection id="cadastro" title="Competência">
        {isEditing ? (
          <InputString
            label="Status da folha"
            value={payrollStatusLabel(currentStatus)}
            onValueChange={() => undefined}
            readOnly
            hint="Alterado pelas ações Processar, Revisar, Fechar e Reabrir na listagem"
            wrapperClassName="sm:col-span-6"
          />
        ) : null}
        <InputMonth
          label="Competência"
          value={form.referenceDate ?? ""}
          onValueChange={(v) => update("referenceDate", v)}
          required
          readOnly={readOnly}
          wrapperClassName="sm:col-span-12"
          hint="Mês/ano de referência da folha"
        />
        {isEditing && detailQuery.data?.openedAt ? (
          <InputDate label="Data de abertura" value={detailQuery.data.openedAt.slice(0, 10)} onValueChange={() => undefined} readOnly wrapperClassName="sm:col-span-6" />
        ) : null}
        {isEditing && detailQuery.data?.closedAt ? (
          <InputDate label="Data de fechamento" value={detailQuery.data.closedAt.slice(0, 10)} onValueChange={() => undefined} readOnly wrapperClassName="sm:col-span-6" />
        ) : null}
        <InputString
          label="Observações"
          value={form.notes ?? ""}
          onValueChange={(v) => update("notes", v)}
          wrapperClassName="sm:col-span-12"
          readOnly={readOnly}
        />
        {isEditing && isPayrollRunLocked(currentStatus) ? (
          <p className="sm:col-span-12 text-sm text-base-content/60">
            Competência fechada: dados bloqueados para edição. Use Reabrir na listagem para ajustes.
          </p>
        ) : null}
      </FormSection>
      {error ? <p className="text-sm font-medium text-error">{error}</p> : null}
    </CrudFormShell>
  );
}
