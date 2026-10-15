package br.com.gommo.modules.careers.candidateportal.dto;

import java.util.UUID;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class CandidatePortalPreAdmissionDocumentDto {
    private final UUID linkId;
    private final UUID objectId;
    private final String documentType;
    private final String displayName;
}
