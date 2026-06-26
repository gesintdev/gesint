"use client";
import { useCallback, useState } from "react";

import { Card } from "@/shared/components/ui/Card";
import {
    InputAutocomplete,
    InputCEP,
    InputCNPJ,
    InputCPF,
    InputCurrency,
    InputDate,
    InputDatetime,
    InputNumber,
    InputRG,
    InputSelect,
    InputSelectAutocomplete,
    InputString,
} from "@/shared/components/ui/input/index";
import type { SelectItem } from "@/shared/components/ui/input/select-item.types";

const PAGE_SIZE = 6;

const GENDER_ITEMS: SelectItem[] = [
    { value: "MALE", label: "Masculino" },
    { value: "FEMALE", label: "Feminino" },
    { value: "OTHER", label: "Outro" },
    { value: "NOT_INFORMED", label: "Prefere não informar" },
];
const MARITAL_ITEMS: SelectItem[] = [
    { value: "SINGLE", label: "Solteiro(a)" },
    { value: "MARRIED", label: "Casado(a)" },
    { value: "DIVORCED", label: "Divorciado(a)" },
    { value: "WIDOWED", label: "Viúvo(a)" },
    { value: "OTHER", label: "Outro" },
];

const DEMO_AUTOCOMPLETE_ITEMS: SelectItem[] = [
    { value: "client-gommo", label: "Gommo Tecnologia", description: "Cliente plataforma" },
    { value: "client-acme", label: "Acme Brasil", description: "Cliente plataforma" },
    { value: "client-nova", label: "Nova Contabilidade", description: "Cliente plataforma" },
    { value: "client-alpha", label: "Alpha Servicos", description: "Cliente plataforma" },
    { value: "client-beta", label: "Beta Consultoria", description: "Cliente plataforma" },
    { value: "client-delta", label: "Delta Logistica", description: "Cliente plataforma" },
    { value: "admin-ana", label: "Ana Admin", description: "Usuario admin" },
    { value: "admin-bruno", label: "Bruno Operacoes", description: "Usuario admin" },
];

type FormState = {
    fullName: string;
    cpf: string;
    cnpj: string;
    rg: string;
    cep: string;
    birthDate: string;
    birthDatetime: string;
    gender: string;
    maritalStatus: string;
    decimal: number | null;
    integerNumber: number | null;
    decimalWithSep: number | null;
    currencyCents: string;
    demoAutocompleteId: string;
    hybridDemoId: string;
};

const initial: FormState = {
    fullName: "",
    cpf: "",
    cnpj: "",
    rg: "",
    cep: "",
    birthDate: "",
    birthDatetime: "",
    gender: "",
    maritalStatus: "",
    decimal: null,
    integerNumber: null,
    decimalWithSep: null,
    currencyCents: "",
    demoAutocompleteId: "",
    hybridDemoId: "",
};

function ValuesPreview({ values }: { values: FormState }) {
    return (
        <pre className="max-h-64 overflow-auto rounded-lg bg-base-200/80 p-3 text-[11px] leading-relaxed text-base-content/80">
            {JSON.stringify(values, null, 2)}
        </pre>
    );
}

