package br.com.gommo.admin.modules.client.entity;

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

import br.com.gommo.admin.core.entity.AuditEntity;

@Entity
@Table(schema = "admin", name = "client")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class Client extends AuditEntity {

    @Column(nullable = false, length = 255)
    private String name;

    @Column(nullable = false, length = 100)
    private String slug;

    @Column(name = "mobile_login_code", nullable = false, length = 9)
    private String mobileLoginCode;

    @Column(length = 18)
    private String document;

    @Column(name = "contact_email", length = 200)
    private String contactEmail;

    @Column(name = "contact_phone", length = 20)
    private String contactPhone;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Enumerated(EnumType.STRING)
    @Column(name = "routing_mode", nullable = false, length = 32)
    private TenantRoutingModeEnum routingMode;

    @Column(name = "subdomain", length = 100)
    private String subdomain;

    @Column(name = "custom_domain", length = 200)
    private String customDomain;

    @Enumerated(EnumType.STRING)
    @Column(name = "database_strategy", nullable = false, length = 32)
    private TenantDatabaseStrategyEnum databaseStrategy;

    @Column(name = "database_host", length = 200)
    private String databaseHost;

    @Column(name = "database_port")
    private Integer databasePort;

    @Column(name = "database_name", length = 100)
    private String databaseName;

    @Column(name = "database_schema", length = 100)
    private String databaseSchema;

    @Column(name = "database_user", length = 150)
    private String databaseUser;

    @Column(name = "database_secret_ref", length = 255)
    private String databaseSecretRef;

    @Enumerated(EnumType.STRING)
    @Column(name = "provisioning_status", nullable = false, length = 32)
    private TenantProvisioningStatusEnum provisioningStatus;

    @Column(name = "provisioning_notes", columnDefinition = "TEXT")
    private String provisioningNotes;
}
