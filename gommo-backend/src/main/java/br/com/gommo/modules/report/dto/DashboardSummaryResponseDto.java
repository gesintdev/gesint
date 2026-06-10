package br.com.gommo.modules.report.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardSummaryResponseDto {

    private List<DashboardMetricResponseDto> metrics;
    private List<DashboardMovementPointResponseDto> movementLast7Days;
    private DashboardModuleHealthResponseDto moduleHealth;
    private List<DashboardDistributionItemResponseDto> admissionsByStatus;
    private List<DashboardDistributionItemResponseDto> leaveByType;
}
