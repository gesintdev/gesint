"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { EXITINTERVIEW_CLIENT_MESSAGES } from "@/modules/person/exitinterview/exceptions/exit-interview.messages";
import type { ExitInterviewCreateDto } from "@/modules/person/exitinterview/dto/exit-interview.dto";
import { emptyExitInterviewForm, exitinterviewToFormDto } from "@/modules/person/exitinterview/lib/exit-interview.mapper";
import { exitinterviewKeys } from "@/modules/person/exitinterview/exitinterview.query";
import { exitinterviewService } from "@/modules/person/exitinterview/services/exit-interview.service";
import { useCrudScreen } from "@/shared/components/crud/CrudScreen";
import { CrudFormShell } from "@/shared/components/crud/CrudFormShell";
import { ExceptionCapture } from "@/shared/exceptions";
import { Button } from "@/shared/components/ui/Button";
import { CollaboratorPickerField } from "@/shared/components/crud/CollaboratorPickerField";
import { InputString, InputDate } from "@/shared/components/ui/input/index";

export function ExitInterviewFormClient() {
  const { editingId, isEditing, goToList, startCreate } = useCrudScreen();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<ExitInterviewCreateDto>(emptyExitInterviewForm);
  const [error, setError] = useState<string | null>(null);

  const detailQuery = useQuery({
    queryKey: exitinterviewKeys.detail(editingId ?? ""),
    queryFn: () => exitinterviewService.getById(editingId!),
    enabled: isEditing && Boolean(editingId),
  });

  useEffect(() => {
    if (!isEditing) {
      setForm(emptyExitInterviewForm());
      setError(null);
      return;
    }
    if (detailQuery.data) {
      setForm(exitinterviewToFormDto(detailQuery.data));
      setError(null);
    }
  }, [isEditing, detailQuery.data]);

  const saveMutation = useMutation({
    mutationFn: async (dto: ExitInterviewCreateDto) => {
      if (isEditing && editingId) return exitinterviewService.update(editingId, dto);
      return exitinterviewService.create(dto);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: exitinterviewKeys.all });
      if (editingId) await queryClient.invalidateQueries({ queryKey: exitinterviewKeys.detail(editingId) });
      toast.success(isEditing ? "Entrevista de desligamento atualizado(a)" : "Entrevista de desligamento cadastrado(a)");
      setForm(emptyExitInterviewForm());
      goToList();
    },
    onError: (err: unknown) => {
      const ex = ExceptionCapture.handle(err, { fallbackMessage: EXITINTERVIEW_CLIENT_MESSAGES.EXITINTERVIEW_SAVE_FAILED });
      setError(ex.displayMessage);
    },
  });

  const update = <K extends keyof ExitInterviewCreateDto>(field: K, value: ExitInterviewCreateDto[K]) => {
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
        <p className="text-sm font-medium text-error">{ExceptionCapture.displayMessage(detailQuery.error, EXITINTERVIEW_CLIENT_MESSAGES.EXITINTERVIEW_LOAD_FAILED)}</p>
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
        <p className="text-sm font-semibold text-base-content">{isEditing ? "Editar entrevista de desligamento" : "Novo(a) entrevista de desligamento"}</p>
      </div>
      <div className="sm:col-span-2">
        <CollaboratorPickerField value={form.collaboratorId ?? ""} onValueChange={(v) => update("collaboratorId", v)} required />
      </div>
      <InputDate label="Data da entrevista" value={form.interviewDate ?? ""} onValueChange={(v) => update("interviewDate", v)} required />
      <InputString label="Motivo da saída" value={form.departureReason ?? ""} onValueChange={(v) => update("departureReason", v)} />
      <InputString label="Feedback" value={form.feedback ?? ""} onValueChange={(v) => update("feedback", v)} wrapperClassName="sm:col-span-2" />
      {error && <p className="text-sm font-medium text-error sm:col-span-2">{error}</p>}
    </div>
    </CrudFormShell>
  );
}
