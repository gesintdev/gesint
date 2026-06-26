"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import clsx from "clsx";
import { type SubmitEvent,useEffect, useId, useState } from "react";
import { toast } from "sonner";

import {
    BOOL_SELECT_ITEMS,
    PAYROLL_EVENT_TYPE_ITEMS,
} from "@/modules/ctb/payroll/config/payroll.constants";
import type { PayrollEventCreateDto } from "@/modules/ctb/payroll/payroll-event/dto/payroll-event.dto";
import { PAYROLL_EVENT_CLIENT_MESSAGES } from "@/modules/ctb/payroll/payroll-event/exceptions/payroll-event.messages";
import { emptyPayrollEventForm, payrollEventToFormDto } from "@/modules/ctb/payroll/payroll-event/lib/payroll-event.mapper";
import { payrollEventKeys } from "@/modules/ctb/payroll/payroll-event/payroll-event.query";
import { payrollEventService } from "@/modules/ctb/payroll/payroll-event/services/payroll-event.service";
import { CrudFormShell } from "@/shared/components/crud/CrudFormShell";
import { useCrudScreen } from "@/shared/components/crud/CrudScreen";
import { Button } from "@/shared/components/ui/Button";
import { FormSection } from "@/shared/components/ui/FormSection";
import { type FormStepNavItem } from "@/shared/components/ui/FormStepper";
import { InputSelect, InputString } from "@/shared/components/ui/input/index";
import { fieldClass, InputFieldChrome } from "@/shared/components/ui/input/InputFieldChrome";
import { ExceptionCapture } from "@/shared/exceptions";

const FORM_STEPS: FormStepNavItem[] = [{ id: "cadastro", label: "Evento" }];

function boolToSelect(value?: boolean): string {
    return value ? "true" : "false";
}

function selectToBool(value: string): boolean {
    return value === "true";
}

type FormulaTextareaProps = {
    label: string;
    hint?: string;
    value: string;
    onValueChange: (value: string) => void;
    wrapperClassName?: string;
};

function FormulaTextarea({ label, hint, value, onValueChange, wrapperClassName }: FormulaTextareaProps) {
    const autoId = useId();
    const id = `formula-${autoId}`;

    return (
        <InputFieldChrome label={label} hint={hint} id={id} wrapperClassName={wrapperClassName}>
            <textarea
                id={id}
                rows={4}
                value={value}
                onChange={(event) => onValueChange(event.target.value)}
                placeholder="Ex.: baseSalary * 0.1"
                className={clsx("gommo-control w-full resize-y px-3 py-2 text-sm", fieldClass())}
            />
        </InputFieldChrome>
    );
}

export function PayrollEventFormClient() {
  const { editingId, isEditing, goToList, startCreate } = useCrudScreen();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<PayrollEventCreateDto>(emptyPayrollEventForm);
  const [error, setError] = useState<string | null>(null);

  const detailQuery = useQuery({
    queryKey: payrollEventKeys.detail(editingId ?? ""),
    queryFn: () => payrollEventService.getById(editingId!),
    enabled: isEditing && Boolean(editingId),
  });

  useEffect(() => {
    if (!isEditing) {
      setForm(emptyPayrollEventForm());
      setError(null);
      return;
    }
    if (detailQuery.data) {
      setForm(payrollEventToFormDto(detailQuery.data));
      setError(null);
    }
  }, [isEditing, detailQuery.data]);

  const saveMutation = useMutation({
    mutationFn: async (dto: PayrollEventCreateDto) => {
      if (isEditing && editingId) return payrollEventService.update(editingId, dto);
      return payrollEventService.create(dto);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: payrollEventKeys.all });
      if (editingId) await queryClient.invalidateQueries({ queryKey: payrollEventKeys.detail(editingId) });
      toast.success(isEditing ? "Evento de folha atualizado" : "Evento de folha cadastrado");
      setForm(emptyPayrollEventForm());
      goToList();
    },
    onError: (err: unknown) => {
      const ex = ExceptionCapture.handle(err, { fallbackMessage: PAYROLL_EVENT_CLIENT_MESSAGES.PAYROLL_EVENT_SAVE_FAILED });
      setError(ex.displayMessage);
    },
  });

  const update = <K extends keyof PayrollEventCreateDto>(field: K, value: PayrollEventCreateDto[K]) => {
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
        <p className="text-sm font-medium text-error">{ExceptionCapture.displayMessage(detailQuery.error, PAYROLL_EVENT_CLIENT_MESSAGES.PAYROLL_EVENT_LOAD_FAILED)}</p>
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
          {isEditing ? <Button type="button" variant="outline" onClick={startCreate}>Novo</Button> : null}
          <Button type="submit" loading={saveMutation.isPending}>{isEditing ? "Salvar" : "Cadastrar"}</Button>
        </>
      }
    >
      <FormSection id="cadastro" title="Evento de folha">
        <InputString
          label="Chave"
          value={form.eventCode ?? ""}
          onValueChange={(v) => update("eventCode", v)}
          required
          hint="Identificador único do evento (ex.: SAL_BASE)"
          wrapperClassName="sm:col-span-6"
        />
        <InputString
          label="Descrição"
          value={form.description ?? ""}
          onValueChange={(v) => update("description", v)}
          required
          wrapperClassName="sm:col-span-12"
        />
        <InputSelect
          label="Tipo de evento"
          items={PAYROLL_EVENT_TYPE_ITEMS}
          value={form.eventType ?? ""}
          onValueChange={(v) => update("eventType", (v || "EARNING") as PayrollEventCreateDto["eventType"])}
          placeholder="Selecione"
          required
          wrapperClassName="sm:col-span-6"
        />
        <InputSelect
          label="Incide INSS"
          items={BOOL_SELECT_ITEMS}
          value={boolToSelect(form.incidesInss)}
          onValueChange={(v) => update("incidesInss", selectToBool(v))}
          wrapperClassName="sm:col-span-6"
        />
        <InputSelect
          label="Incide FGTS"
          items={BOOL_SELECT_ITEMS}
          value={boolToSelect(form.incidesFgts)}
          onValueChange={(v) => update("incidesFgts", selectToBool(v))}
          wrapperClassName="sm:col-span-6"
        />
        <InputSelect
          label="Incide IRRF"
          items={BOOL_SELECT_ITEMS}
          value={boolToSelect(form.incidesIrrf)}
          onValueChange={(v) => update("incidesIrrf", selectToBool(v))}
          wrapperClassName="sm:col-span-6"
        />
        <FormulaTextarea
          label="Fórmula"
          hint="Expressão avaliada na etapa de processamento (Etapa 3)"
          value={form.formula ?? ""}
          onValueChange={(v) => update("formula", v)}
          wrapperClassName="sm:col-span-12"
        />
      </FormSection>
      {error ? <p className="text-sm font-medium text-error">{error}</p> : null}
    </CrudFormShell>
  );
}
