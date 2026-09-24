import type {StatusEnum} from "@/shared/types/status.types";

/** Classes de dado da RN-02 aplicadas ao tipo de documento (SEG-01 · D5). */
export type DocumentDataClass = "COMUM" | "PESSOAL" | "SENSIVEL" | "FINANCEIRO";

export type DocumentTypeContext =
    | "ADMISSION_DOCUMENT"
    | "ADMISSION_CONTRACT"
    | "ADMISSION_CONTRACT_PJ"
    | "OCCUPATIONAL_EXAM"
    | "EXIT_INTERVIEW"
    | "LEAVE"
    | "ATTENDANCE"
    | "CANDIDATE"
    | "GENERAL";

export type DocumentType = {
    id: string;
    code?: number;
    status?: StatusEnum;
    typeCode: string;
    name: string;
    description?: string | null;
    dataClass: DocumentDataClass;
    contexts: string[];
    systemManaged?: boolean;
    sortOrder?: number;
    createdAt?: string;
    updatedAt?: string;
};

export type DocumentTypeRequestDto = {
    typeCode: string;
    name: string;
    description?: string;
    dataClass: DocumentDataClass;
    contexts: string[];
    sortOrder?: number;
};
