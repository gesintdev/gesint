package br.com.gesint.modules.careers.site.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class CareersPrivacyDto {
    /** Markdown exibido no modal do formulario. */
    private final String notice;
    private final String version;
    private final int talentPoolMonths;
}
