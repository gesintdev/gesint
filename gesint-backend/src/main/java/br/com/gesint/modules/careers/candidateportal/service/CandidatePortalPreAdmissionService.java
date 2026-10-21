package br.com.gesint.modules.careers.candidateportal.service;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import br.com.gesint.core.entity.StatusEnum;
import br.com.gesint.modules.careers.candidateportal.auth.CandidatePortalSecurity;
import br.com.gesint.modules.careers.candidateportal.dto.CandidatePortalPreAdmissionDocumentDto;
import br.com.gesint.modules.careers.candidateportal.dto.CandidatePortalPreAdmissionItemDto;
import br.com.gesint.modules.careers.candidateportal.dto.CandidatePortalPreAdmissionUpdateRequestDto;
import br.com.gesint.modules.careers.candidateportal.dto.CandidatePortalPreAdmissionViewDto;
import br.com.gesint.modules.careers.candidateportal.entity.CandidateAccount;
import br.com.gesint.modules.careers.candidateportal.exception.CandidatePortalException;
import br.com.gesint.modules.careers.candidateportal.repository.CandidateAccountRepository;
import br.com.gesint.modules.rh.person.collaborators.admission.entity.AdmissionProcess;
import br.com.gesint.modules.rh.person.collaborators.admission.pipeline.domain.AdmissionPipelineRules;
import br.com.gesint.modules.rh.person.collaborators.admission.repository.AdmissionProcessRepository;
import br.com.gesint.modules.rh.person.jobvacancy.entity.JobVacancy;
import br.com.gesint.modules.rh.person.jobvacancy.repository.JobVacancyRepository;
import br.com.gesint.modules.rh.person.jobvacancyapplication.entity.JobVacancyApplication;
import br.com.gesint.modules.rh.person.jobvacancyapplication.repository.JobVacancyApplicationRepository;
import br.com.gesint.modules.storage.dto.StorageObjectLinkResponseDto;
import br.com.gesint.modules.storage.service.IStorageService;

@Service
public class CandidatePortalPreAdmissionService {

    private static final String ENTITY_TYPE = "admission_process";

    private final CandidateAccountRepository accountRepository;
    private final AdmissionProcessRepository admissionProcessRepository;
    private final JobVacancyApplicationRepository applicationRepository;
    private final JobVacancyRepository jobVacancyRepository;
    private final IStorageService storageService;

    public CandidatePortalPreAdmissionService(
            CandidateAccountRepository accountRepository,
            AdmissionProcessRepository admissionProcessRepository,
            JobVacancyApplicationRepository applicationRepository,
            JobVacancyRepository jobVacancyRepository,
            IStorageService storageService) {
        this.accountRepository = accountRepository;
        this.admissionProcessRepository = admissionProcessRepository;
        this.applicationRepository = applicationRepository;
        this.jobVacancyRepository = jobVacancyRepository;
        this.storageService = storageService;
    }

    @Transactional(readOnly = true)
    public CandidatePortalPreAdmissionViewDto getMyPreAdmission(String token) {
        AdmissionProcess admission = resolveAdmission(token);
        return toView(admission);
    }

    @Transactional
    public CandidatePortalPreAdmissionViewDto updateMyPreAdmission(
            String token, CandidatePortalPreAdmissionUpdateRequestDto request) {
        AdmissionProcess admission = resolveAdmission(token);
        if (request.getFullName() != null && !request.getFullName().isBlank()) {
            admission.setFullName(request.getFullName().trim());
        }
        if (request.getPhone() != null) {
            String phone = request.getPhone().trim();
            admission.setPhone(phone.isEmpty() ? null : phone);
        }
        if (request.getBirthDate() != null) {
            admission.setBirthDate(request.getBirthDate());
        }
        if (request.getBankCode() != null) {
            admission.setBankCode(trimToNull(request.getBankCode()));
        }
        if (request.getBankAgency() != null) {
            admission.setBankAgency(trimToNull(request.getBankAgency()));
        }
        if (request.getBankAccount() != null) {
            admission.setBankAccount(trimToNull(request.getBankAccount()));
        }
        if (request.getBankAccountDigit() != null) {
            admission.setBankAccountDigit(trimToNull(request.getBankAccountDigit()));
        }
        if (request.getBankAccountType() != null) {
            admission.setBankAccountType(trimToNull(request.getBankAccountType()));
        }
        if (request.getPixKey() != null) {
            admission.setPixKey(trimToNull(request.getPixKey()));
        }
        JobVacancy vacancy = resolveVacancy(admission);
        if (request.getPcdSelfDeclared() != null && vacancy != null && Boolean.TRUE.equals(vacancy.getAffirmativePcd())) {
            admission.setPcdSelfDeclared(request.getPcdSelfDeclared());
            admission.setPcdSelfDeclaredAt(OffsetDateTime.now());
        }
        admissionProcessRepository.save(admission);
        return toView(admission);
    }

