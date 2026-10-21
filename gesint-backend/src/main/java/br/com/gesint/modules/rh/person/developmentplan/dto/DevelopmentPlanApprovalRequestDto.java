package br.com.gesint.modules.rh.person.developmentplan.dto;

import lombok.*;

import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DevelopmentPlanApprovalRequestDto {
    private UUID approvedBy;
}