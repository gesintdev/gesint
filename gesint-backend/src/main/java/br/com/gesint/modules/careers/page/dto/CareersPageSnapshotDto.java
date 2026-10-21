package br.com.gesint.modules.careers.page.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

/** Versao publicada da pagina, guardada em {@code careers_page.published_snapshot}. */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CareersPageSnapshotDto {
    private Integer revision;
    private Integer privacyNoticeVersion;
    /** Ja houve aviso proprio publicado: um texto novo precisa de nova versao (RN-33). */
    private Boolean customNoticeEverPublished;
    private OffsetDateTime publishedAt;
    private CareersThemeDto theme;

    @Builder.Default
    private List<CareersBlockDto> blocks = new ArrayList<>();
}
