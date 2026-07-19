package br.com.gommo.admin.modules.client.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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

    @Column(length = 18)
    private String document;

    @Column(columnDefinition = "TEXT")
    private String address;

    @Column(name = "contact_email", length = 200)
    private String contactEmail;

    @Column(name = "contact_phone", length = 120)
    private String contactPhone;

    @Column(columnDefinition = "TEXT")
    private String notes;
}
