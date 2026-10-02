package br.com.gommo.admin.modules.platformemail.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import br.com.gommo.admin.modules.platformemail.entity.PlatformEmailSecurityEnum;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PlatformEmailSettingsRequestDto {

    private boolean enabled;

    @Size(max = 200)
    private String host;

    @Min(1)
    @Max(65535)
    private Integer port;

    private PlatformEmailSecurityEnum security;

    @Size(max = 200)
    private String username;

    /** Vazio mantem a senha atual. */
    @Size(max = 200)
    private String password;

    private boolean clearPassword;

    @Size(max = 200)
    private String fromAddress;

    @Size(max = 120)
    private String fromName;

    @Size(max = 200)
    private String replyTo;
}
