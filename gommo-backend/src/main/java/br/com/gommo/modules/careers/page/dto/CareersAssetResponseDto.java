package br.com.gommo.modules.careers.page.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.UUID;

@Getter
@Builder
public class CareersAssetResponseDto {
    private final UUID objectId;
    private final String fileName;
    private final String contentType;
}
