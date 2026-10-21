package br.com.gesint.modules.root.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PermissionSummaryDto {

    private UUID id;
    private Integer code;
    private String authority;
    private String module;
    private String description;
}