    @Transactional
    public CandidatePortalPreAdmissionViewDto uploadDocument(String token, MultipartFile file, String documentType) {
        AdmissionProcess admission = resolveAdmission(token);
        String type = normalizeDocumentType(documentType);
        if (type == null) {
            throw CandidatePortalException.preAdmissionDocumentType();
        }
        var uploaded = storageService.uploadInternal(file, admission.getCompanyId());
        storageService.linkToEntityInternal(
                ENTITY_TYPE,
                admission.getId(),
                uploaded.getId(),
                "DOCUMENT",
                file != null ? file.getOriginalFilename() : type,
                type,
                admission.getCompanyId());
        return toView(admission);
    }

    @Transactional
    public CandidatePortalPreAdmissionViewDto complete(String token) {
        AdmissionProcess admission = resolveAdmission(token);
        CandidatePortalPreAdmissionViewDto view = toView(admission);
        boolean incomplete = view.getPendingItems().stream()
                .anyMatch(item -> item.isRequired() && !item.isDone());
        if (incomplete) {
            throw CandidatePortalException.preAdmissionIncomplete();
        }
        admission.setPreAdmissionCompletedAt(OffsetDateTime.now());
        admissionProcessRepository.save(admission);
        return toView(admission);
    }

    private AdmissionProcess resolveAdmission(String token) {
        CandidateAccount account = requireAccount();
        if (token != null && !token.isBlank()) {
            AdmissionProcess byToken = admissionProcessRepository
                    .findByPreAdmissionTokenAndStatusNot(token.trim(), StatusEnum.DELETED)
                    .orElseThrow(CandidatePortalException::preAdmissionTokenInvalid);
            if (byToken.getPreAdmissionTokenExpiresAt() != null
                    && byToken.getPreAdmissionTokenExpiresAt().isBefore(OffsetDateTime.now())) {
                throw CandidatePortalException.preAdmissionTokenInvalid();
            }
            if (byToken.getSourceCandidateId() != null
                    && !account.getCandidateId().equals(byToken.getSourceCandidateId())) {
                throw CandidatePortalException.preAdmissionTokenInvalid();
            }
            return byToken;
        }
        return admissionProcessRepository
                .findFirstBySourceCandidateIdAndStatusNotOrderByCreatedAtDesc(
                        account.getCandidateId(), StatusEnum.DELETED)
                .orElseThrow(CandidatePortalException::preAdmissionNotFound);
    }

