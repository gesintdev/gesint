package br.com.gommo.modules.dp.organization.department.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
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

    private String description;

    private BigDecimal monthlyBudget;

    @Size(max = 200) private String location;

    @Size(max = 30) private String phone;

    @Size(max = 30) private String fax;

    @Size(max = 20) private String phoneExtension;

    @Email @Size(max = 120) private String email;

    @Builder.Default
    private List<UUID> responsibleCollaboratorIds = new ArrayList<>();
}
