package br.com.gesint.admin.modules.client.dto;

import java.util.List;

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
public class TenantSchemaSyncResultDto {

    private String schema;
    private List<String> createdTables;
    private List<String> addedColumns;
    private List<String> createdIndexes;
    /** Ajustes que exigem decisao humana, como NOT NULL bloqueado por linhas existentes. */
    private List<String> warnings;
}
