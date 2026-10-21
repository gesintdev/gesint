package br.com.gesint.modules.dp.offboarding.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OffboardingDemissionalPreviewDto {
    private boolean waived;
    private boolean required;
    private String message;
    private LocalDate lastClinicalExamDate;
    private Integer daysSinceLastExam;
    private Integer riskGrade;
    private Integer waiverWindowDays;
    private LocalDate dueDate;
    private boolean waiverRegistered;
    private String waiverNotes;
}
