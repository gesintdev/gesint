"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { collaboratorService } from "@/modules/collaborator/services/collaborator.service";
import type { LeaveRequestCreateDto } from "@/modules/leave/dto/leave-request.dto";
import { LEAVE_CLIENT_MESSAGES } from "@/modules/leave/exceptions/leave-request.messages";
import { emptyLeaveRequestForm, leaverequestToFormDto } from "@/modules/leave/lib/leave-request.mapper";
import { leaverequestKeys } from "@/modules/leave/leave.query";
import { leaveRequestFormSchema } from "@/modules/leave/schemas/leave-request.schema";
import { leaverequestService } from "@/modules/leave/services/leave-request.service";
import { useCrudScreen } from "@/shared/components/crud/CrudScreen";
import { CrudFormShell } from "@/shared/components/crud/CrudFormShell";
import { Button } from "@/shared/components/ui/Button";
import { InputAutocomplete, InputDate, InputSelect } from "@/shared/components/ui/input/index";
import type { SelectItem } from "@/shared/components/ui/input/select-item.types";
import { ExceptionCapture } from "@/shared/exceptions";
import { mapZodFieldErrors } from "@/shared/lib/zod-field-errors";

const LEAVE_TYPE_ITEMS: SelectItem[] = [
  { value: "VACATION", label: "Férias" },
  { value: "MEDICAL", label: "Afastamento médico" },
  { value: "MATERNITY", label: "Maternidade" },
  { value: "PATERNITY", label: "Paternidade" },
  { value: "UNPAID", label: "Não remunerado" },
  { value: "OTHER", label: "Outro" },
];

const APPROVAL_ITEMS: SelectItem[] = [
  { value: "true", label: "Aprovado" },
  { value: "false", label: "Pendente" },
];

type LeaveFormField = keyof LeaveRequestCreateDto;

export function LeaveRequestFormClient() {
  const { editingId, isEditing, goToList, startCreate } = useCrudScreen();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<LeaveRequestCreateDto>(emptyLeaveRequestForm);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<LeaveFormField, string>>>({});
  const [collaboratorLabel, setCollaboratorLabel] = useState("");

  const detailQuery = useQuery({
    queryKey: leaverequestKeys.detail(editingId ?? ""),
    queryFn: () => leaverequestService.getById(editingId!),
    enabled: isEditing && Boolean(editingId),
  });

  useEffect(() => {
    if (!isEditing) {
      setForm(emptyLeaveRequestForm());
      setError(null);
      setFieldErrors({});
      setCollaboratorLabel("");
      return;
    }
    if (detailQuery.data) {
      setForm(leaverequestToFormDto(detailQuery.data));
      setError(null);
      setFieldErrors({});
    }
  }, [isEditing, detailQuery.data]);

  useEffect(() => {
    const id = form.collaboratorId?.trim();
    if (!id) {
      setCollaboratorLabel("");
      return;
    }

    let cancelled = false;
    void collaboratorService
      .getById(id)
      .then((c) => {
        if (!cancelled) setCollaboratorLabel(c.fullName);
      })
      .catch(() => {
        if (!cancelled) setCollaboratorLabel("");
      });

    return () => {
      cancelled = true;
    };
  }, [form.collaboratorId]);

  const searchCollaborators = useCallback(
    (query: string, page: number) => collaboratorService.searchForAutocomplete(query, page),
    [],
  );

  const saveMutation = useMutation({
    mutationFn: async (dto: LeaveRequestCreateDto) => {
      if (isEditing && editingId) return leaverequestService.update(editingId, dto);
      return leaverequestService.create(dto);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: leaverequestKeys.all });
      if (editingId) await queryClient.invalidateQueries({ queryKey: leaverequestKeys.detail(editingId) });
      toast.success(isEditing ? "Afastamento atualizado" : "Afastamento cadastrado");
      setForm(emptyLeaveRequestForm());
      setCollaboratorLabel("");
      goToList();
    },
    onError: (err: unknown) => {
      const ex = ExceptionCapture.handle(err, { fallbackMessage: LEAVE_CLIENT_MESSAGES.LEAVE_SAVE_FAILED });
      setError(ex.displayMessage);
    },
  });

  const update = <K extends LeaveFormField>(field: K, value: LeaveRequestCreateDto[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const parsed = leaveRequestFormSchema.safeParse(form);
    if (!parsed.success) {
      setFieldErrors(mapZodFieldErrors<LeaveFormField>(parsed.error));
      setError("Verifique os campos destacados.");
      return;
    }

    setFieldErrors({});
    saveMutation.mutate(parsed.data);
  };

  if (isEditing && detailQuery.isLoading) {
    return (
      <div className="gommo-crud-panel-inset grid gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="skeleton-shimmer h-10 w-full" />
        ))}
      </div>
    );
  }

  if (isEditing && detailQuery.isError) {
    return (
      <div className="gommo-crud-panel-inset">
        <p className="text-sm font-medium text-error">
          {ExceptionCapture.displayMessage(detailQuery.error, LEAVE_CLIENT_MESSAGES.LEAVE_LOAD_FAILED)}
        </p>
        <Button variant="ghost" size="sm" className="mt-3" onClick={goToList}>
          Voltar
        </Button>
      </div>
    );
  }

  return (
    <CrudFormShell
      onSubmit={handleSubmit}
      footer={
        <>
          <Button type="button" variant="ghost" onClick={goToList}>
            Cancelar
          </Button>
          {isEditing && (
            <Button type="button" variant="outline" onClick={startCreate}>
              Novo
            </Button>
          )}
          <Button type="submit" loading={saveMutation.isPending}>
            {isEditing ? "Salvar" : "Cadastrar"}
          </Button>
        </>
      }
    >
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <p className="text-sm font-semibold text-base-content">
          {isEditing ? "Editar afastamento" : "Novo afastamento"}
        </p>
      </div>

      <div className="sm:col-span-2">
        <InputAutocomplete
          label="Colaborador"
          hint="Somente colaboradores com admissão concluída"
          value={form.collaboratorId ?? ""}
          selectedLabel={collaboratorLabel}
          onValueChange={(v, item) => {
            update("collaboratorId", v);
            setCollaboratorLabel(item?.label ?? "");
          }}
          onSearch={searchCollaborators}
          placeholder="Digite nome ou CPF…"
          required
          error={fieldErrors.collaboratorId}
        />
      </div>

      <InputSelect
        label="Tipo de afastamento"
        items={LEAVE_TYPE_ITEMS}
        value={form.leaveType ?? ""}
        onValueChange={(v) => update("leaveType", (v || undefined) as LeaveRequestCreateDto["leaveType"])}
        placeholder="Selecione"
        required
        error={fieldErrors.leaveType}
      />

      <InputSelect
        label="Situação"
        items={APPROVAL_ITEMS}
        value={form.approved === true ? "true" : form.approved === false ? "false" : ""}
        onValueChange={(v) => update("approved", v === "true")}
        placeholder="Selecione"
        clearable
      />

      <InputDate
        label="Data de início"
        value={form.startDate ?? ""}
        onValueChange={(v) => update("startDate", v)}
        required
        error={fieldErrors.startDate}
      />

      <InputDate
        label="Data de fim"
        value={form.endDate ?? ""}
        onValueChange={(v) => update("endDate", v)}
        required
        error={fieldErrors.endDate}
      />

      {error && <p className="text-sm font-medium text-error sm:col-span-2">{error}</p>}
    </div>
    </CrudFormShell>
  );
}
