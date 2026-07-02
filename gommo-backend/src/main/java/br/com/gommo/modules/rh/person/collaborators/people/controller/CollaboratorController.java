package br.com.gommo.modules.rh.person.collaborators.people.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.gommo.core.base.controller.BaseController;
import br.com.gommo.modules.rh.person.collaborators.people.dto.CollaboratorRequestDto;
import br.com.gommo.modules.rh.person.collaborators.people.dto.CollaboratorResponseDto;
import br.com.gommo.modules.rh.person.collaborators.people.service.ICollaboratorService;

@RestController
@RequestMapping("/api/v1/collaborators")
public class CollaboratorController extends BaseController<CollaboratorRequestDto, CollaboratorResponseDto> {

    private final ICollaboratorService collaboratorService;

    public CollaboratorController(ICollaboratorService collaboratorService) {
        super(collaboratorService);
        this.collaboratorService = collaboratorService;
    }

    /** Colaboradores gerados por admissoes concluidas (selecao em outros modulos). */
    @GetMapping("/admitted")
    public ResponseEntity<List<CollaboratorResponseDto>> findAdmitted() {
        return ResponseEntity.ok(collaboratorService.findAdmitted());
    }

    /** Colaboradores admitidos em cargos com natureza de gestao. */
    @GetMapping("/admitted-managers")
    public ResponseEntity<List<CollaboratorResponseDto>> findAdmittedManagers() {
        return ResponseEntity.ok(collaboratorService.findAdmittedManagers());
    }
}