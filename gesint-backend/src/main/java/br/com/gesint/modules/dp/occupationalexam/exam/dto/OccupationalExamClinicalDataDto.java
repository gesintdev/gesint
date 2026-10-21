package br.com.gesint.modules.dp.occupationalexam.exam.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

import br.com.gesint.modules.dp.occupationalexam.complementaryexam.dto.ComplementaryExamResponseDto;

/**
 * Dados clinicos sensíveis (LGPD). So devem ser montados pelo service quando o
 * usuario autenticado possui a autoridade {@code occupationalexam:clinical}.
 */
@Getter
@Builder
public class OccupationalExamClinicalDataDto {
    private final String cid;
    private final String clinicalObservations;
    private final List<ComplementaryExamResponseDto> complementaryExams;
}
