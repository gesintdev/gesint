package br.com.gommo.modules.careers.page.exception;

public final class CareersPageExceptions {
    private CareersPageExceptions() {}

    public static final String NOT_SAVED_CODE = "CAREERS_PAGE_NOT_SAVED";
    public static final String NOT_SAVED_MSG = "Salve a p\u00e1gina antes de publicar.";

    public static final String NOTHING_PUBLISHED_CODE = "CAREERS_PAGE_NOTHING_PUBLISHED";
    public static final String NOTHING_PUBLISHED_MSG = "Ainda n\u00e3o h\u00e1 vers\u00e3o publicada para restaurar.";

    public static final String TOO_MANY_BLOCKS_CODE = "CAREERS_PAGE_TOO_MANY_BLOCKS";
    public static final String TOO_MANY_BLOCKS_MSG = "A p\u00e1gina aceita no m\u00e1ximo %d blocos.";

    public static final String SYSTEM_BLOCK_REQUIRED_CODE = "CAREERS_PAGE_SYSTEM_BLOCK_REQUIRED";
    public static final String SYSTEM_BLOCK_REQUIRED_MSG =
            "Blocos padr\u00e3o n\u00e3o podem ser removidos, apenas ocultados.";

    public static final String DUPLICATE_SYSTEM_BLOCK_CODE = "CAREERS_PAGE_DUPLICATE_SYSTEM_BLOCK";
    public static final String DUPLICATE_SYSTEM_BLOCK_MSG = "Cada bloco padr\u00e3o pode aparecer uma \u00fanica vez.";

    public static final String VACANCIES_BLOCK_HIDDEN_CODE = "CAREERS_PAGE_VACANCIES_BLOCK_HIDDEN";
    public static final String VACANCIES_BLOCK_HIDDEN_MSG = "O bloco \"Vagas abertas\" n\u00e3o pode ser ocultado.";

    public static final String BLOCK_TOO_LARGE_CODE = "CAREERS_PAGE_BLOCK_TOO_LARGE";
    public static final String BLOCK_TOO_LARGE_MSG = "O conte\u00fado de um bloco est\u00e1 grande demais.";

    public static final String IMAGE_CONSENT_REQUIRED_CODE = "CAREERS_PAGE_IMAGE_CONSENT_REQUIRED";
    public static final String IMAGE_CONSENT_REQUIRED_MSG =
            "Confirme a autoriza\u00e7\u00e3o de uso de imagem dos colaboradores no bloco \"Um dia aqui\".";

    public static final String INVALID_SOCIAL_LINK_CODE = "CAREERS_PAGE_INVALID_SOCIAL_LINK";
    public static final String INVALID_SOCIAL_LINK_MSG = "Link de rede social inv\u00e1lido.";

    public static final String ASSET_INVALID_TYPE_CODE = "CAREERS_PAGE_ASSET_INVALID_TYPE";
    public static final String ASSET_INVALID_TYPE_MSG = "Envie uma imagem PNG, JPG, WEBP ou GIF.";

    public static final String ASSET_TOO_LARGE_CODE = "CAREERS_PAGE_ASSET_TOO_LARGE";
    public static final String ASSET_TOO_LARGE_MSG = "A imagem deve ter no m\u00e1ximo 5 MB.";

    public static final String ASSET_NOT_FOUND_CODE = "CAREERS_PAGE_ASSET_NOT_FOUND";
    public static final String ASSET_NOT_FOUND_MSG = "Imagem n\u00e3o encontrada.";
}
