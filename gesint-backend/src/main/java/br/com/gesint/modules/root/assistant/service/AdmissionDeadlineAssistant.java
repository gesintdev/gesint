package br.com.gesint.modules.root.assistant.service;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import br.com.gesint.core.entity.StatusEnum;
import br.com.gesint.core.security.AuthorityWildcards;
import br.com.gesint.modules.dp.occupationalexam.exam.entity.OccupationalExam;
import br.com.gesint.modules.dp.occupationalexam.exam.entity.OccupationalExamLifecycleStatusEnum;
import br.com.gesint.modules.dp.occupationalexam.exam.entity.OccupationalExamTypeEnum;
import br.com.gesint.modules.dp.occupationalexam.exam.repository.OccupationalExamRepository;
import br.com.gesint.modules.rh.person.collaborators.admission.entity.AdmissionProcess;
import br.com.gesint.modules.rh.person.collaborators.admission.entity.AdmissionStatusEnum;
import br.com.gesint.modules.rh.person.collaborators.admission.pipeline.domain.AdmissionAsoDeadlineExplanation;
import br.com.gesint.modules.rh.person.collaborators.admission.pipeline.entity.AdmissionStep;
import br.com.gesint.modules.rh.person.collaborators.admission.pipeline.entity.AdmissionStepKeyEnum;
import br.com.gesint.modules.rh.person.collaborators.admission.pipeline.entity.AdmissionStepStatusEnum;
import br.com.gesint.modules.rh.person.collaborators.admission.pipeline.repository.AdmissionStepRepository;
import br.com.gesint.modules.rh.person.collaborators.admission.repository.AdmissionProcessRepository;
import br.com.gesint.modules.root.assistant.dto.AssistantDeepLinkDto;
import br.com.gesint.modules.root.assistant.skill.AssistantSkillResult;
import br.com.gesint.modules.root.search.service.provider.AdmissionGlobalSearchProvider;

/**
 * Responde por que a esteira marca ASO em atraso, sem devolver CPF nem documento.
 */
@Service
public class AdmissionDeadlineAssistant {

    private static final ZoneId BUSINESS_ZONE = ZoneId.of("America/Sao_Paulo");
    private static final Pattern CPF_NUMBER = Pattern.compile("\\b\\d{3}\\.?\\d{3}\\.?\\d{3}-?\\d{2}\\b");
    private static final String ADMISSION_HREF = AdmissionGlobalSearchProvider.HREF;

    private final AdmissionProcessRepository admissionProcessRepository;
    private final OccupationalExamRepository occupationalExamRepository;
    private final AdmissionStepRepository admissionStepRepository;

    public AdmissionDeadlineAssistant(
            AdmissionProcessRepository admissionProcessRepository,
            OccupationalExamRepository occupationalExamRepository,
            AdmissionStepRepository admissionStepRepository) {
        this.admissionProcessRepository = admissionProcessRepository;
        this.occupationalExamRepository = occupationalExamRepository;
        this.admissionStepRepository = admissionStepRepository;
    }

    @Transactional(readOnly = true)
    public AssistantSkillResult explainByDocument(String rawMessage) {
        if (!canReadAdmission()) {
            return text("Sem permissão para consultar a esteira de admissão.", List.of());
        }
        String digits = extractCpfDigits(rawMessage);
        if (digits == null) {
            return text(
                    "Para explicar o prazo de uma pessoa, informe o nome. Não consulto cadastro solto por documento.",
                    List.of());
        }
        AdmissionProcess admission = admissionProcessRepository
                .findByCpfAndStatusNot(digits, StatusEnum.DELETED)
                .orElse(null);
        if (admission == null || admission.getAdmissionStatus() == AdmissionStatusEnum.CANCELLED) {
            return text(
                    "Não encontrei admissão ativa com esse documento nesta empresa. "
                            + "A esteira só mostra processo de admissão em aberto.",
                    List.of(openAdmissionLink("Abrir Admissão")));
        }
        return AssistantSkillResult.builder()
                .success(true)
                .contentForModel(explanationOf(admission))
                .links(List.of(openAdmissionLink(linkLabel(admission))))
                .build();
    }

