export const ADMISSION_MESSAGES = {
    ADDRESS_INVALID_POSTAL_CODE: "Informe um CEP válido com 8 dígitos",
    ADDRESS_POSTAL_CODE_NOT_FOUND: "CEP não encontrado",
    ADDRESS_PROVIDER_UNAVAILABLE: "Não foi possível consultar o CEP. Tente novamente",
    ADDRESS_CITY_NOT_FOUND: "Município do CEP não encontrado na base do IBGE",
    ADDRESS_STATE_NOT_FOUND: "Estado não encontrado",
    ADMISSION_NOT_FOUND: "Admissão não encontrado(a)",
    ADMISSION_CPF_ALREADY_EXISTS: "Já existe admissão ou colaborador com este CPF",
    ADMISSION_PJ_PROVIDER_REQUIRED: "Para contrato PJ informe CNPJ e razão social da prestadora",
} as const;
export const ADMISSION_CLIENT_MESSAGES = {
    ADDRESS_LOOKUP_FAILED: "Não foi possível buscar o endereço pelo CEP",
    ADMISSION_LOAD_FAILED: "Não foi possível carregar admissão",
    ADMISSION_SAVE_FAILED: "Não foi possível salvar admissão",
} as const;
