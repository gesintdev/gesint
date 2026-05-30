package br.com.gommo.modules.person.collaborators.people.controller;

import br.com.gommo.core.base.controller.BaseController;
import br.com.gommo.modules.person.collaborators.people.dto.CollaboratorRequestDto;
import br.com.gommo.modules.person.collaborators.people.dto.CollaboratorResponseDto;
import br.com.gommo.modules.person.collaborators.people.service.ICollaboratorService;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/collaborators")
public class CollaboratorController extends BaseController<CollaboratorRequestDto, CollaboratorResponseDto> {

    private final ICollaboratorService collaboratorService;

    public CollaboratorController(ICollaboratorService collaboratorService) {
        super(collaboratorService);
        this.collaboratorService = collaboratorService;
    }

    /** Colaboradores gerados por admissões concluídas (seleção em outros módulos). */
    @GetMapping("/admitted")
    public ResponseEntity<List<CollaboratorResponseDto>> findAdmitted() {
        return ResponseEntity.ok(collaboratorService.findAdmitted());
    }
}
