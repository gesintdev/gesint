"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { JOBPOSITION_CLIENT_MESSAGES } from "@/modules/organization/jobposition/exceptions/jobposition.messages";
import type { JobPositionCreateDto } from "@/modules/organization/jobposition/dto/jobposition.dto";
import { emptyJobPositionForm, jobpositionToFormDto } from "@/modules/organization/jobposition/lib/jobposition.mapper";
import { jobpositionKeys } from "@/modules/organization/jobposition/jobposition.query";
import { jobpositionService } from "@/modules/organization/jobposition/services/jobposition.service";
import { useCrudScreen } from "@/shared/components/crud/CrudScreen";
import { CrudFormShell } from "@/shared/components/crud/CrudFormShell";
import { ExceptionCapture } from "@/shared/exceptions";
import { Button } from "@/shared/components/ui/Button";
import { InputString } from "@/shared/components/ui/input/index";

export function JobPositionFormClient() {
  const { editingId, isEditing, goToList, startCreate } = useCrudScreen();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<JobPositionCreateDto>(emptyJobPositionForm);
  const [error, setError] = useState<string | null>(null);

  const detailQuery = useQuery({
    queryKey: jobpositionKeys.detail(editingId ?? ""),
    queryFn: () => jobpositionService.getById(editingId!),
    enabled: isEditing && Boolean(editingId),
  });

  useEffect(() => {
    if (!isEditing) {
      setForm(emptyJobPositionForm());
      setError(null);
      return;
    }
    if (detailQuery.data) {
      setForm(jobpositionToFormDto(detailQuery.data));
      setError(null);
    }
  }, [isEditing, detailQuery.data]);

  const saveMutation = useMutation({
    mutationFn: async (dto: JobPositionCreateDto) => {
      if (isEditing && editingId) return jobpositionService.update(editingId, dto);
      return jobpositionService.create(dto);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: jobpositionKeys.all });
      if (editingId) await queryClient.invalidateQueries({ queryKey: jobpositionKeys.detail(editingId) });
      toast.success(isEditing ? "Cargo atualizado(a)" : "Cargo cadastrado(a)");
      setForm(emptyJobPositionForm());
      goToList();
    },
    onError: (err: unknown) => {
      const ex = ExceptionCapture.handle(err, { fallbackMessage: JOBPOSITION_CLIENT_MESSAGES.JOBPOSITION_SAVE_FAILED });
      setError(ex.displayMessage);
    },
  });

  const update = <K extends keyof JobPositionCreateDto>(field: K, value: JobPositionCreateDto[K]) => {
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
        <p className="text-sm font-medium text-error">{ExceptionCapture.displayMessage(detailQuery.error, JOBPOSITION_CLIENT_MESSAGES.JOBPOSITION_LOAD_FAILED)}</p>
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
        <p className="text-sm font-semibold text-base-content">{isEditing ? "Editar cargo" : "Novo(a) cargo"}</p>
      </div>
      <InputString label="Título do cargo" value={form.title ?? ""} onValueChange={(v) => update("title", v)} required />
      <InputString label="Código CBO" value={form.cboCode ?? ""} onValueChange={(v) => update("cboCode", v)} />
      <InputString label="Departamento" value={form.departmentId ?? ""} onValueChange={(v) => update("departmentId", v)} hint="ID do departamento" />
      {error && <p className="text-sm font-medium text-error sm:col-span-2">{error}</p>}
    </div>
    </CrudFormShell>
  );
}
