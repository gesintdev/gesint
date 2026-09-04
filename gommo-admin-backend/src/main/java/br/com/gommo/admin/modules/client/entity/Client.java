package br.com.gommo.admin.modules.client.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.util.UUID;

import br.com.gommo.admin.core.entity.AuditEntity;

@Entity
@Table(schema = "admin", name = "client")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class Client extends AuditEntity {

    /** Nome fantasia */
    @Column(nullable = false, length = 255)
    private String name;

    /** Razao social */
    @Column(name = "legal_name", length = 255)
    private String legalName;

    @Column(nullable = false, length = 100)
    private String slug;

    @Column(name = "mobile_login_code", nullable = false, length = 9)
    private String mobileLoginCode;

    /** Company que representa a matriz no schema do tenant. Preenchida no provisionamento. */
    @Column(name = "tenant_company_id")
    private UUID tenantCompanyId;

    @Column(length = 18)
    private String document;

    @Column(length = 200)
    private String street;

    @Column(length = 20)
    private String number;

    @Column(length = 100)
    private String complement;

    @Column(length = 100)
    private String district;

    @Column(length = 100)
    private String city;

    @Column(name = "state_code", length = 2)
    private String stateCode;

    @Column(name = "zip_code", length = 10)
    private String zipCode;

    @Column(columnDefinition = "TEXT")
    private String notes;
}
