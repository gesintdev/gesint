"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useState, type SubmitEvent } from "react";
import { toast } from "sonner";
import { PAYSLIP_CLIENT_MESSAGES } from "@/modules/payroll/payslip/exceptions/payslip.messages";
import type { PayslipCreateDto } from "@/modules/payroll/payslip/dto/payslip.dto";
import { emptyPayslipForm, payslipToFormDto } from "@/modules/payroll/payslip/lib/payslip.mapper";
import { payslipKeys } from "@/modules/payroll/payslip/payslip.query";
import { payslipService } from "@/modules/payroll/payslip/services/payslip.service";
import { canEditPayrollRun, isPayrollRunLocked } from "@/modules/payroll/lib/payroll-run-lifecycle";
import { payrollrunKeys } from "@/modules/payroll/payroll.query";
import { payrollrunService } from "@/modules/payroll/services/payroll-run.service";
import { useCrudScreen } from "@/shared/components/crud/CrudScreen";
import { CrudFormShell } from "@/shared/components/crud/CrudFormShell";
import { CollaboratorPickerField } from "@/shared/components/crud/CollaboratorPickerField";
import { EntityPickerField } from "@/shared/components/crud/EntityPickerField";
import { ExceptionCapture } from "@/shared/exceptions";
import { Button } from "@/shared/components/ui/Button";
import { FormSection } from "@/shared/components/ui/FormSection";
import { type FormStepNavItem } from "@/shared/components/ui/FormStepper";
import { InputCurrency } from "@/shared/components/ui/input/index";

const FORM_STEPS: FormStepNavItem[] = [{ id: "cadastro", label: "Contracheque" }];

export function PayslipFormClient() {
  const { editingId, isEditing, goToList, startCreate } = useCrudScreen();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<PayslipCreateDto>(() => emptyPayslipForm());
  const [error, setError] = useState<string | null>(null);

  const detailQuery = useQuery({
    queryKey: payslipKeys.detail(editingId ?? ""),
    queryFn: () => payslipService.getById(editingId!),
    enabled: isEditing && Boolean(editingId),
  });

  const payrollRunId = form.payrollRunId ?? detailQuery.data?.payrollRunId;

  const payrollRunQuery = useQuery({
    queryKey: payrollrunKeys.detail(payrollRunId ?? ""),
    queryFn: () => payrollrunService.getById(payrollRunId!),
    enabled: Boolean(payrollRunId),
  });

  const payrollRunStatus = payrollRunQuery.data?.payrollStatus;
  const readOnly = Boolean(payrollRunId) && !canEditPayrollRun(payrollRunStatus);

  useEffect(() => {
    if (!isEditing) {
      setForm(emptyPayslipForm());
      setError(null);
      return;
    }
    if (detailQuery.data) {
      setForm(payslipToFormDto(detailQuery.data));
      setError(null);
    }
  }, [isEditing, detailQuery.data]);

  const searchPayrollRuns = useCallback(
    (query: string, page: number) => payrollrunService.searchForAutocomplete(query, page),
    [],
  );

  const resolvePayrollRunLabel = useCallback(async (id: string) => {
    const run = await payrollrunService.getById(id);
    return `Competência ${String(run.referenceMonth).padStart(2, "0")}/${run.referenceYear}`;
  }, []);

  const saveMutation = useMutation({
    mutationFn: async (dto: PayslipCreateDto) => {
      const payload = {
        ...dto,
        grossAmount: dto.grossAmount ? Number(dto.grossAmount) : undefined,
        deductionsAmount: dto.deductionsAmount ? Number(dto.deductionsAmount) : undefined,
        netAmount: dto.netAmount ? Number(dto.netAmount) : undefined,
      };
      if (isEditing && editingId) return payslipService.update(editingId, payload as PayslipCreateDto);
      return payslipService.create(payload as PayslipCreateDto);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: payslipKeys.all });
      if (editingId) await queryClient.invalidateQueries({ queryKey: payslipKeys.detail(editingId) });
      toast.success(isEditing ? "Holerite atualizado" : "Holerite cadastrado");
      setForm(emptyPayslipForm());
      goToList();
    },
    onError: (err: unknown) => {
      const ex = ExceptionCapture.handle(err, { fallbackMessage: PAYSLIP_CLIENT_MESSAGES.PAYSLIP_SAVE_FAILED });
      setError(ex.displayMessage);
    },
  });

  const update = <K extends keyof PayslipCreateDto>(field: K, value: PayslipCreateDto[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (readOnly) return;
    setError(null);
    saveMutation.mutate(form);
  };

  if (isEditing && detailQuery.isLoading) {
    return <div className="grid gap-2 p-5">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton-shimmer h-10 w-full" />)}</div>;
  }

  if (isEditing && detailQuery.isError) {
    return (
      <div className="p-5">
        <p className="text-sm font-medium text-error">{ExceptionCapture.displayMessage(detailQuery.error, PAYSLIP_CLIENT_MESSAGES.PAYSLIP_LOAD_FAILED)}</p>
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
      <FormSection id="cadastro" title="Contracheque">
        <EntityPickerField
          label="Processamento de folha"
          value={form.payrollRunId ?? ""}
          onValueChange={(v) => update("payrollRunId", v)}
          onSearch={searchPayrollRuns}
          resolveLabel={resolvePayrollRunLabel}
          required
          disabled={readOnly}
        />
        <CollaboratorPickerField
          value={form.collaboratorId ?? ""}
          onValueChange={(v) => {
            if (readOnly) return;
            update("collaboratorId", v);
          }}
          required
        />
        <InputCurrency label="Valor bruto" value={form.grossAmount ?? ""} onValueChange={(v) => update("grossAmount", v)} emitAsDecimal readOnly={readOnly} />
        <InputCurrency label="Descontos" value={form.deductionsAmount ?? ""} onValueChange={(v) => update("deductionsAmount", v)} emitAsDecimal readOnly={readOnly} />
        <InputCurrency label="Valor líquido" value={form.netAmount ?? ""} onValueChange={(v) => update("netAmount", v)} emitAsDecimal readOnly={readOnly} />
        {readOnly ? (
          <p className="sm:col-span-2 text-sm text-base-content/60">
            {isPayrollRunLocked(payrollRunStatus)
              ? "Competência fechada: holerite bloqueado para edição."
              : "Competência em processamento: holerite bloqueado para edição."}
          </p>
        ) : null}
      </FormSection>
      {error ? <p className="text-sm font-medium text-error">{error}</p> : null}
    </CrudFormShell>
  );
}

