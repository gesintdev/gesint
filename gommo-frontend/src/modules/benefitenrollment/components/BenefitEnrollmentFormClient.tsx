"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { benefitplanService } from "@/modules/benefit/services/benefit-plan.service";
import { BENEFIT_ENROLLMENT_CLIENT_MESSAGES } from "@/modules/benefitenrollment/exceptions/benefit-enrollment.messages";
import type { BenefitEnrollmentCreateDto } from "@/modules/benefitenrollment/dto/benefit-enrollment.dto";
import { emptyBenefitEnrollmentForm, benefitEnrollmentToFormDto } from "@/modules/benefitenrollment/lib/benefit-enrollment.mapper";
import { benefitEnrollmentKeys } from "@/modules/benefitenrollment/benefitenrollment.query";
import { benefitEnrollmentService } from "@/modules/benefitenrollment/services/benefit-enrollment.service";
import { useCrudScreen } from "@/shared/components/crud/CrudScreen";
import { CrudFormShell } from "@/shared/components/crud/CrudFormShell";
import { CollaboratorPickerField } from "@/shared/components/crud/CollaboratorPickerField";
import { EntityPickerField } from "@/shared/components/crud/EntityPickerField";
import { ExceptionCapture } from "@/shared/exceptions";
import { Button } from "@/shared/components/ui/Button";
import { InputString, InputDate, InputCurrency } from "@/shared/components/ui/input/index";

export function BenefitEnrollmentFormClient() {
  const { editingId, isEditing, goToList, startCreate } = useCrudScreen();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<BenefitEnrollmentCreateDto>(emptyBenefitEnrollmentForm);
  const [error, setError] = useState<string | null>(null);

  const detailQuery = useQuery({
    queryKey: benefitEnrollmentKeys.detail(editingId ?? ""),
    queryFn: () => benefitEnrollmentService.getById(editingId!),
    enabled: isEditing && Boolean(editingId),
  });

  useEffect(() => {
    if (!isEditing) {
      setForm(emptyBenefitEnrollmentForm());
      setError(null);
      return;
    }
    if (detailQuery.data) {
      setForm(benefitEnrollmentToFormDto(detailQuery.data));
      setError(null);
    }
  }, [isEditing, detailQuery.data]);

  const searchBenefitPlans = useCallback(
    (query: string, page: number) => benefitplanService.searchForAutocomplete(query, page),
    [],
  );

  const resolveBenefitPlanLabel = useCallback(async (id: string) => {
    const plan = await benefitplanService.getById(id);
    return plan.name;
  }, []);

  const saveMutation = useMutation({
    mutationFn: async (dto: BenefitEnrollmentCreateDto) => {
      const payload = {
        ...dto,
        monthlyValue: dto.monthlyValue ? Number(dto.monthlyValue) : undefined,
      };
      if (isEditing && editingId) return benefitEnrollmentService.update(editingId, payload as BenefitEnrollmentCreateDto);
      return benefitEnrollmentService.create(payload as BenefitEnrollmentCreateDto);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: benefitEnrollmentKeys.all });
      if (editingId) await queryClient.invalidateQueries({ queryKey: benefitEnrollmentKeys.detail(editingId) });
      toast.success(isEditing ? "Vínculo atualizado" : "Vínculo cadastrado");
      setForm(emptyBenefitEnrollmentForm());
      goToList();
    },
    onError: (err: unknown) => {
      const ex = ExceptionCapture.handle(err, { fallbackMessage: BENEFIT_ENROLLMENT_CLIENT_MESSAGES.BENEFIT_ENROLLMENT_SAVE_FAILED });
      setError(ex.displayMessage);
    },
  });

  const update = <K extends keyof BenefitEnrollmentCreateDto>(field: K, value: BenefitEnrollmentCreateDto[K]) => {
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
        <p className="text-sm font-medium text-error">{ExceptionCapture.displayMessage(detailQuery.error, BENEFIT_ENROLLMENT_CLIENT_MESSAGES.BENEFIT_ENROLLMENT_LOAD_FAILED)}</p>
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
        <div className="sm:col-span-2">
          <p className="text-sm font-semibold text-base-content">{isEditing ? "Editar vínculo de benefício" : "Novo vínculo de benefício"}</p>
        </div>
        <CollaboratorPickerField value={form.collaboratorId} onValueChange={(v) => update("collaboratorId", v)} required />
        <EntityPickerField
          label="Plano de benefício"
          value={form.benefitPlanId}
          onValueChange={(v) => update("benefitPlanId", v)}
          onSearch={searchBenefitPlans}
          resolveLabel={resolveBenefitPlanLabel}
          required
        />
        <InputDate label="Vigência — início" value={form.startDate} onValueChange={(v) => update("startDate", v)} required />
        <InputDate label="Vigência — fim" value={form.endDate ?? ""} onValueChange={(v) => update("endDate", v)} />
        <InputCurrency label="Valor mensal" value={form.monthlyValue ?? ""} onValueChange={(v) => update("monthlyValue", v)} emitAsDecimal hint="Opcional — sobrescreve o valor do plano" />
        <InputString label="Observações" value={form.notes ?? ""} onValueChange={(v) => update("notes", v)} wrapperClassName="sm:col-span-2" />
        {error && <p className="text-sm font-medium text-error sm:col-span-2">{error}</p>}
      </div>
    </CrudFormShell>
  );
}
