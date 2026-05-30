"use client";

import { useCallback, useState } from "react";
import { collaboratorService } from "@/modules/person/collaborators/people/services/collaborator.service";
import { Card } from "@/shared/components/ui/Card";
import {
  InputAutocomplete,
  InputCEP,
  InputCNPJ,
  InputCPF,
  InputCurrency,
  InputDate,
  InputDatetime,
  InputDecimal,
  InputRG,
  InputSelect,
  InputSelectAutocomplete,
  InputString,
} from "@/shared/components/ui/input/index";
import type { SelectItem } from "@/shared/components/ui/input/select-item.types";

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
  decimal: string;
  currencyCents: string;
  collaboratorId: string;
  hybridCollaboratorId: string;
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
  decimal: "",
  currencyCents: "",
  collaboratorId: "",
  hybridCollaboratorId: "",
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

  const searchCollaborators = useCallback(
    (query: string, page: number) => collaboratorService.searchForAutocomplete(query, page),
    [],
  );

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card title="Campos tipados" bodyClassName="space-y-4">
        <InputString
          label="Nome completo"
          value={values.fullName}
          onValueChange={(fullName) => patch({ fullName })}
          placeholder="Como em Collaborator.fullName"
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
        <InputDate label="Data nascimento" value={values.birthDate} onValueChange={(birthDate) => patch({ birthDate })} />
        <InputDatetime
          label="Datetime (demo)"
          value={values.birthDatetime}
          onValueChange={(birthDatetime) => patch({ birthDatetime })}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <InputDecimal label="Decimal" value={values.decimal} onValueChange={(decimal) => patch({ decimal })} />
          <InputCurrency
            label="Moeda (centavos)"
            value={values.currencyCents}
            onValueChange={(currencyCents) => patch({ currencyCents })}
          />
        </div>
      </Card>

      <Card title="Select, Autocomplete e híbrido" bodyClassName="space-y-4">
        <InputSelect
          label="Gênero (Colaborador)"
          items={GENDER_ITEMS}
          value={values.gender}
          onValueChange={(gender) => patch({ gender })}
          placeholder="Selecione o gênero"
          clearable
        />
        <InputSelect
          label="Estado civil (Colaborador)"
          items={MARITAL_ITEMS}
          value={values.maritalStatus}
          onValueChange={(maritalStatus) => patch({ maritalStatus })}
          clearable
        />
        <InputAutocomplete
          label="Colaborador (autocomplete)"
          hint="Busca em colaboradores — máx. 6 por página"
          value={values.collaboratorId}
          onValueChange={(collaboratorId) => patch({ collaboratorId })}
          onSearch={searchCollaborators}
          placeholder="Digite nome ou CPF..."
        />
        <InputSelectAutocomplete
          label="Híbrido: gênero local + colaborador remoto"
          hint="Digite 'Mas' para filtrar gêneros; 'Maria' para buscar colaboradores"
          items={GENDER_ITEMS}
          onSearch={searchCollaborators}
          value={values.hybridCollaboratorId}
          onValueChange={(hybridCollaboratorId) => patch({ hybridCollaboratorId })}
          placeholder="Lista fixa ou busca colaboradores..."
        />
      </Card>

      <Card title="Valores enviados (sem máscara)" className="lg:col-span-2">
        <p className="mb-3 text-xs text-base-content/55">
          CPF, CNPJ, CEP e RG retornam apenas dígitos/caracteres limpos. Moeda retorna centavos. Decimal usa ponto.
          Datas retornam ISO (YYYY-MM-DD).
        </p>
        <ValuesPreview values={values} />
      </Card>
    </div>
  );
}
