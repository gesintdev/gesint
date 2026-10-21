package br.com.gesint.modules.careers.page.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Getter
@Builder
public class CareersPageResponseDto {
    private final UUID id;
    /** false enquanto o cliente nao salvou: tema e blocos vem do padrao do sistema. */
    private final boolean persisted;
    private final boolean published;
    private final boolean hasUnpublishedChanges;
    private final OffsetDateTime publishedAt;
    private final Integer privacyNoticeVersion;
    private final String organizationName;
    private final String defaultPrivacyNotice;
    private final CareersThemeDto theme;
    private final List<CareersBlockDto> blocks;
}
