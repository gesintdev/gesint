import type {DomainFieldConfig} from "@/modules/cfg/settings/developmentplan/services/development-plan-domain.service";
import {ENTITY_CODE_TABLE_COLUMN} from "@/shared/config/entity-code.table-column";
import {type TableColumnConfig, TableDataType} from "@/shared/types/table.types";

export type DevelopmentPlanDomainConfig = {
    id: string;
    title: string;
    endpoint: string;
    emptyMessage: string;
    fields: DomainFieldConfig[];
    columns: TableColumnConfig[];
    fieldTabName: string;
};

const statusColumn: TableColumnConfig = {
    id: "status",
    columnName: "Status",
    fieldValue: "status",
    dataType: TableDataType.BADGE
};
const baseColumns = (extra: TableColumnConfig[]): TableColumnConfig[] => [ENTITY_CODE_TABLE_COLUMN, ...extra, statusColumn];

export const COMPETENCY_TYPE_ITEMS = [
    {value: "TECHNICAL", label: "Técnica"},
    {value: "BEHAVIORAL", label: "Comportamental"},
    {value: "LEADERSHIP", label: "Liderança"},
];
export const ACTION_TYPE_ITEMS = [
    {value: "COURSE", label: "Curso"},
    {value: "MENTORING", label: "Mentoria"},
    {value: "READING", label: "Leitura"},
    {value: "INTERNAL_TRAINING", label: "Treinamento interno"},
    {value: "JOB_ROTATION", label: "Job rotation"},
    {value: "PRACTICAL_PROJECT", label: "Projeto prático"},
    {value: "MANAGER_FOLLOWUP", label: "Acompanhamento do gestor"},
    {value: "STRUCTURED_FEEDBACK", label: "Feedback estruturado"},
    {value: "CERTIFICATION", label: "Certificação"},
];

export const DEVELOPMENT_PLAN_DOMAIN_CONFIGS: Record<string, DevelopmentPlanDomainConfig> = {
    competencies: {
        id: "competencies",
        title: "Competências",
        endpoint: "/api/v1/development/competencies",
        emptyMessage: "Nenhuma competência cadastrada.",
        fieldTabName: "name",
        fields: [
            {name: "name", label: "Nome", type: "text", required: true},
            {name: "description", label: "Descrição", type: "text"},
            {name: "type", label: "Tipo", type: "select", required: true, options: COMPETENCY_TYPE_ITEMS},
        ],
        columns: baseColumns([
            {id: "name", columnName: "Nome", fieldValue: "name", dataType: TableDataType.TEXT},
            {id: "type", columnName: "Tipo", fieldValue: "type", dataType: TableDataType.TEXT},
        ]),
    },
    proficiencyLevels: {
        id: "proficiencyLevels",
        title: "Níveis de proficiência",
        endpoint: "/api/v1/development/proficiency-levels",
        emptyMessage: "Nenhum nível cadastrado.",
        fieldTabName: "name",
        fields: [
            {name: "name", label: "Nome", type: "text", required: true},
            {name: "description", label: "Descrição", type: "text"},
            {name: "levelOrder", label: "Ordem", type: "number", required: true},
            {name: "weight", label: "Peso", type: "number", required: true},
        ],
        columns: baseColumns([
            {id: "name", columnName: "Nome", fieldValue: "name", dataType: TableDataType.TEXT},
            {id: "levelOrder", columnName: "Ordem", fieldValue: "levelOrder", dataType: TableDataType.FLOAT},
            {id: "weight", columnName: "Peso", fieldValue: "weight", dataType: TableDataType.FLOAT},
        ]),
    },
    tracks: {
        id: "tracks",
        title: "Trilhas de desenvolvimento",
        endpoint: "/api/v1/development/tracks",
        emptyMessage: "Nenhuma trilha cadastrada.",
        fieldTabName: "name",
        fields: [
            {name: "name", label: "Nome", type: "text", required: true},
            {name: "description", label: "Descrição", type: "text"},
        ],
        columns: baseColumns([{id: "name", columnName: "Nome", fieldValue: "name", dataType: TableDataType.TEXT}]),
    },
    actionTemplates: {
        id: "actionTemplates",
        title: "Modelos de ação de desenvolvimento",
        endpoint: "/api/v1/development/action-templates",
        emptyMessage: "Nenhum modelo de ação cadastrado.",
        fieldTabName: "title",
        fields: [
            {name: "competencyId", label: "ID competência", type: "text", required: true},
            {name: "competencyName", label: "Competência", type: "text"},
            {name: "minGap", label: "Gap mínimo", type: "number", required: true},
            {name: "title", label: "Título", type: "text", required: true},
            {name: "suggestedDescription", label: "Descrição sugerida", type: "text"},
            {name: "actionType", label: "Tipo de ação", type: "select", required: true, options: ACTION_TYPE_ITEMS},
            {name: "suggestedDeadlineDays", label: "Prazo sugerido em dias", type: "number"},
            {name: "evidenceRequired", label: "Evidência obrigatória", type: "checkbox"},
        ],
        columns: baseColumns([
            {id: "title", columnName: "Título", fieldValue: "title", dataType: TableDataType.TEXT},
            {
                id: "competencyName",
                columnName: "Competência",
                fieldValue: "competencyName",
                dataType: TableDataType.TEXT
            },
            {id: "minGap", columnName: "Gap", fieldValue: "minGap", dataType: TableDataType.FLOAT},
        ]),
    },
    evidenceTypes: {
        id: "evidenceTypes",
        title: "Tipos de evidência",
        endpoint: "/api/v1/development/evidence-types",
        emptyMessage: "Nenhum tipo de evidência cadastrado.",
        fieldTabName: "name",
        fields: [
            {name: "name", label: "Nome", type: "text", required: true},
            {name: "description", label: "Descrição", type: "text"},
            {name: "requiresFile", label: "Exige arquivo", type: "checkbox"},
            {name: "allowsLink", label: "Permite link", type: "checkbox"},
        ],
        columns: baseColumns([{id: "name", columnName: "Nome", fieldValue: "name", dataType: TableDataType.TEXT}]),
    },
    origins: {
        id: "origins",
        title: "Origens de PDI",
        endpoint: "/api/v1/development/plan-origins",
        emptyMessage: "Nenhuma origem cadastrada.",
        fieldTabName: "name",
        fields: [
            {name: "name", label: "Nome", type: "text", required: true},
            {name: "description", label: "Descrição", type: "text"},
        ],
        columns: baseColumns([{id: "name", columnName: "Nome", fieldValue: "name", dataType: TableDataType.TEXT}]),
    },
};
