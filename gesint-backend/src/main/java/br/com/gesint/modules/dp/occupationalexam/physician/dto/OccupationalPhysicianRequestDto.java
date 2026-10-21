package br.com.gesint.modules.dp.occupationalexam.physician.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import br.com.gesint.modules.dp.occupationalexam.physician.entity.OccupationalPhysicianRoleEnum;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OccupationalPhysicianRequestDto {

    @NotBlank @Size(max = 180) private String fullName;

    @NotBlank @Size(max = 20) private String crm;

    @NotBlank @Size(min = 2, max = 2) private String crmState;

    @NotNull private OccupationalPhysicianRoleEnum role;

    @Builder.Default
    private List<UUID> clinicIds = new ArrayList<>();

    @Size(max = 30) private String phone;

    @Size(max = 150) private String email;
}
