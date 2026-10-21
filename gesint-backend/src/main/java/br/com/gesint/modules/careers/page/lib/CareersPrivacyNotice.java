package br.com.gesint.modules.careers.page.lib;

/**
 * Aviso de privacidade da candidatura (RN-02 / RN-33). Sem texto proprio publicado, vale o padrao
 * abaixo; a versao aceita pelo candidato fica gravada na candidatura.
 */
public final class CareersPrivacyNotice {

    public static final String DEFAULT_VERSION = "padrao-v1";

    private static final String DEFAULT_TEMPLATE = """
            ## Aviso de privacidade do processo seletivo

            **%s** usa os dados desta candidatura (nome, contato, cidade, currículo e experiências) \
            somente para conduzir **este processo seletivo**.

            - **Base legal:** procedimentos preliminares a um possível contrato (LGPD, art. 7º, V).
            - **Uso de IA:** o currículo pode ser lido por uma ferramenta de inteligência artificial \
            para ajudar o recrutador. A decisão é sempre de uma pessoa e você pode pedir revisão.
            - **Não pedimos** dados sensíveis (saúde, raça, religião) nem CPF ou data de nascimento \
            nesta etapa. Eles só são coletados na pré-admissão, se você for contratado(a).
            - **Retenção:** encerrado o processo, os dados são eliminados ou anonimizados, salvo se \
            você autorizar o banco de talentos.
            - **Banco de talentos (opcional):** com sua autorização, guardamos o currículo pelo prazo \
            informado no formulário para outras vagas. Você pode revogar quando quiser.
            - **Seus direitos:** acesso, correção, eliminação e revogação do consentimento \
            (LGPD, art. 18), pelo contato do recrutador.
            """;

    private CareersPrivacyNotice() {}

    public static String defaultText(String organizationName) {
        String name = organizationName == null || organizationName.isBlank() ? "A empresa" : organizationName.trim();
        return DEFAULT_TEMPLATE.formatted(name);
    }

    public static String customVersion(int version) {
        return "v" + version;
    }

    public static String versionOf(String customText, Integer version) {
        if (customText == null || customText.isBlank()) {
            return DEFAULT_VERSION;
        }
        return customVersion(version == null ? 1 : version);
    }

    public static String effectiveText(String customText, String organizationName) {
        return customText == null || customText.isBlank() ? defaultText(organizationName) : customText;
    }
}
