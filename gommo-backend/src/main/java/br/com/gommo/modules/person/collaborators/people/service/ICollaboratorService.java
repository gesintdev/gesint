package br.com.gommo.modules.person.collaborators.people.service;

import br.com.gommo.core.base.service.IBaseService;
import br.com.gommo.modules.person.collaborators.people.dto.CollaboratorRequestDto;
import br.com.gommo.modules.person.collaborators.people.dto.CollaboratorResponseDto;

public interface ICollaboratorService extends IBaseService<CollaboratorRequestDto, CollaboratorResponseDto> {

    java.util.List<CollaboratorResponseDto> findAdmitted();
}
