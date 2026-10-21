package br.com.gesint.modules.careers.candidateportal.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class CandidatePortalTimelineStepDto {
    private final String key;
    private final String label;
    /** done | current | pending */
    private final String state;
}
