package br.com.gommo.modules.careers.site.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.Map;
import java.util.UUID;

/** Identidade visual publicada. Campos nulos: o site usa o tema padrao do Gesint. */
@Getter
@Builder
public class CareersBrandingDto {
    private final String displayName;
    private final UUID logoObjectId;
    private final String primaryColor;
    private final String accentColor;
    private final String fontStyle;
    private final String cornerStyle;
    private final boolean showSalary;
    private final String seoTitle;
    private final String seoDescription;
    private final Map<String, String> socialLinks;
}
