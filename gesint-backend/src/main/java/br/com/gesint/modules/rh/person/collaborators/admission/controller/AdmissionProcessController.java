package br.com.gesint.modules.rh.person.collaborators.admission.controller;

import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.gesint.core.base.controller.BaseController;
import br.com.gesint.modules.rh.person.collaborators.admission.dto.AdmissionProcessRequestDto;
import br.com.gesint.modules.rh.person.collaborators.admission.dto.AdmissionProcessResponseDto;
import br.com.gesint.modules.rh.person.collaborators.admission.service.IAdmissionProcessService;
import br.com.gesint.modules.rh.person.collaborators.people.dto.CollaboratorAccessCodeResponseDto;

@RestController
@RequestMapping("/api/v1/admissions")
public class AdmissionProcessController
        extends BaseController<AdmissionProcessRequestDto, AdmissionProcessResponseDto> {

    private final IAdmissionProcessService admissionProcessService;

    public AdmissionProcessController(IAdmissionProcessService service) {
        super(service);
        this.admissionProcessService = service;
    }

    /** Cadastro vigente da pessoa, editável na aba Pessoas. */
    @GetMapping("/by-collaborator/{collaboratorId}")
    public ResponseEntity<AdmissionProcessResponseDto> findCurrentByCollaborator(
            @PathVariable UUID collaboratorId) {
        return admissionProcessService
                .findCurrentByCollaborator(collaboratorId)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /** Gera o codigo de ponto de admissao antiga ou migrada que ainda nao tem um. */
    @PostMapping("/{id}/access-code")
    public ResponseEntity<CollaboratorAccessCodeResponseDto> issueAccessCode(@PathVariable UUID id) {
        return ResponseEntity.ok(CollaboratorAccessCodeResponseDto.builder()
                .accessCode(admissionProcessService.issueClockAccess(id))
                .build());
    }
}
