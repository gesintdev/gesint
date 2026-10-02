package br.com.gommo.modules.careers.page.entity;

/**
 * Blocos da pagina de carreiras. Os blocos de sistema existem uma unica vez por pagina e nao
 * podem ser removidos (so ocultados); os demais sao criados livremente pelo cliente.
 */
public enum CareersBlockTypeEnum {
    HERO(true),
    WHY_WORK_HERE(true),
    BENEFITS(true),
    DAY_IN_LIFE(true),
    OPEN_VACANCIES(true),
    TALENT_POOL(true),
    TEXT(false),
    IMAGE_TEXT(false),
    STATS(false),
    FAQ(false),
    VIDEO(false),
    CTA(false);

    private final boolean systemBlock;

    CareersBlockTypeEnum(boolean systemBlock) {
        this.systemBlock = systemBlock;
    }

    public boolean isSystemBlock() {
        return systemBlock;
    }
}
