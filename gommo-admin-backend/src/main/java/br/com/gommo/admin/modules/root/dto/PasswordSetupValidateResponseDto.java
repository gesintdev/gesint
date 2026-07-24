package br.com.gommo.admin.modules.root.dto;

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
public class PasswordSetupValidateResponseDto {

    private boolean valid;
    private boolean firstAccessCompleted;
}
