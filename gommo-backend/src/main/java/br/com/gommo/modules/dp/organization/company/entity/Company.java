package br.com.gommo.modules.dp.organization.company.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import br.com.gommo.core.entity.AuditEntity;

@Entity
@Table(name = "company")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class Company extends AuditEntity {

    @Column(name = "legal_name", nullable = false, length = 255)
    private String legalName;

    @Column(name = "trade_name", length = 255)
    private String tradeName;

    @Column(nullable = false, length = 18)
    private String cnpj;

    @Column(name = "state_registration", length = 32)
    private String stateRegistration;

    @Column(name = "municipal_registration", length = 32)
    private String municipalRegistration;

    @Column(length = 200)
    private String email;

    @Column(length = 20)
    private String phone;

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

    @Column(name = "tax_regime", length = 60)
    private String taxRegime;

    @Column(name = "accountant_name", length = 200)
    private String accountantName;

    @Column(name = "accountant_email", length = 200)
    private String accountantEmail;
}
