package br.com.gommo.modules.organization.department.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DepartmentRequestDto {

    private UUID companyId;
    private UUID parentId;

    @NotBlank @Size(max = 120) private String name;

    @Size(max = 40) private String costCenter;
}
