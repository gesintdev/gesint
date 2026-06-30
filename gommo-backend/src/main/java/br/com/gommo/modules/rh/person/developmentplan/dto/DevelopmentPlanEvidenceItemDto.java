package br.com.gommo.modules.rh.person.developmentplan.dto;

import lombok.*;

import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DevelopmentPlanEvidenceItemDto {
    private UUID id;
    private UUID evidenceTypeId;
    private String evidenceTypeName;
    private String description;
    private String file;
    private String link;
    private UUID goalId;
    private UUID actionId;
    private LocalDate date;
    private UUID responsibleUserId;
    private String responsibleUserName;
}