    @Transactional(readOnly = true)
    public String explanationOf(AdmissionProcess admission) {
        if (admission == null) {
            return "Nenhuma admissão encontrada para explicar o prazo.";
        }
        OccupationalExam exam = admissionalExam(admission);
        boolean skipped = examStepSkipped(admission);
        AdmissionAsoDeadlineExplanation.Snapshot snapshot = new AdmissionAsoDeadlineExplanation.Snapshot(
                displayName(admission),
                admission.getExpectedStartDate(),
                LocalDate.now(BUSINESS_ZONE),
                admission.getManuallyApprovedAt() != null,
                skipped,
                exam != null,
                exam != null ? exam.getScheduledDate() : null,
                exam != null ? exam.getClinicalExamDate() : null,
                exam != null ? exam.getAsoIssueDate() : null,
                exam != null ? exam.getDueDate() : null,
                exam != null ? exam.getResult() : null,
                exam != null ? exam.getLifecycleStatus() : null);
        return AdmissionAsoDeadlineExplanation.explain(snapshot);
    }

    private OccupationalExam admissionalExam(AdmissionProcess admission) {
        if (admission.getCollaboratorId() == null) {
            return null;
        }
        List<OccupationalExam> exams = occupationalExamRepository.findByCollaboratorIdAndExamTypeAndStatusNot(
                admission.getCollaboratorId(), OccupationalExamTypeEnum.ADMISSIONAL, StatusEnum.DELETED);
        OccupationalExam chosen = null;
        for (OccupationalExam exam : exams) {
            if (chosen == null) {
                chosen = exam;
                continue;
            }
            chosen = preferClosedExam(chosen, exam);
        }
        return chosen;
    }

    /** Mesma precedencia da esteira: exame encerrado ganha do apenas previsto. */
    private static OccupationalExam preferClosedExam(OccupationalExam first, OccupationalExam second) {
        boolean firstClosed = isClosedLifecycle(first.getLifecycleStatus());
        boolean secondClosed = isClosedLifecycle(second.getLifecycleStatus());
        if (firstClosed != secondClosed) {
            return firstClosed ? first : second;
        }
        return first;
    }

    private static boolean isClosedLifecycle(OccupationalExamLifecycleStatusEnum lifecycle) {
        return lifecycle == OccupationalExamLifecycleStatusEnum.REGISTRADO
                || lifecycle == OccupationalExamLifecycleStatusEnum.TRANSMITIDO
                || lifecycle == OccupationalExamLifecycleStatusEnum.ARQUIVADO;
    }

    private boolean examStepSkipped(AdmissionProcess admission) {
        if (admission.getId() == null) {
            return false;
        }
        List<AdmissionStep> steps = admissionStepRepository.findActiveByAdmissionIdUnscoped(admission.getId());
        for (AdmissionStep step : steps) {
            if (step.getStepKey() == AdmissionStepKeyEnum.EXAME
                    && step.getStepStatus() == AdmissionStepStatusEnum.SKIPPED) {
                return true;
            }
        }
        return false;
    }

    private static String extractCpfDigits(String rawMessage) {
        if (!StringUtils.hasText(rawMessage)) {
            return null;
        }
        Matcher matcher = CPF_NUMBER.matcher(rawMessage);
        if (!matcher.find()) {
            return null;
        }
        String digits = matcher.group().replaceAll("\\D", "");
        return digits.length() == 11 ? digits : null;
    }

    private static String displayName(AdmissionProcess admission) {
        if (StringUtils.hasText(admission.getSocialName())) {
            return admission.getSocialName().trim();
        }
        return admission.getFullName();
    }

    private static String linkLabel(AdmissionProcess admission) {
        String name = displayName(admission);
        return StringUtils.hasText(name) ? "Abrir Admissão - " + name.trim() : "Abrir Admissão";
    }

    private static AssistantDeepLinkDto openAdmissionLink(String label) {
        return AssistantDeepLinkDto.builder().label(label).href(ADMISSION_HREF).build();
    }

    private boolean canReadAdmission() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null) {
            return false;
        }
        return AuthorityWildcards.allows(authentication.getAuthorities(), "admission:read")
                || AuthorityWildcards.allows(authentication.getAuthorities(), "admission:pipeline");
    }

    private static AssistantSkillResult text(String message, List<AssistantDeepLinkDto> links) {
        return AssistantSkillResult.builder()
                .success(false)
                .contentForModel(message)
                .links(links)
                .build();
    }
}
