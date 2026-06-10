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
public class DashboardModuleHealthResponseDto {

    private Integer activeModules;
    private Integer totalModules;
    private Integer progressPercent;
    private List<DashboardModuleStatusResponseDto> modules;
}
