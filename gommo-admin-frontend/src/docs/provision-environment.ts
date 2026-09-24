export const PROVISION_ENVIRONMENT_DOC = {
    slug: "provision-environment",
    title: "Provisionar ambiente do cliente",
    summary:
        "Documentação interna Gesint sobre o botão Provisionar na aba Config. do Ambiente do cadastro de clientes.",
    sections: [
        {
            title: "O que faz",
            paragraphs: [
                "O provisionamento prepara a infraestrutura de dados do tenant a partir da configuração salva em client_environment_config.",
            ],
            steps: [
                "Le o schema de client_environment_config.database_schema (nao inventa nome ao abrir o cliente).",
                "So preenche schema default tenant_{slug} quando o campo estiver vazio (cadastro novo).",
                "Aplica defaults de conexao ausentes (host, porta, usuario, secret).",
                "Marca o status de provisionamento como PROVISIONING.",
                "Testa a conexão JDBC com o banco configurado.",
                "Para estratégia DEDICATED_SCHEMA, cria/prepara o schema informado no cadastro.",
                "Em sucesso, marca como READY e tenta provisionar usuários pendentes.",
                "Em falha, marca como ERROR e grava a mensagem em provisioning notes.",
            ],
        },
        {
            title: "Quando usar",
            bullets: [
                "Após cadastrar o cliente e revisar host/schema/usuário do banco.",
                "Quando o status estiver PENDING ou ERROR (nova tentativa).",
                "Antes de liberar o acesso operacional do tenant no ERP.",
            ],
        },
        {
            title: "Cuidados",
            bullets: [
                "O campo Schema e a fonte da verdade: grave posto_sjb (ou o nome real) e o Admin reutiliza esse valor.",
                "Use Testar Conexão antes de provisionar em ambientes sensíveis.",
                "Nao apague nem troque o schema se ja houver usuarios/dados la.",
                "O botão exige autoridade platform:admin.",
                "Não dispare provisionamento em loop; cada tentativa altera o status e notas.",
            ],
        },
        {
            title: "Endpoint",
            code: "POST /api/v1/clients/{id}/actions/start-provisioning",
        },
    ],
} as const;

export const INTERNAL_DOCS = [PROVISION_ENVIRONMENT_DOC] as const;
