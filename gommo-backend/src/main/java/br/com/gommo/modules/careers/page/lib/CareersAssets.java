package br.com.gommo.modules.careers.page.lib;

import java.util.Set;

/** Imagens da pagina de carreiras (logo, capa, fotos): servidas sem login pela rota publica. */
public final class CareersAssets {

    public static final String ENTITY_TYPE = "careers_page";
    public static final String LINK_ROLE = "CAREERS_ASSET";
    public static final long MAX_BYTES = 5L * 1024 * 1024;

    /** SVG fica de fora: servido na mesma origem da pagina, permitiria script embutido. */
    public static final Set<String> ALLOWED_CONTENT_TYPES =
            Set.of("image/png", "image/jpeg", "image/webp", "image/gif");

    private CareersAssets() {}
}
