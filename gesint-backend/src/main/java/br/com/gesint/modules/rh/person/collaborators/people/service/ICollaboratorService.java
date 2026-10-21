package br.com.gesint.modules.rh.person.collaborators.people.service;

import br.com.gesint.core.base.service.IBaseService;
import br.com.gesint.modules.rh.person.collaborators.people.dto.CollaboratorAccessCodeResponseDto;
import br.com.gesint.modules.rh.person.collaborators.people.dto.CollaboratorRequestDto;
import br.com.gesint.modules.rh.person.collaborators.people.dto.CollaboratorResponseDto;

public interface ICollaboratorService extends IBaseService<CollaboratorRequestDto, CollaboratorResponseDto> {

    java.util.List<CollaboratorResponseDto> findAdmitted();

    java.util.List<CollaboratorResponseDto> findAdmittedManagers();

    CollaboratorAccessCodeResponseDto resendAccessCode(java.util.UUID id);
}
