package br.com.gommo.modules.rh.person.jobvacancyapplication.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobVacancyApplicationHireResponseDto {

    private UUID applicationId;
    private UUID admissionProcessId;
    private Integer admissionCode;
    private String candidateFullName;

    @Builder.Default
    private List<UUID> closedApplicationIds = new ArrayList<>();

    private String rehireWarning;
}
