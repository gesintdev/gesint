import { TableDataType } from "@/shared/types/table.types";

const digitsOnly = (value: string) => value.replace(/\D/g, "");

export function formatCpf(value: string): string {
  const d = digitsOnly(value).slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
}

export function formatCnpj(value: string): string {
  const d = digitsOnly(value).slice(0, 14);
  if (d.length <= 2) return d;
  if (d.length <= 5) return `${d.slice(0, 2)}.${d.slice(2)}`;
  if (d.length <= 8) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5)}`;
  if (d.length <= 12) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8)}`;
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`;
}

export function formatPhone(value: string): string {
  const d = digitsOnly(value);
  if (d.length <= 2) return d.length ? `(${d}` : "";
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7, 11)}`;
}

function parseDateInput(value: unknown): Date | null {
  if (value == null || value === "") return null;
  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatCellValue(value: unknown, dataType: TableDataType = TableDataType.TEXT): string {
  if (value == null || value === "") return "—";

  switch (dataType) {
    case TableDataType.UUID:
      return String(value).slice(0, 8).concat("…");

    case TableDataType.CPF:
      return formatCpf(String(value));

    case TableDataType.PHONE:
      return formatPhone(String(value));

    case TableDataType.EMAIL:
      return String(value);

    case TableDataType.DATE: {
      const date = parseDateInput(value);
      if (!date) return String(value);
      return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(date);
    }

    case TableDataType.DATETIME: {
      const date = parseDateInput(value);
      if (!date) return String(value);
      return new Intl.DateTimeFormat("pt-BR", {
        dateStyle: "short",
        timeStyle: "short",
      }).format(date);
    }

    case TableDataType.FLOAT: {
      const num = Number(value);
      if (Number.isNaN(num)) return String(value);
      return new Intl.NumberFormat("pt-BR", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 4,
      }).format(num);
    }

    case TableDataType.CURRENCY: {
      const num = Number(value);
      if (Number.isNaN(num)) return String(value);
      return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(num);
    }

    case TableDataType.PERCENT: {
      const num = Number(value);
      if (Number.isNaN(num)) return String(value);
      return new Intl.NumberFormat("pt-BR", {
        style: "percent",
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(num / 100);
    }

    case TableDataType.BOOLEAN:
      return value === true || value === "true" || value === 1 ? "Sim" : "Não";

    case TableDataType.BADGE:
      return formatBadgeLabel(value);

    case TableDataType.TEXT:
    default:
      return String(value);
  }
}

const BADGE_LABELS: Record<string, string> = {
  ACTIVE: "Ativo",
  INACTIVE: "Inativo",
  DELETED: "Excluído",
  DRAFT: "Rascunho",
  IN_PROGRESS: "Em andamento",
  COMPLETED: "Concluída",
  CANCELLED: "Cancelada",
  VACATION: "Férias",
  MEDICAL: "Afastamento médico",
  MATERNITY: "Maternidade",
  PATERNITY: "Paternidade",
  UNPAID: "Não remunerado",
  OTHER: "Outro",
};

function formatBadgeLabel(value: unknown, labels?: Record<string, string>): string {
  const key = String(value).toUpperCase();
  const map = labels ?? BADGE_LABELS;
  return map[key] ?? BADGE_LABELS[key] ?? String(value);
}

export function formatBadgeCellValue(value: unknown, labels?: Record<string, string>): string {
  if (value == null || value === "") return "—";
  return formatBadgeLabel(value, labels);
}

export function badgeClassForStatus(value: unknown, labels?: Record<string, string>): string {
  const normalized = String(value).toUpperCase();
  if (labels && labels !== BADGE_LABELS) {
    if (normalized === "COMPLETED") return "gommo-badge--success";
    if (normalized === "CANCELLED" || normalized === "DELETED") return "gommo-badge--error";
    if (normalized === "DRAFT" || normalized === "IN_PROGRESS") return "gommo-badge--info";
    return "gommo-badge--neutral";
  }
  if (normalized === "ACTIVE") return "gommo-badge--success";
  if (normalized === "INACTIVE") return "gommo-badge--warning";
  if (normalized === "DELETED") return "gommo-badge--error";
  if (normalized === "DRAFT" || normalized === "IN_PROGRESS") return "gommo-badge--info";
  if (normalized === "COMPLETED") return "gommo-badge--success";
  if (normalized === "CANCELLED") return "gommo-badge--error";
  return "gommo-badge--neutral";
}