export function InputsPlaygroundClient() {
    const [values, setValues] = useState<FormState>(initial);
    const patch = useCallback((partial: Partial<FormState>) => {
        setValues((prev) => ({ ...prev, ...partial }));
    }, []);
    const searchDemoItems = useCallback(async (query: string, page: number) => {
        const normalized = query.trim().toLowerCase();
        const filtered = DEMO_AUTOCOMPLETE_ITEMS.filter(
            (item) =>
                item.label.toLowerCase().includes(normalized) ||
                item.description?.toLowerCase().includes(normalized),
        );
        const start = page * PAGE_SIZE;

        return {
            items: filtered.slice(start, start + PAGE_SIZE),
            hasMore: start + PAGE_SIZE < filtered.length,
            page,
        };
    }, []);

    return (
        <div className="grid gap-6 lg:grid-cols-2">
            <Card title="Campos tipados" bodyClassName="space-y-4">
                <InputString
                    label="Nome"
                    value={values.fullName}
                    onValueChange={(fullName) => patch({ fullName })}
                    placeholder="Nome exibido"
                    required
                />
                <div className="grid gap-4 sm:grid-cols-2">
                    <InputCPF label="CPF" value={values.cpf} onValueChange={(cpf) => patch({ cpf })} required />
                    <InputRG label="RG" value={values.rg} onValueChange={(rg) => patch({ rg })} />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                    <InputCNPJ label="CNPJ (demo)" value={values.cnpj} onValueChange={(cnpj) => patch({ cnpj })} />
                    <InputCEP label="CEP (demo)" value={values.cep} onValueChange={(cep) => patch({ cep })} />
                </div>
                <InputDate
                    label="Data nascimento"
                    value={values.birthDate}
                    onValueChange={(birthDate) => patch({ birthDate })}
                />
                <InputDatetime
                    label="Datetime (demo)"
                    value={values.birthDatetime}
                    onValueChange={(birthDatetime) => patch({ birthDatetime })}
                />
                <div className="grid gap-4 sm:grid-cols-2">
                    <InputNumber
                        label="Decimal (2 casas)"
                        value={values.decimal}
                        onValueChange={(decimal) => patch({ decimal })}
                    />
                    <InputNumber
                        label="Inteiro com sufixo"
                        integer
                        suffix="h"
                        align="left"
                        value={values.integerNumber}
                        onValueChange={(integerNumber) => patch({ integerNumber })}
                    />
                    <InputNumber
                        label="Decimal + milhar"
                        thousandSeparator
                        decimalPlaces={4}
                        prefix="R$"
                        value={values.decimalWithSep}
                        onValueChange={(decimalWithSep) => patch({ decimalWithSep })}
                    />
                    <InputCurrency
                        label="Moeda (centavos)"
                        value={values.currencyCents}
                        onValueChange={(currencyCents) => patch({ currencyCents })}
                    />
                </div>
            </Card>
            <Card title="Select, Autocomplete e híbrido" bodyClassName="space-y-4">
                <InputSelect
                    label="Gênero (demo)"
                    items={GENDER_ITEMS}
                    value={values.gender}
                    onValueChange={(gender) => patch({ gender })}
                    placeholder="Selecione o gênero"
                    clearable
                />
                <InputSelect
                    label="Estado civil (demo)"
                    items={MARITAL_ITEMS}
                    value={values.maritalStatus}
                    onValueChange={(maritalStatus) => patch({ maritalStatus })}
                    clearable
                />
                <InputAutocomplete
                    label="Cliente ou admin (autocomplete)"
                    hint="Busca local de demonstração"
                    value={values.demoAutocompleteId}
                    onValueChange={(demoAutocompleteId) => patch({ demoAutocompleteId })}
                    onSearch={searchDemoItems}
                    placeholder="Digite cliente ou admin..."
                />
                <InputSelectAutocomplete
                    label="Híbrido: gênero local + busca demo"
                    hint="Digite 'Mas' para filtrar gêneros; 'Cliente' para buscar exemplos"
                    items={GENDER_ITEMS}
                    onSearch={searchDemoItems}
                    value={values.hybridDemoId}
                    onValueChange={(hybridDemoId) => patch({ hybridDemoId })}
                    placeholder="Lista fixa ou busca demo..."
                />
            </Card>
            <Card title="Valores enviados (sem máscara)" className="lg:col-span-2">
                <p className="mb-3 text-xs text-base-content/55">
                    CPF, CNPJ, CEP e RG retornam apenas dígitos/caracteres limpos. Moeda retorna centavos. Número
                    retorna `number | null`. Datas retornam ISO (YYYY-MM-DD).
                </p>
                <ValuesPreview values={values} />
            </Card>
        </div>
    );
}
