package br.com.gesint.modules.cfg.dataimport.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.time.OffsetDateTime;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.envers.Audited;
import org.hibernate.type.SqlTypes;

import br.com.gesint.core.entity.AuditEntity;

@Entity
@Audited
@Table(name = "data_import_job")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class DataImportJob extends AuditEntity {

    @Enumerated(EnumType.STRING)
    @Column(name = "entity_type", nullable = false, length = 40)
    private DataImportEntityType entityType;

    @Enumerated(EnumType.STRING)
    @Column(name = "import_mode", nullable = false, length = 20)
    private DataImportMode importMode;

    @Enumerated(EnumType.STRING)
    @Column(name = "job_status", nullable = false, length = 20)
    private DataImportJobStatus jobStatus;

    @Column(name = "source_file_name", length = 500)
    private String sourceFileName;

    @Column(name = "total_rows", nullable = false)
    private Integer totalRows;

    @Column(name = "processed_rows", nullable = false)
    private Integer processedRows;

    @Column(name = "success_count", nullable = false)
    private Integer successCount;

    @Column(name = "error_count", nullable = false)
    private Integer errorCount;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "errors_json", columnDefinition = "jsonb")
    private String errorsJson;

    @Column(name = "started_at")
    private OffsetDateTime startedAt;

    @Column(name = "finished_at")
    private OffsetDateTime finishedAt;
}
