package br.com.gesint.modules.dp.occupationalexam.esocial.service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.gesint.core.entity.StatusEnum;
import br.com.gesint.modules.dp.occupationalexam.complementaryexam.entity.ComplementaryExam;
import br.com.gesint.modules.dp.occupationalexam.complementaryexam.repository.ComplementaryExamRepository;
import br.com.gesint.modules.dp.occupationalexam.esocial.entity.EsocialHealthEvent;
import br.com.gesint.modules.dp.occupationalexam.esocial.entity.EsocialTransmissionStatusEnum;
import br.com.gesint.modules.dp.occupationalexam.esocial.repository.EsocialHealthEventRepository;
import br.com.gesint.modules.dp.occupationalexam.exam.entity.OccupationalExam;
import br.com.gesint.modules.dp.occupationalexam.physician.entity.OccupationalPhysician;
import br.com.gesint.modules.dp.occupationalexam.physician.repository.OccupationalPhysicianRepository;

/**
 * Preparacao do evento eSocial S-2220. Nao transmite; apenas persiste PENDING
 * e expoe o mapeamento de payload em memoria ({@link #buildS2220Payload}).
 */
@Service
public class EsocialS2220Service {

    public static final String EVENT_TYPE = "S-2220";
    public static final String DEFAULT_LAYOUT_VERSION = "S-1.3";

    private final EsocialHealthEventRepository repository;
    private final ComplementaryExamRepository complementaryExamRepository;
    private final OccupationalPhysicianRepository physicianRepository;

    public EsocialS2220Service(
            EsocialHealthEventRepository repository,
            ComplementaryExamRepository complementaryExamRepository,
            OccupationalPhysicianRepository physicianRepository) {
        this.repository = repository;
        this.complementaryExamRepository = complementaryExamRepository;
        this.physicianRepository = physicianRepository;
    }

    /**
     * Gera (se ainda nao existir) um evento PENDING ao registrar o ASO.
     * transmission_deadline = dia 15 do mes seguinte a clinical_exam_date.
     */
    @Transactional
    public EsocialHealthEvent ensurePendingEvent(OccupationalExam exam) {
        Optional<EsocialHealthEvent> existing =
                repository.findFirstByOccupationalExamIdAndStatusNotOrderByCreatedAtDesc(
                        exam.getId(), StatusEnum.DELETED);
        if (existing.isPresent()) {
            return existing.get();
        }
        EsocialHealthEvent event = EsocialHealthEvent.builder()
                .status(StatusEnum.ACTIVE)
                .occupationalExamId(exam.getId())
                .eventType(EVENT_TYPE)
                .layoutVersion(DEFAULT_LAYOUT_VERSION)
                .transmissionStatus(EsocialTransmissionStatusEnum.PENDING)
                .transmissionDeadline(calculateTransmissionDeadline(exam.getClinicalExamDate()))
                .build();
        return repository.save(event);
    }

    /**
     * Monta a estrutura S-2220 em memoria a partir do exame e complementares.
     * Nao persiste nem envia — ponto de extensao para transmissao futura.
     */
    @Transactional(readOnly = true)
    public Map<String, Object> buildS2220Payload(OccupationalExam exam) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("evento", EVENT_TYPE);
        payload.put("layoutVersion", DEFAULT_LAYOUT_VERSION);
        payload.put("occupationalExamId", exam.getId() != null ? exam.getId().toString() : null);
        payload.put(
                "collaboratorId",
                exam.getCollaboratorId() != null ? exam.getCollaboratorId().toString() : null);
        payload.put(
                "tpExameOcup", exam.getExamType() != null ? exam.getExamType().getEsocialCode() : null);
        payload.put(
                "dtAso", exam.getAsoIssueDate() != null ? exam.getAsoIssueDate().toString() : null);
        payload.put(
                "dtExameClinico",
                exam.getClinicalExamDate() != null ? exam.getClinicalExamDate().toString() : null);
        payload.put("resAso", exam.getResult() != null ? exam.getResult().name() : null);
        payload.put("cid", exam.getCid());

        if (exam.getExaminerPhysicianId() != null) {
            physicianRepository
                    .findByIdAndStatusNot(exam.getExaminerPhysicianId(), StatusEnum.DELETED)
                    .ifPresent(physician -> payload.put("medico", mapPhysician(physician)));
        }
        if (exam.getCoordinatorPhysicianId() != null) {
            physicianRepository
                    .findByIdAndStatusNot(exam.getCoordinatorPhysicianId(), StatusEnum.DELETED)
                    .ifPresent(physician -> payload.put("coordenadorPcmso", mapPhysician(physician)));
        }

        List<ComplementaryExam> complementaries = exam.getId() == null
                ? List.of()
                : complementaryExamRepository.findByOccupationalExamIdAndStatusNotOrderByCreatedAtAsc(
                        exam.getId(), StatusEnum.DELETED);
        List<Map<String, Object>> exams = new ArrayList<>();
        for (ComplementaryExam complementary : complementaries) {
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("codProc", complementary.getProcedureCode());
            item.put(
                    "dtExm",
                    complementary.getPerformedDate() != null
                            ? complementary.getPerformedDate().toString()
                            : null);
            item.put(
                    "resultado",
                    complementary.getResult() != null
                            ? complementary.getResult().name()
                            : null);
            exams.add(item);
        }
        payload.put("examesComplementares", exams);
        payload.put("transmissionDeadline", calculateTransmissionDeadline(exam.getClinicalExamDate()));
        return payload;
    }

    public static LocalDate calculateTransmissionDeadline(LocalDate clinicalExamDate) {
        if (clinicalExamDate == null) {
            return null;
        }
        LocalDate nextMonth = clinicalExamDate.plusMonths(1);
        return LocalDate.of(nextMonth.getYear(), nextMonth.getMonth(), 15);
    }

    private static Map<String, Object> mapPhysician(OccupationalPhysician physician) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("nome", physician.getFullName());
        map.put("crm", physician.getCrm());
        map.put("uf", physician.getCrmState());
        return map;
    }
}
