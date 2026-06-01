package br.com.gommo.admin.modules.adminuser.dto;

import br.com.gommo.admin.core.entity.StatusEnum;
import java.time.OffsetDateTime;
import java.util.UUID;
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
public class AdminUserResponseDto {

    private UUID id;
    private Integer code;
    private StatusEnum status;
    private String username;
    private String email;
    private String fullName;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
