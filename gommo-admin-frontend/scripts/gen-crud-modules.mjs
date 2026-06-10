/**
 * Generates CRUD frontend modules following the collaborator pattern.
 * Run: node scripts/gen-crud-modules.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..", "src");
const MODULES = [
    {
        key: "company",
        pascal: "Company",
        plural: "companies",
        apiPath: "/api/v1/companies",
        pagePath: "company",
        label: "Empresa",
        labelPlural: "Empresas",
        dtoFields: [
            { name: "legalName", type: "string", required: true },
            { name: "tradeName", type: "string" },
            { name: "cnpj", type: "string", required: true, input: "cnpj" },
            { name: "email", type: "string" },
            { name: "phone", type: "string" },
            { name: "city", type: "string" },
        ],
        tableCols: [
            { id: "legalName", name: "Razão social", field: "legalName" },
            { id: "cnpj", name: "CNPJ", field: "cnpj", type: "TEXT" },
            { id: "city", name: "Cidade", field: "city" },
            { id: "status", name: "Status", field: "status", type: "BADGE" },
        ],
    },
    {
        key: "department",
        pascal: "Department",
        plural: "departments",
        apiPath: "/api/v1/departments",
        pagePath: "organization/departments",
        label: "Departamento",
        labelPlural: "Departamentos",
        dtoFields: [
            { name: "name", type: "string", required: true },
            { name: "costCenter", type: "string" },
        ],
        tableCols: [
            { id: "name", name: "Nome", field: "name" },
            { id: "costCenter", name: "Centro de custo", field: "costCenter" },
            { id: "status", name: "Status", field: "status", type: "BADGE" },
        ],
    },
    {
        key: "jobposition",
        pascal: "JobPosition",
        plural: "job-positions",
        apiPath: "/api/v1/job-positions",
        pagePath: "organization/job-positions",
        label: "Cargo",
        labelPlural: "Cargos",
        dtoFields: [
            { name: "title", type: "string", required: true },
            { name: "cboCode", type: "string" },
            { name: "departmentId", type: "string" },
        ],
        tableCols: [
            { id: "title", name: "Título", field: "title" },
            { id: "cboCode", name: "CBO", field: "cboCode" },
            { id: "departmentId", name: "Dept. ID", field: "departmentId", type: "UUID" },
            { id: "status", name: "Status", field: "status", type: "BADGE" },
        ],
    },
    {
        key: "contract",
        pascal: "EmploymentContract",
        filePrefix: "employment-contract",
        plural: "contracts",
        apiPath: "/api/v1/contracts",
        pagePath: "contract",
        label: "Contrato",
        labelPlural: "Contratos",
        dtoFields: [
            { name: "collaboratorId", type: "string", required: true },
            {
                name: "contractType",
                type: '"CLT" | "PJ" | "INTERMITTENT" | "APPRENTICE" | "INTERN"',
                optional: true,
                select: [
                    ["CLT", "CLT"],
                    ["PJ", "PJ"],
                    ["INTERMITTENT", "Intermitente"],
                    ["APPRENTICE", "Aprendiz"],
                    ["INTERN", "Estágio"],
                ],
            },
            { name: "startDate", type: "string", required: true, input: "date" },
            { name: "baseSalary", type: "string", input: "currency" },
        ],
        tableCols: [
            { id: "collaboratorId", name: "Colaborador", field: "collaboratorId", type: "UUID" },
            { id: "contractType", name: "Tipo", field: "contractType" },
            { id: "startDate", name: "Início", field: "startDate", type: "DATE" },
            { id: "status", name: "Status", field: "status", type: "BADGE" },
        ],
    },
    {
        key: "attendance",
        pascal: "AttendanceRecord",
        filePrefix: "attendance-record",
        plural: "attendance-records",
        apiPath: "/api/v1/attendance-records",
        pagePath: "attendance",
        label: "Registro de ponto",
        labelPlural: "Registros de ponto",
        dtoFields: [
            { name: "collaboratorId", type: "string", required: true },
            { name: "workDate", type: "string", required: true, input: "date" },
            { name: "clockIn", type: "string", input: "time" },
            { name: "clockOut", type: "string", input: "time" },
        ],
        tableCols: [
            { id: "collaboratorId", name: "Colaborador", field: "collaboratorId", type: "UUID" },
            { id: "workDate", name: "Data", field: "workDate", type: "DATE" },
            { id: "clockIn", name: "Entrada", field: "clockIn" },
            { id: "clockOut", name: "Saída", field: "clockOut" },
        ],
    },
    {
        key: "leave",
        pascal: "LeaveRequest",
        filePrefix: "leave-request",
        plural: "leave-requests",
        apiPath: "/api/v1/leave-requests",
        pagePath: "leave",
        label: "Afastamento",
        labelPlural: "Afastamentos",
        dtoFields: [
            { name: "collaboratorId", type: "string", required: true },
            {
                name: "leaveType",
                type: '"VACATION" | "MEDICAL" | "MATERNITY" | "PATERNITY" | "UNPAID" | "OTHER"',
                optional: true,
                select: [
                    ["VACATION", "Férias"],
                    ["MEDICAL", "Médico"],
                    ["MATERNITY", "Maternidade"],
                    ["PATERNITY", "Paternidade"],
                    ["UNPAID", "Não remunerado"],
                    ["OTHER", "Outro"],
                ],
            },
            { name: "startDate", type: "string", required: true, input: "date" },
            { name: "endDate", type: "string", required: true, input: "date" },
            {
                name: "approved",
                type: "boolean",
                optional: true,
                select: [
                    ["true", "Aprovado"],
                    ["false", "Pendente"],
                ],
            },
        ],
        tableCols: [
            { id: "collaboratorId", name: "Colaborador", field: "collaboratorId", type: "UUID" },
            { id: "leaveType", name: "Tipo", field: "leaveType" },
            { id: "startDate", name: "Início", field: "startDate", type: "DATE" },
            { id: "approved", name: "Aprovado", field: "approved", type: "BOOLEAN" },
        ],
    },
    {
        key: "payroll",
        pascal: "PayrollRun",
        filePrefix: "payroll-run",
        plural: "payroll-runs",
        apiPath: "/api/v1/payroll-runs",
        pagePath: "payroll",
        label: "Folha",
        labelPlural: "Processamentos de folha",
        dtoFields: [
            { name: "referenceYear", type: "number", required: true, input: "number" },
            { name: "referenceMonth", type: "number", required: true, input: "number" },
            {
                name: "payrollStatus",
                type: '"DRAFT" | "PROCESSING" | "CLOSED" | "CANCELLED"',
                optional: true,
                select: [
                    ["DRAFT", "Rascunho"],
                    ["PROCESSING", "Processando"],
                    ["CLOSED", "Fechado"],
                    ["CANCELLED", "Cancelado"],
                ],
            },
        ],
        tableCols: [
            { id: "referenceYear", name: "Ano", field: "referenceYear" },
            { id: "referenceMonth", name: "Mês", field: "referenceMonth" },
            { id: "payrollStatus", name: "Status folha", field: "payrollStatus" },
            { id: "status", name: "Status", field: "status", type: "BADGE" },
        ],
    },
    {
        key: "payslip",
        pascal: "Payslip",
        plural: "payslips",
        apiPath: "/api/v1/payslips",
        pagePath: "payroll/payslips",
        label: "Holerite",
        labelPlural: "Holerites",
        dtoFields: [
            { name: "payrollRunId", type: "string", required: true },
            { name: "collaboratorId", type: "string", required: true },
            { name: "grossAmount", type: "string", input: "currency" },
            { name: "netAmount", type: "string", input: "currency" },
        ],
        tableCols: [
            { id: "payrollRunId", name: "Folha ID", field: "payrollRunId", type: "UUID" },
            { id: "collaboratorId", name: "Colaborador", field: "collaboratorId", type: "UUID" },
            { id: "grossAmount", name: "Bruto", field: "grossAmount", type: "CURRENCY" },
            { id: "netAmount", name: "Líquido", field: "netAmount", type: "CURRENCY" },
        ],
    },
    {
        key: "benefit",
        pascal: "BenefitPlan",
        filePrefix: "benefit-plan",
        plural: "benefit-plans",
        apiPath: "/api/v1/benefit-plans",
        pagePath: "benefit",
        label: "Benefício",
        labelPlural: "Benefícios",
        dtoFields: [
            { name: "name", type: "string", required: true },
            { name: "benefitType", type: "string", required: true },
            { name: "monthlyValue", type: "string", input: "currency" },
        ],
        tableCols: [
            { id: "name", name: "Nome", field: "name" },
            { id: "benefitType", name: "Tipo", field: "benefitType" },
            { id: "monthlyValue", name: "Valor mensal", field: "monthlyValue", type: "CURRENCY" },
            { id: "status", name: "Status", field: "status", type: "BADGE" },
        ],
    },
    {
        key: "admission",
        pascal: "AdmissionProcess",
        filePrefix: "admission-process",
        plural: "admissions",
        apiPath: "/api/v1/admissions",
        pagePath: "collaborator/admission",
        label: "Admissão",
        labelPlural: "Admissões",
        dtoFields: [
            { name: "collaboratorId", type: "string", required: true },
            {
                name: "admissionStatus",
                type: '"DRAFT" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED"',
                optional: true,
                select: [
                    ["DRAFT", "Rascunho"],
                    ["IN_PROGRESS", "Em andamento"],
                    ["COMPLETED", "Concluída"],
                    ["CANCELLED", "Cancelada"],
                ],
            },
            { name: "startedAt", type: "string", input: "date" },
        ],
        tableCols: [
            { id: "collaboratorId", name: "Colaborador", field: "collaboratorId", type: "UUID" },
            { id: "admissionStatus", name: "Status", field: "admissionStatus" },
            { id: "startedAt", name: "Início", field: "startedAt", type: "DATE" },
        ],
    },
    {
        key: "exitinterview",
        pascal: "ExitInterview",
        filePrefix: "exit-interview",
        plural: "exit-interviews",
        apiPath: "/api/v1/exit-interviews",
        pagePath: "exit-interview",
        label: "Entrevista de desligamento",
        labelPlural: "Entrevistas de desligamento",
        dtoFields: [
            { name: "collaboratorId", type: "string", required: true },
            { name: "interviewDate", type: "string", required: true, input: "date" },
            { name: "departureReason", type: "string" },
            { name: "feedback", type: "string", input: "textarea" },
        ],
        tableCols: [
            { id: "collaboratorId", name: "Colaborador", field: "collaboratorId", type: "UUID" },
            { id: "interviewDate", name: "Data", field: "interviewDate", type: "DATE" },
            { id: "departureReason", name: "Motivo", field: "departureReason" },
        ],
    },
];
function kebab(s) {
    return s.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
}

function upperSnake(key) {
    return key.replace(/-/g, "_").toUpperCase();
}

function writeFile(rel, content) {
    const full = path.join(ROOT, rel);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, content, "utf8");
    console.log("wrote", rel);
}

for (const m of MODULES) {
    const prefix = m.filePrefix ?? m.key;
    const Pascal = m.pascal;
    const KEY = upperSnake(m.key);
    const modPath = `modules/${m.key}`;
    const entityFields = m.dtoFields
        .map((f) => {
            const t = f.type.includes("|") ? f.type : f.type;
            return `    ${f.name}${f.optional || f.type.includes("|") ? "?" : ""}!: ${t};`;
        })
        .join("\n");
    const createFields = m.dtoFields
        .map((f) => {
            const t = f.type.includes("|") ? f.type : f.type;
            const opt = !f.required || f.optional || f.type.includes("|");
            return `    ${f.name}${opt ? "?" : ""}!: ${t};`;
        })
        .join("\n");
    const emptyForm = m.dtoFields
        .map((f) => {
            if (f.type === "number") return `    ${f.name}: 0,`;
            if (f.type === "boolean") return `    ${f.name}: false,`;
            return `    ${f.name}: "",`;
        })
        .join("\n");
    const toForm = m.dtoFields
        .map((f) => {
            if (f.input === "date" || f.name.includes("Date") || f.name.endsWith("At"))
                return `        ${f.name}: entity.${f.name}?.slice(0, 10) ?? "",`;
            if (f.type === "number") return `        ${f.name}: entity.${f.name} ?? 0,`;
            if (f.type === "boolean") return `        ${f.name}: entity.${f.name} ?? false,`;
            return `        ${f.name}: entity.${f.name} ?? "",`;
        })
        .join("\n");
    const tableType = (t) => (t ? `TableDataType.${t}` : "TableDataType.TEXT");
    const tableCols = m.tableCols
        .map(
            (c) => `    {
        id: "${c.id}",
        columnName: "${c.name}",
        fieldValue: "${c.field}",
        dataType: ${tableType(c.type)},
    },`,
        )
        .join("\n");
    const formInputs = m.dtoFields
        .map((f) => {
            const label = f.name
                .replace(/Id$/, " ID")
                .replace(/([A-Z])/g, " $1")
                .replace(/^./, (s) => s.toUpperCase())
                .trim();
            if (f.select) {
                const items = f.select.map(([v, l]) => `  { value: "${v}", label: "${l}" },`).join("\n");
                const cast =
                    f.type === "boolean"
                        ? `update("${f.name}", v === "true")`
                        : `update("${f.name}", (v || undefined) as ${Pascal}CreateDto["${f.name}"])`;
                const val =
                    f.type === "boolean"
                        ? `form.${f.name} === true ? "true" : form.${f.name} === false ? "false" : ""`
                        : `form.${f.name} ?? ""`;
                return `      <InputSelect
        label="${label}"
        items={[${items}]}
        value={${val}}
        onValueChange={(v) => ${cast}}
        placeholder="Selecione"
        clearable
      />`;
            }
            if (f.input === "cnpj")
                return `      <InputCNPJ label="${label}" value={form.${f.name}} onValueChange={(v) => update("${f.name}", v)} ${f.required ? "required" : ""} />`;
            if (f.input === "date")
                return `      <InputDate label="${label}" value={form.${f.name} ?? ""} onValueChange={(v) => update("${f.name}", v)} ${f.required ? "required" : ""} />`;
            if (f.input === "currency")
                return `      <InputCurrency label="${label}" value={form.${f.name} ?? ""} onValueChange={(v) => update("${f.name}", v)} />`;
            if (f.input === "time")
                return `      <InputString label="${label}" value={form.${f.name} ?? ""} onValueChange={(v) => update("${f.name}", v)} hint="HH:mm" />`;
            if (f.input === "number")
                return `      <InputNumber label="${label}" integer align="left" value={form.${f.name}} onValueChange={(v) => update("${f.name}", v ?? 0)} ${f.required ? "required" : ""} />`;
            if (f.input === "textarea")
                return `      <InputString label="${label}" value={form.${f.name} ?? ""} onValueChange={(v) => update("${f.name}", v)} wrapperClassName="sm:col-span-2" />`;
            return `      <InputString label="${label}" value={form.${f.name} ?? ""} onValueChange={(v) => update("${f.name}", v)} ${f.required ? "required" : ""} />`;
        })
        .join("\n");
    const displayField = m.tableCols[0]?.field ?? "id";
    const displayLabel = m.tableCols[0]?.name ?? "registro";
    writeFile(
        `${modPath}/dto/${prefix}.dto.ts`,
        `export class ${Pascal} {
    id!: string;
    status!: "ACTIVE" | "INACTIVE" | "DELETED";
${entityFields}
    createdAt?: string;
    updatedAt?: string;
}

export class ${Pascal}CreateDto {
${createFields}
}
`,
    );
    writeFile(
        `${modPath}/services/${prefix}.service.ts`,
        `import type { ${Pascal}, ${Pascal}CreateDto } from "@/modules/${m.key}/dto/${prefix}.dto";
import { BaseService } from "@/modules/root/services/base.service";

class ${Pascal}Service extends BaseService<${Pascal}, ${Pascal}CreateDto, ${Pascal}CreateDto> {
    constructor() {
        super("${m.apiPath}");
    }
}

export const ${prefix.replace(/-/g, "")}Service = new ${Pascal}Service();
`,
    );
    writeFile(
        `${modPath}/${m.key}.query.ts`,
        `export const ${prefix.replace(/-/g, "")}Keys = {
    all: ["${m.plural}"] as const,
    detail: (id: string) => ["${m.plural}", id] as const,
};
`,
    );
    writeFile(
        `${modPath}/lib/${prefix}.mapper.ts`,
        `import type { ${Pascal}, ${Pascal}CreateDto } from "@/modules/${m.key}/dto/${prefix}.dto";

export function ${prefix.replace(/-/g, "")}ToFormDto(entity: ${Pascal}): ${Pascal}CreateDto {
    return {
${toForm}
    };
}

export const empty${Pascal}Form = (): ${Pascal}CreateDto => ({
${emptyForm}
});
`,
    );
    writeFile(
        `${modPath}/config/${prefix}.table-columns.ts`,
        `import { TableDataType, type TableColumnConfig } from "@/shared/types/table.types";

export const ${KEY}_TABLE_COLUMNS: TableColumnConfig[] = [
${tableCols}
];
`,
    );
    writeFile(
        `${modPath}/exceptions/${prefix}.messages.ts`,
        `export const ${KEY}_MESSAGES = {
  ${KEY}_NOT_FOUND: "${m.label} não encontrado(a)",
} as const;

export const ${KEY}_CLIENT_MESSAGES = {
  ${KEY}_LOAD_FAILED: "Não foi possível carregar ${m.label.toLowerCase()}",
  ${KEY}_SAVE_FAILED: "Não foi possível salvar ${m.label.toLowerCase()}",
} as const;
`,
    );
    const svcVar = `${prefix.replace(/-/g, "")}Service`;
    const keysVar = `${prefix.replace(/-/g, "")}Keys`;
    writeFile(
        `${modPath}/components/${Pascal}ListClient.tsx`,
        `"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ${KEY}_CLIENT_MESSAGES } from "@/modules/${m.key}/exceptions/${prefix}.messages";
import { ${KEY}_TABLE_COLUMNS } from "@/modules/${m.key}/config/${prefix}.table-columns";
import type { ${Pascal} } from "@/modules/${m.key}/dto/${prefix}.dto";
import { ${keysVar} } from "@/modules/${m.key}/${m.key}.query";
import { ${svcVar} } from "@/modules/${m.key}/services/${prefix}.service";
import { useCrudScreen } from "@/shared/components/crud/CrudScreen";
import { QueryTablePanel } from "@/shared/components/data/DataPanel";
import { Button } from "@/shared/components/ui/Button";
import { ExceptionCapture } from "@/shared/exceptions";
import { SystemAlert } from "@/shared/system-alert";

export function ${Pascal}ListClient() {
    const { startEdit } = useCrudScreen();
    const queryClient = useQueryClient();
    const deleteMutation = useMutation({
        mutationFn: (id: string) => ${svcVar}.remove(id),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ${keysVar}.all });
            toast.success("${m.label} excluído(a)");
        },
        onError: (err: unknown) =>
            ExceptionCapture.handle(err, { fallbackMessage: ${KEY}_CLIENT_MESSAGES.${KEY}_LOAD_FAILED }),
    });
    const handleDelete = async (row: ${Pascal}) => {
        if (!(await SystemAlert.confirmDelete())) return;
        deleteMutation.mutate(row.id);
    };
    const rowLabel = (row: ${Pascal}) => String((row as Record<string, unknown>)["${displayField}"] ?? row.id);
    return (
        <QueryTablePanel<${Pascal}>
            queryKey={${keysVar}.all}
            request={() => ${svcVar}.getAll()}
            columns={${KEY}_TABLE_COLUMNS}
            rowKey="id"
            emptyMessage="Nenhum(a) ${m.label.toLowerCase()} cadastrado(a)."
            onRowActivate={(row) => startEdit(row.id)}
            renderActions={(row) => (
                <>
                    <Button variant="ghost" size="sm" aria-label="Editar" leftIcon={<Pencil className="size-3.5" />} onClick={() => startEdit(row.id)} />
                    <Button variant="ghost" size="sm" aria-label="Excluir" className="text-error hover:bg-error/10" leftIcon={<Trash2 className="size-3.5" />} loading={deleteMutation.isPending && deleteMutation.variables === row.id} onClick={() => handleDelete(row)} />
                </>
            )}
        />
    );
}
`,
    );
    const imports = [
        "InputString",
        ...(m.dtoFields.some((f) => f.input === "date") ? ["InputDate"] : []),
        ...(m.dtoFields.some((f) => f.input === "cnpj") ? ["InputCNPJ"] : []),
        ...(m.dtoFields.some((f) => f.input === "currency") ? ["InputCurrency"] : []),
        ...(m.dtoFields.some((f) => f.select) ? ["InputSelect"] : []),
        ...(m.dtoFields.some((f) => f.input === "number") ? ["InputNumber"] : []),
    ].join(", ");
    writeFile(
        `${modPath}/components/${Pascal}FormClient.tsx`,
        `"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { ${KEY}_CLIENT_MESSAGES } from "@/modules/${m.key}/exceptions/${prefix}.messages";
import type { ${Pascal}CreateDto } from "@/modules/${m.key}/dto/${prefix}.dto";
import { empty${Pascal}Form, ${prefix.replace(/-/g, "")}ToFormDto } from "@/modules/${m.key}/lib/${prefix}.mapper";
import { ${keysVar} } from "@/modules/${m.key}/${m.key}.query";
import { ${svcVar} } from "@/modules/${m.key}/services/${prefix}.service";
import { useCrudScreen } from "@/shared/components/crud/CrudScreen";
import { ExceptionCapture } from "@/shared/exceptions";
import { Button } from "@/shared/components/ui/Button";
import { ${imports} } from "@/shared/components/ui/input/index";

export function ${Pascal}FormClient() {
  const { editingId, isEditing, goToList, startCreate } = useCrudScreen();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<${Pascal}CreateDto>(empty${Pascal}Form);
  const [error, setError] = useState<string | null>(null);
  const detailQuery = useQuery({
    queryKey: ${keysVar}.detail(editingId ?? ""),
    queryFn: () => ${svcVar}.getById(editingId!),
    enabled: isEditing && Boolean(editingId),
  });
  useEffect(() => {
    if (!isEditing) {
      setForm(empty${Pascal}Form());
      setError(null);
      return;
    }
    if (detailQuery.data) {
      setForm(${prefix.replace(/-/g, "")}ToFormDto(detailQuery.data));
      setError(null);
    }
  }, [isEditing, detailQuery.data]);
  const saveMutation = useMutation({
    mutationFn: async (dto: ${Pascal}CreateDto) => {
      if (isEditing && editingId) return ${svcVar}.update(editingId, dto);
      return ${svcVar}.create(dto);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ${keysVar}.all });
      if (editingId) await queryClient.invalidateQueries({ queryKey: ${keysVar}.detail(editingId) });
      toast.success(isEditing ? "${m.label} atualizado(a)" : "${m.label} cadastrado(a)");
      setForm(empty${Pascal}Form());
      goToList();
    },
    onError: (err: unknown) => {
      const ex = ExceptionCapture.handle(err, { fallbackMessage: ${KEY}_CLIENT_MESSAGES.${KEY}_SAVE_FAILED });
      setError(ex.displayMessage);
    },
  });
  const update = <K extends keyof ${Pascal}CreateDto>(field: K, value: ${Pascal}CreateDto[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };
  const handleSubmit = (e: FormEvent) => {
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
        <p className="text-sm font-medium text-error">{ExceptionCapture.displayMessage(detailQuery.error, ${KEY}_CLIENT_MESSAGES.${KEY}_LOAD_FAILED)}</p>
        <Button variant="ghost" size="sm" className="mt-3" onClick={goToList}>Voltar</Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3 p-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <p className="text-sm font-semibold text-base-content">{isEditing ? "Editar ${m.label.toLowerCase()}" : "Novo(a) ${m.label.toLowerCase()}"}</p>
      </div>
${formInputs}
      {error && <p className="text-sm font-medium text-error sm:col-span-2">{error}</p>}
      <div className="flex flex-wrap gap-2 sm:col-span-2">
        <Button type="submit" loading={saveMutation.isPending}>{isEditing ? "Salvar" : "Cadastrar"}</Button>
        <Button type="button" variant="ghost" onClick={goToList}>Cancelar</Button>
        {isEditing && <Button type="button" variant="outline" onClick={startCreate}>Novo</Button>}
      </div>
    </form>
  );
}
`,
    );
    writeFile(
        `app/(system)/${m.pagePath}/page.tsx`,
        `import {PascalFormClient} from "@/modules/EXTERNAL_FRAGMENT/components/PascalFormClient";
import {PascalListClient} from "@/modules/EXTERNAL_FRAGMENT/components/PascalListClient";
import {CrudScreen} from "@/shared/components/crud/CrudScreen";
import {PageBreadcrumb} from "@/shared/components/layout/PageBreadcrumb";
import {PageTransition} from "@/shared/components/layout/PageTransition";
import {Card} from "@/shared/components/ui/Card";import { ${Pascal}FormClient } from "@/modules/${m.key}/components/${Pascal}FormClient";import { ${Pascal}ListClient } from "@/modules/${m.key}/components/${Pascal}ListClient";
import { CrudScreen } from "@/shared/components/crud/CrudScreen";
import { PageBreadcrumb } from "@/shared/components/layout/PageBreadcrumb";
import { PageTransition } from "@/shared/components/layout/PageTransition";
import { Card } from "@/shared/components/ui/Card";

export default function ${Pascal}Page() {
    return (
        <PageTransition>
            <PageBreadcrumb />
            <Card bodyClassName="!p-0">
                <CrudScreen list={<${Pascal}ListClient />} form={<${Pascal}FormClient />} />
            </Card>
        </PageTransition>
    );
}
`,
    );
}

console.log("Done.");
