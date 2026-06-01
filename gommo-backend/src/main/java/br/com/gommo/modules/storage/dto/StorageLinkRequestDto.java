package br.com.gommo.modules.storage.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
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
public class StorageLinkRequestDto {

    @NotNull
    private UUID objectId;

    @NotBlank
    @Size(max = 64)
    private String entityType;

    @NotNull
    private UUID entityId;

    @Size(max = 32)
    private String linkRole;

    @Size(max = 255)
    private String displayName;

    @Size(max = 64)
    private String documentType;
}
