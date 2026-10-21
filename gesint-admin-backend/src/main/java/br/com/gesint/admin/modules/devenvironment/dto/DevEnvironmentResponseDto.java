package br.com.gesint.admin.modules.devenvironment.dto;

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
public class DevEnvironmentResponseDto {

    private boolean enabled;
    private String username;
    private String fullName;
    private String email;
    private boolean publicAppUserMirrored;
}
