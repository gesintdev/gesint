package br.com.gesint.modules.rh.person.collaborators.people.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.gesint.core.base.controller.BaseController;
import br.com.gesint.modules.rh.person.collaborators.people.dto.CollaboratorAccessCodeResponseDto;
import br.com.gesint.modules.rh.person.collaborators.people.dto.CollaboratorRequestDto;
import br.com.gesint.modules.rh.person.collaborators.people.dto.CollaboratorResponseDto;
import br.com.gesint.modules.rh.person.collaborators.people.service.ICollaboratorService;

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

    /** Reenvia (ou garante) o codigo de acesso do colaborador. Sem e-mail: retorna o codigo. */
    @PostMapping("/{id}/access-code/resend")
    public ResponseEntity<CollaboratorAccessCodeResponseDto> resendAccessCode(@PathVariable UUID id) {
        return ResponseEntity.ok(collaboratorService.resendAccessCode(id));
    }
}
