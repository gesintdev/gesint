package br.com.gesint.admin.modules.assistanterrorlog.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(schema = "admin", name = "assistant_error_log")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssistantErrorLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "client_id")
    private UUID clientId;

    @Column(name = "client_name", length = 200)
    private String clientName;

    @Column(name = "user_id")
    private UUID userId;

    @Column(name = "user_name", length = 200)
    private String userName;

    @Column(name = "user_email", length = 200)
    private String userEmail;

    @Column(name = "tenant_schema", length = 100)
    private String tenantSchema;

    @Column(nullable = false, length = 500)
    private String summary;

    @Column(name = "error_class", length = 200)
    private String errorClass;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;
}
