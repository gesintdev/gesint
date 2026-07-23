package br.com.gommo.modules.rh.person.jobvacancy.publicapi.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class PublicJobApplicationResponseDto {
    private final String message;
}
