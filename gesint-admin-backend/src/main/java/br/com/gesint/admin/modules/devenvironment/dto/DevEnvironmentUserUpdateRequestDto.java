package br.com.gesint.admin.modules.devenvironment.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DevEnvironmentUserUpdateRequestDto {

    @NotBlank
    @Size(max = 150)
    private String fullName;

    @NotBlank
    @Email
    @Size(max = 200)
    private String email;

    /** Opcional: se informado, redefine a senha do admGesint (Admin + espelho public). */
    @Size(min = 8, max = 128)
    private String newPassword;
}
