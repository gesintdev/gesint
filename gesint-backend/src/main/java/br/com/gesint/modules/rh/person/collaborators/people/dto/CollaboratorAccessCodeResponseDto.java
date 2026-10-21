package br.com.gesint.modules.rh.person.collaborators.people.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class CollaboratorAccessCodeResponseDto {

    private final String accessCode;
}
