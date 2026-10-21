import { digitsOnly } from "@/shared/lib/input/digits";
import { maskSinglePhone } from "@/shared/lib/input/phone";

export type CnpjLookupResult = {
    document: string;
    name: string;
    legalName: string;
    street: string;
    number: string;
    complement: string;
    district: string;
    city: string;
    stateCode: string;
    zipCode: string;
    contactEmail: string;
    phones: string[];
};

type BrasilApiCnpjResponse = {
    cnpj?: string;
    razao_social?: string;
    nome_fantasia?: string;
    email?: string;
    ddd_telefone_1?: string;
    ddd_telefone_2?: string;
    descricao_tipo_de_logradouro?: string;
    logradouro?: string;
    numero?: string;
    complemento?: string;
    bairro?: string;
    municipio?: string;
    uf?: string;
    cep?: string;
};

function formatPhone(raw?: string): string {
    return maskSinglePhone(raw ?? "");
}

export async function lookupCnpj(cnpj: string): Promise<CnpjLookupResult | null> {
    const digits = digitsOnly(cnpj);
    if (digits.length !== 14) return null;

    const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${digits}`, {
        method: "GET",
        cache: "no-store",
    });

    if (response.status === 404) return null;
    if (!response.ok) {
        throw new Error("Não foi possível consultar o CNPJ no momento.");
    }

    const data = (await response.json()) as BrasilApiCnpjResponse;
    const phones = [formatPhone(data.ddd_telefone_1), formatPhone(data.ddd_telefone_2 ?? undefined)].filter(
        Boolean,
    );
    const streetType = data.descricao_tipo_de_logradouro?.trim() ?? "";
    const streetName = data.logradouro?.trim() ?? "";
    const street = [streetType, streetName].filter(Boolean).join(" ").trim();

    return {
        document: digits,
        name: (data.nome_fantasia || data.razao_social || "").trim(),
        legalName: (data.razao_social || "").trim(),
        street,
        number: (data.numero || "").trim(),
        complement: (data.complemento || "").trim(),
        district: (data.bairro || "").trim(),
        city: (data.municipio || "").trim(),
        stateCode: (data.uf || "").trim().toUpperCase(),
        zipCode: digitsOnly(data.cep ?? ""),
        contactEmail: (data.email || "").trim(),
        phones,
    };
}
