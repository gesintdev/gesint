import { digitsOnly } from "@/shared/lib/input/digits";

export type CnpjLookupResult = {
    document: string;
    name: string;
    legalName: string;
    address: string;
    contactEmail: string;
    contactPhone: string;
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
    const digits = digitsOnly(raw ?? "");
    if (!digits) return "";
    if (digits.length === 10) {
        return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    }
    if (digits.length === 11) {
        return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
    }
    return digits;
}

function formatAddress(data: BrasilApiCnpjResponse): string {
    const streetType = data.descricao_tipo_de_logradouro?.trim() ?? "";
    const street = data.logradouro?.trim() ?? "";
    const number = data.numero?.trim() ?? "";
    const complement = data.complemento?.trim() ?? "";
    const district = data.bairro?.trim() ?? "";
    const city = data.municipio?.trim() ?? "";
    const uf = data.uf?.trim() ?? "";
    const cep = digitsOnly(data.cep ?? "");
    const cepFmt = cep.length === 8 ? `${cep.slice(0, 5)}-${cep.slice(5)}` : cep;

    const line1 = [streetType, street].filter(Boolean).join(" ");
    const parts = [
        [line1, number].filter(Boolean).join(", "),
        complement,
        district,
        [city, uf].filter(Boolean).join(" - "),
        cepFmt ? `CEP ${cepFmt}` : "",
    ].filter(Boolean);

    return parts.join(", ");
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

    return {
        document: digits,
        name: (data.nome_fantasia || data.razao_social || "").trim(),
        legalName: (data.razao_social || "").trim(),
        address: formatAddress(data),
        contactEmail: (data.email || "").trim(),
        contactPhone: phones.join(" / "),
    };
}
