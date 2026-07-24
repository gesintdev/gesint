package br.com.gommo.modules.root.dto;

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
public class PasswordSetupRequestDto {

    @NotBlank private String token;

    @NotBlank @Size(min = 8, max = 100) private String password;

    @NotBlank @Size(min = 8, max = 100) private String passwordConfirmation;
}
