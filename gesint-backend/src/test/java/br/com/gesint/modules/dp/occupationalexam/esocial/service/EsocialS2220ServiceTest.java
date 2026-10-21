package br.com.gesint.modules.dp.occupationalexam.esocial.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import br.com.gesint.core.entity.StatusEnum;
import br.com.gesint.modules.dp.occupationalexam.complementaryexam.entity.ComplementaryExam;
import br.com.gesint.modules.dp.occupationalexam.complementaryexam.entity.ComplementaryExamResultEnum;
import br.com.gesint.modules.dp.occupationalexam.complementaryexam.repository.ComplementaryExamRepository;
import br.com.gesint.modules.dp.occupationalexam.esocial.repository.EsocialHealthEventRepository;
import br.com.gesint.modules.dp.occupationalexam.exam.entity.OccupationalExam;
import br.com.gesint.modules.dp.occupationalexam.exam.entity.OccupationalExamResultEnum;
import br.com.gesint.modules.dp.occupationalexam.exam.entity.OccupationalExamTypeEnum;
import br.com.gesint.modules.dp.occupationalexam.physician.repository.OccupationalPhysicianRepository;

@ExtendWith(MockitoExtension.class)
class EsocialS2220ServiceTest {

    @Mock
    private EsocialHealthEventRepository repository;

    @Mock
    private ComplementaryExamRepository complementaryExamRepository;

    @Mock
    private OccupationalPhysicianRepository physicianRepository;

    @InjectMocks
    private EsocialS2220Service service;

    @Test
    void transmissionDeadlineIsDay15OfNextMonth() {
        assertThat(EsocialS2220Service.calculateTransmissionDeadline(LocalDate.of(2026, 8, 3)))
                .isEqualTo(LocalDate.of(2026, 9, 15));
        assertThat(EsocialS2220Service.calculateTransmissionDeadline(LocalDate.of(2026, 12, 20)))
                .isEqualTo(LocalDate.of(2027, 1, 15));
    }

    @Test
    void buildS2220PayloadMapsExamAndComplementaries() {
        UUID examId = UUID.randomUUID();
        OccupationalExam exam = OccupationalExam.builder()
                .id(examId)
                .collaboratorId(UUID.randomUUID())
                .examType(OccupationalExamTypeEnum.PERIODICO)
                .clinicalExamDate(LocalDate.of(2026, 8, 3))
                .asoIssueDate(LocalDate.of(2026, 8, 4))
                .result(OccupationalExamResultEnum.FIT)
                .build();
        when(complementaryExamRepository.findByOccupationalExamIdAndStatusNotOrderByCreatedAtAsc(
                        examId, StatusEnum.DELETED))
                .thenReturn(List.of(ComplementaryExam.builder()
                        .procedureCode("01")
                        .performedDate(LocalDate.of(2026, 8, 2))
                        .result(ComplementaryExamResultEnum.NORMAL)
                        .build()));

        Map<String, Object> payload = service.buildS2220Payload(exam);

        assertThat(payload.get("evento")).isEqualTo("S-2220");
        assertThat(payload.get("layoutVersion")).isEqualTo("S-1.3");
        assertThat(payload.get("tpExameOcup")).isEqualTo(1);
        assertThat(payload.get("resAso")).isEqualTo("FIT");
        assertThat(payload.get("transmissionDeadline")).isEqualTo(LocalDate.of(2026, 9, 15));
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> exams = (List<Map<String, Object>>) payload.get("examesComplementares");
        assertThat(exams).hasSize(1);
        assertThat(exams.getFirst().get("codProc")).isEqualTo("01");
    }
}
