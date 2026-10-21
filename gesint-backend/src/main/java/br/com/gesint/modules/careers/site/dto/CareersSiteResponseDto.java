package br.com.gesint.modules.careers.site.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

import br.com.gesint.modules.careers.page.dto.CareersBlockDto;

/** Pagina da empresa (/careers): blocos publicados + vagas abertas. */
@Getter
@Builder
public class CareersSiteResponseDto {
    private final String organizationName;
    /** false: nenhuma pagina publicada, o site usa o layout padrao (capa + vagas). */
    private final boolean customized;
    private final CareersBrandingDto branding;
    private final List<CareersBlockDto> blocks;
    private final List<CareersVacancySummaryDto> vacancies;
    private final CareersPrivacyDto privacy;
}
