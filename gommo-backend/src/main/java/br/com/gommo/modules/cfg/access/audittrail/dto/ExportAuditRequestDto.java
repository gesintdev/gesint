package br.com.gommo.modules.cfg.access.audittrail.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
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
public class ExportAuditRequestDto {

    /** Authority exigida para a exportação (ex.: leave:export). */
    @NotBlank
    @Size(max = 100)
    private String exportPermission;

    @NotBlank
    @Size(max = 200)
    private String fileName;

    @Size(max = 200)
    private String moduleLabel;

    private Integer rowCount;
}
