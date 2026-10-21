package br.com.gesint.admin.modules.clientbranch.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.time.OffsetDateTime;
import java.util.UUID;

import br.com.gesint.admin.core.entity.AuditEntity;

/**
 * Filial do cliente no control plane, sempre uma filha da matriz.
 *
 * A matriz nao vive aqui: ela e o proprio cadastro do cliente em Dados Basicos, de onde saem razao
 * social, CNPJ e endereco. Esta tabela guarda apenas os demais estabelecimentos, e por isso um
 * cliente sem nenhuma linha aqui opera com um estabelecimento unico.
 *
 * A filial operacional e a {@code company} dentro do schema do tenant; {@code tenantCompanyId}
 * guarda o vinculo com a linha ja criada la.
 */
@Entity
@Table(schema = "admin", name = "client_branch")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class ClientBranch extends AuditEntity {

    @Column(name = "client_id", nullable = false)
    private UUID clientId;

    @Column(name = "tenant_company_id")
    private UUID tenantCompanyId;

    @Column(name = "sort_order", nullable = false)
    @Builder.Default
    private int sortOrder = 0;

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

    @Column(name = "provisioned_at")
    private OffsetDateTime provisionedAt;
}
