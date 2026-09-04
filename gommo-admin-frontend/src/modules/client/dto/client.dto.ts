export type ClientContactType = "EMAIL" | "PHONE";

export class ClientContactDto {
    type!: ClientContactType;
    value!: string;
}

export class Client {
    id!: string;
    code!: number;
    status!: string;
    name!: string;
    legalName?: string;
    slug!: string;
    mobileLoginCode?: string;
    document?: string;
    street?: string;
    number?: string;
    complement?: string;
    district?: string;
    city?: string;
    stateCode?: string;
    zipCode?: string;
    contacts?: ClientContactDto[];
    notes?: string;
    createdAt?: string;
    updatedAt?: string;
}

/** Payload de create/update enviado à API. */
export class ClientCreateDto {
    name!: string;
    legalName?: string;
    slug!: string;
    document?: string;
    street?: string;
    number?: string;
    complement?: string;
    district?: string;
    city?: string;
    stateCode?: string;
    zipCode?: string;
    contacts?: ClientContactDto[];
    notes?: string;
}

/** Estado do formulário de Dados Básicos (email + telefones separados na UI). */
export class ClientFormDto {
    name!: string;
    legalName?: string;
    slug!: string;
    document?: string;
    street?: string;
    number?: string;
    complement?: string;
    district?: string;
    city?: string;
    stateCode?: string;
    zipCode?: string;
    contactEmail?: string;
    /** Telefones serializados com `; ` para o multi-valor. */
    phones?: string;
    notes?: string;
}
