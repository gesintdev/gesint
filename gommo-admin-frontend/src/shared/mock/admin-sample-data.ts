export type ClientStatus = "Ativo" | "Inativo" | "Pausado" | "Cancelado";

export type SampleClient = {
    id: number;
    cnpj: string;
    nome: string;
    razao: string;
    email: string;
    tel: string;
    cidade: string;
    uf: string;
    status: ClientStatus;
};

export type SampleSistema = {
    id: number;
    nome: string;
    modulo: string;
    status: ClientStatus;
    dataStatus: string;
    dataRetorno?: string;
    valorNeg: number;
    desconto: number;
    valorAcordado: number;
    tipoContrato: string;
    dataContrato: string;
    dataFim: string | null;
    dataVenc: string;
    tolerancia: string;
    ia: boolean;
};

export const SAMPLE_CLIENTS: SampleClient[] = [
    {
        id: 1,
        cnpj: "12.345.678/0001-90",
        nome: "TechCorp Soluções",
        razao: "TechCorp Soluções LTDA",
        email: "contato@techcorp.com.br",
        tel: "(11) 3456-7890",
        cidade: "São Paulo",
        uf: "SP",
        status: "Ativo",
    },
    {
        id: 2,
        cnpj: "98.765.432/0001-10",
        nome: "Grupo Meridian",
        razao: "Meridian Comércio e Serviços S/A",
        email: "ti@meridian.com.br",
        tel: "(21) 2345-6789",
        cidade: "Rio de Janeiro",
        uf: "RJ",
        status: "Ativo",
    },
    {
        id: 3,
        cnpj: "11.222.333/0001-44",
        nome: "Alphanet",
        razao: "Alphanet Tecnologia EIRELI",
        email: "suporte@alphanet.com.br",
        tel: "(31) 9876-5432",
        cidade: "Belo Horizonte",
        uf: "MG",
        status: "Inativo",
    },
    {
        id: 4,
        cnpj: "55.666.777/0001-88",
        nome: "Delta Sistemas",
        razao: "Delta Sistemas e Serviços LTDA",
        email: "admin@delta.com.br",
        tel: "(41) 3210-9876",
        cidade: "Curitiba",
        uf: "PR",
        status: "Ativo",
    },
    {
        id: 5,
        cnpj: "33.444.555/0001-22",
        nome: "Nexus Digital",
        razao: "Nexus Digital Comércio LTDA",
        email: "financeiro@nexus.com.br",
        tel: "(51) 4567-8901",
        cidade: "Porto Alegre",
        uf: "RS",
        status: "Pausado",
    },
    {
        id: 6,
        cnpj: "77.888.999/0001-66",
        nome: "Pulsar Tecnologia",
        razao: "Pulsar Tecnologia S/A",
        email: "contato@pulsar.tech",
        tel: "(85) 5678-9012",
        cidade: "Fortaleza",
        uf: "CE",
        status: "Ativo",
    },
    {
        id: 7,
        cnpj: "22.111.000/0001-33",
        nome: "Horizonte Cloud",
        razao: "Horizonte Cloud Services LTDA",
        email: "ops@horizonte.io",
        tel: "(62) 6789-0123",
        cidade: "Goiânia",
        uf: "GO",
        status: "Cancelado",
    },
    {
        id: 8,
        cnpj: "44.333.222/0001-55",
        nome: "Vortex Sistemas",
        razao: "Vortex Sistemas e Automação EIRELI",
        email: "comercial@vortex.com.br",
        tel: "(61) 7890-1234",
        cidade: "Brasília",
        uf: "DF",
        status: "Ativo",
    },
];

export const SAMPLE_SISTEMAS: SampleSistema[] = [
    {
        id: 1,
        nome: "Gommo ERP",
        modulo: "Gestão Empresarial",
        status: "Ativo",
        dataStatus: "2023-03-15",
        valorNeg: 2800,
        desconto: 10,
        valorAcordado: 2520,
        tipoContrato: "Anual",
        dataContrato: "2023-03-15",
        dataFim: "2025-03-15",
        dataVenc: "15",
        tolerancia: "5 dias",
        ia: true,
    },
    {
        id: 2,
        nome: "Gommo PDV",
        modulo: "Ponto de Venda",
        status: "Pausado",
        dataStatus: "2024-08-01",
        dataRetorno: "2024-10-01",
        valorNeg: 1200,
        desconto: 0,
        valorAcordado: 1200,
        tipoContrato: "Mensal",
        dataContrato: "2022-06-01",
        dataFim: null,
        dataVenc: "01",
        tolerancia: "3 dias",
        ia: false,
    },
    {
        id: 3,
        nome: "Gommo BI",
        modulo: "Business Intelligence",
        status: "Inativo",
        dataStatus: "2024-01-10",
        valorNeg: 1800,
        desconto: 5,
        valorAcordado: 1710,
        tipoContrato: "Mensal",
        dataContrato: "2023-01-10",
        dataFim: "2024-01-10",
        dataVenc: "10",
        tolerancia: "7 dias",
        ia: true,
    },
];
