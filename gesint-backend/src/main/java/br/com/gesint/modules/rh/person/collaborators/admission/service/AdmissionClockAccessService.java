package br.com.gesint.modules.rh.person.collaborators.admission.service;

import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import br.com.gesint.core.entity.StatusEnum;
import br.com.gesint.modules.rh.person.collaborators.admission.entity.AdmissionProcess;
import br.com.gesint.modules.rh.person.collaborators.admission.mapper.AdmissionProcessMapper;
import br.com.gesint.modules.rh.person.collaborators.admission.repository.AdmissionProcessRepository;
import br.com.gesint.modules.rh.person.collaborators.people.service.CollaboratorProfileService;

/**
 * Emite o codigo de ponto do colaborador quando a admissao ja pode registrar ponto.
 * Nao gera o codigo no cadastro inicial: so quando a admissao e aprovada ou fica apta.
 */
@Service
public class AdmissionClockAccessService {

    private final CollaboratorProfileService collaboratorProfileService;
    private final AdmissionProcessMapper admissionMapper;
    private final AdmissionProcessRepository admissionRepository;

    public AdmissionClockAccessService(
            CollaboratorProfileService collaboratorProfileService,
            AdmissionProcessMapper admissionMapper,
            AdmissionProcessRepository admissionRepository) {
        this.collaboratorProfileService = collaboratorProfileService;
        this.admissionMapper = admissionMapper;
        this.admissionRepository = admissionRepository;
    }

    @Transactional
    public String issue(AdmissionProcess admission) {
        if (admission == null || admission.getStatus() == StatusEnum.DELETED) {
            return null;
        }
        UUID collaboratorId = admission.getCollaboratorId();
        if (collaboratorId == null) {
            if (!StringUtils.hasText(admission.getCpf())
                    || !StringUtils.hasText(admission.getFullName())
                    || admission.getBirthDate() == null) {
                return null;
            }
            collaboratorId = collaboratorProfileService.syncFromAdmission(admissionMapper.toRequest(admission), null);
            admission.setCollaboratorId(collaboratorId);
            admissionRepository.save(admission);
        }
        return collaboratorProfileService.ensureAccessCode(collaboratorId);
    }
}