    private CandidatePortalPreAdmissionViewDto toView(AdmissionProcess admission) {
        JobVacancyApplication application = admission.getSourceApplicationId() == null
                ? null
                : applicationRepository
                        .findByIdAndStatusNot(admission.getSourceApplicationId(), StatusEnum.DELETED)
                        .orElse(null);
        JobVacancy vacancy = resolveVacancy(admission);
        List<StorageObjectLinkResponseDto> links =
                storageService.listByEntityInternal(ENTITY_TYPE, admission.getId());
        List<CandidatePortalPreAdmissionDocumentDto> documents = links.stream()
                .filter(link -> "DOCUMENT".equalsIgnoreCase(link.getLinkRole()))
                .map(link -> CandidatePortalPreAdmissionDocumentDto.builder()
                        .linkId(link.getId())
                        .objectId(link.getStorageObjectId())
                        .documentType(link.getDocumentType())
                        .displayName(link.getDisplayName())
                        .build())
                .toList();

        boolean bankDone = hasText(admission.getBankCode())
                && hasText(admission.getBankAgency())
                && hasText(admission.getBankAccount());
        boolean personalDone = admission.getBirthDate() != null && hasText(admission.getPhone());
        long docsReceived = documents.stream()
                .map(CandidatePortalPreAdmissionDocumentDto::getDocumentType)
                .filter(type -> type != null)
                .map(type -> type.trim().toUpperCase(Locale.ROOT))
                .filter(AdmissionPipelineRules.REQUIRED_DOCUMENT_TYPES::contains)
                .distinct()
                .count();
        boolean docsDone = docsReceived > 0;
        boolean affirmative = vacancy != null && Boolean.TRUE.equals(vacancy.getAffirmativePcd());

        List<CandidatePortalPreAdmissionItemDto> pending = new ArrayList<>();
        pending.add(item("PERSONAL", "Dados pessoais (telefone e data de nascimento)", personalDone, true));
        pending.add(item("BANK", "Dados bancários", bankDone, true));
        pending.add(item("DOCUMENTS", "Documentos (pelo menos um exigido)", docsDone, true));
        if (affirmative) {
            pending.add(item(
                    "PCD",
                    "Autodeclaração PCD (opcional)",
                    admission.getPcdSelfDeclared() != null,
                    false));
        }

        return CandidatePortalPreAdmissionViewDto.builder()
                .admissionProcessId(admission.getId())
                .applicationId(application != null ? application.getId() : admission.getSourceApplicationId())
                .jobTitle(vacancy != null ? vacancy.getJobTitle() : null)
                .fullName(admission.getFullName())
                .email(admission.getEmail())
                .phone(admission.getPhone())
                .birthDate(admission.getBirthDate())
                .cpf(admission.getCpf())
                .bankCode(admission.getBankCode())
                .bankAgency(admission.getBankAgency())
                .bankAccount(admission.getBankAccount())
                .bankAccountDigit(admission.getBankAccountDigit())
                .bankAccountType(admission.getBankAccountType())
                .pixKey(admission.getPixKey())
                .affirmativePcd(affirmative)
                .pcdSelfDeclared(admission.getPcdSelfDeclared())
                .completed(admission.getPreAdmissionCompletedAt() != null)
                .completedAt(admission.getPreAdmissionCompletedAt())
                .linkSentAt(admission.getPreAdmissionLinkSentAt())
                .pendingItems(pending)
                .documents(documents)
                .build();
    }

    private JobVacancy resolveVacancy(AdmissionProcess admission) {
        if (admission.getSourceApplicationId() == null) {
            return null;
        }
        return applicationRepository
                .findByIdAndStatusNot(admission.getSourceApplicationId(), StatusEnum.DELETED)
                .flatMap(app -> jobVacancyRepository.findByIdAndStatusNot(app.getJobVacancyId(), StatusEnum.DELETED))
                .orElse(null);
    }

    private CandidateAccount requireAccount() {
        UUID accountId = CandidatePortalSecurity.requireAccountId();
        return accountRepository
                .findByIdAndStatusNot(accountId, StatusEnum.DELETED)
                .orElseThrow(CandidatePortalException::unauthorized);
    }

    private static CandidatePortalPreAdmissionItemDto item(
            String key, String label, boolean done, boolean required) {
        return CandidatePortalPreAdmissionItemDto.builder()
                .key(key)
                .label(label)
                .done(done)
                .required(required)
                .build();
    }

    private static String normalizeDocumentType(String raw) {
        if (raw == null || raw.isBlank()) {
            return null;
        }
        return raw.trim().toUpperCase(Locale.ROOT);
    }

    private static boolean hasText(String value) {
        return value != null && !value.isBlank();
    }

    private static String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
