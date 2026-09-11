package br.com.gommo.modules.rh.person.collaborators.people.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class CollaboratorAccessCodeResponseDto {

    private final String accessCode;
}
