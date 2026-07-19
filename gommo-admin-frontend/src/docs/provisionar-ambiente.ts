export const PROVISIONAR_AMBIENTE_DOC = {
    slug: "provisionar-ambiente",
    title: "Provisionar ambiente do cliente",
    summary:
        "Documentação interna Gommo sobre o botão Provisionar na aba Config. do Ambiente do cadastro de clientes.",
    sections: [
        {
            title: "O que faz",
            paragraphs: [
                "O provisionamento prepara a infraestrutura de dados do tenant a partir da configuração salva em client_environment_config.",
            ],
            steps: [
                "Aplica defaults de conexão (host, porta, schema derivado do slug, etc.).",
                "Marca o status de provisionamento como PROVISIONING.",
                "Testa a conexão JDBC com o banco configurado.",
                "Para estratégia DEDICATED_SCHEMA, cria/prepara o schema do tenant e estruturas necessárias.",
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
                "Use Testar Conexão antes de provisionar em ambientes sensíveis.",
                "Confirme se o schema/database não conflita com outro tenant.",
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

export const INTERNAL_DOCS = [PROVISIONAR_AMBIENTE_DOC] as const;
