package br.com.gommo.modules.careers.candidateportal.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class CandidatePortalPreAdmissionItemDto {
    private final String key;
    private final String label;
    private final boolean done;
    private final boolean required;
}
