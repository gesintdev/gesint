package br.com.gommo.modules.rh.person.developmentplan.dto;

import lombok.*;

import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DevelopmentPlanCheckinItemDto {
    private UUID id;
    private LocalDate date;
    private String participants;
    private String summary;
    private Integer perceivedProgress;
    private String blockers;
    private String nextSteps;
    private Integer collaboratorRating;
    private Integer managerRating;
}