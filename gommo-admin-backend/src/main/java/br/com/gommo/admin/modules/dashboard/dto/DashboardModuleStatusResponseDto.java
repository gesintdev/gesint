package br.com.gommo.admin.modules.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardModuleStatusResponseDto {

    private String key;
    private String label;
    private Boolean active;
    private Long records;
}
