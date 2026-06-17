package br.com.gommo.modules.rh.person.collaborators.admission.dto;

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
public class AdmissionEmergencyContactDto {

    @Size(max = 200) private String name;

    @Size(max = 20) private String phone;

    @Size(max = 80) private String relationship;
}
