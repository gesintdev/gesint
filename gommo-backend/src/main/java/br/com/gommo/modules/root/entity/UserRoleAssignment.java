package br.com.gommo.modules.root.entity;

import java.util.UUID;

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

/**
 * Vinculo usuario x perfil x filial.
 *
 * A filial faz parte do vinculo porque o mesmo usuario pode ter acessos diferentes em cada uma:
 * admin de RH numa filial e apenas consulta de ponto em outra.
 *
 * {@code companyId} nulo significa "todas as filiais" e existe para o admin de plataforma e para
 * vinculos criados antes do backfill de filial. E por causa desse nulo que a chave e propria, e
 * nao a trinca: componente nulo em chave composta faz o JPA devolver a entidade como nula.
 */
@Entity
@Table(name = "user_role")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserRoleAssignment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "role_id", nullable = false)
    private UUID roleId;

    @Column(name = "company_id")
    private UUID companyId;
}
