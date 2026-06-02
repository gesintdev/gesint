"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, type SubmitEvent } from "react";
import { toast } from "sonner";
import { DEPARTMENT_CLIENT_MESSAGES } from "@/modules/department/exceptions/department.messages";
import type { DepartmentCreateDto } from "@/modules/department/dto/department.dto";
import { emptyDepartmentForm, departmentToFormDto } from "@/modules/department/lib/department.mapper";
import { departmentKeys } from "@/modules/department/department.query";
import { departmentService } from "@/modules/department/services/department.service";
import { useCrudScreen } from "@/shared/components/crud/CrudScreen";
import { CrudFormShell } from "@/shared/components/crud/CrudFormShell";
import { EntityCodeField } from "@/shared/components/crud/EntityCodeField";
import { ExceptionCapture } from "@/shared/exceptions";
import { Button } from "@/shared/components/ui/Button";
import { InputString } from "@/shared/components/ui/input/index";

export function DepartmentFormClient() {
  const { editingId, isEditing, goToList, startCreate } = useCrudScreen();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<DepartmentCreateDto>(emptyDepartmentForm);
  const [error, setError] = useState<string | null>(null);

  const detailQuery = useQuery({
    queryKey: departmentKeys.detail(editingId ?? ""),
    queryFn: () => departmentService.getById(editingId!),
    enabled: isEditing && Boolean(editingId),
  });

  useEffect(() => {
    if (!isEditing) {
      setForm(emptyDepartmentForm());
      setError(null);
      return;
    }
    if (detailQuery.data) {
      setForm(departmentToFormDto(detailQuery.data));
      setError(null);
    }
  }, [isEditing, detailQuery.data]);

  const saveMutation = useMutation({
    mutationFn: async (dto: DepartmentCreateDto) => {
      if (isEditing && editingId) return departmentService.update(editingId, dto);
      return departmentService.create(dto);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: departmentKeys.all });
      if (editingId) await queryClient.invalidateQueries({ queryKey: departmentKeys.detail(editingId) });
      toast.success(isEditing ? "Departamento atualizado(a)" : "Departamento cadastrado(a)");
      setForm(emptyDepartmentForm());
      goToList();
    },
    onError: (err: unknown) => {
      const ex = ExceptionCapture.handle(err, { fallbackMessage: DEPARTMENT_CLIENT_MESSAGES.DEPARTMENT_SAVE_FAILED });
      setError(ex.displayMessage);
    },
  });

  const update = <K extends keyof DepartmentCreateDto>(field: K, value: DepartmentCreateDto[K]) => {
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
        <p className="text-sm font-medium text-error">{ExceptionCapture.displayMessage(detailQuery.error, DEPARTMENT_CLIENT_MESSAGES.DEPARTMENT_LOAD_FAILED)}</p>
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
        <p className="text-sm font-semibold text-base-content">{isEditing ? "Editar departamento" : "Novo(a) departamento"}</p>
      </div>
                <EntityCodeField code={isEditing ? detailQuery.data?.code : undefined} />
      <InputString label="Name" value={form.name ?? ""} onValueChange={(v) => update("name", v)} required />
      <InputString label="Cost Center" value={form.costCenter ?? ""} onValueChange={(v) => update("costCenter", v)}  />
      {error && <p className="text-sm font-medium text-error sm:col-span-2">{error}</p>}
    </div>
    </CrudFormShell>
  );
}
