package br.com.gommo.modules.root.entity;

import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import org.hibernate.envers.Audited;

import br.com.gommo.modules.cfg.access.actingprofile.entity.DataScopeEnum;

/**
 * Vinculo usuario x perfil de atuacao x filial.
 *
 * Espelha {@link UserRoleAssignment}: a filial faz parte do vinculo porque o mesmo usuario
 * pode ter abrangencias diferentes em cada uma.
 *
 * {@code companyId} nulo significa "todas as filiais" (legado/global). A chave e propria
 * porque componente nulo em chave composta faz o JPA devolver a entidade como nula.
 */
@Entity
@Audited
@Table(name = "user_acting_profile")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserActingProfileAssignment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "acting_profile_id", nullable = false)
    private UUID actingProfileId;

    @Column(name = "company_id")
    private UUID companyId;

    /**
     * Override da abrangência do template {@code ActingProfile}.
     * Null = herda o {@code dataScope} do perfil de atuação.
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "data_scope", length = 32)
    private DataScopeEnum dataScope;

    @Column(name = "scope_ref")
    private UUID scopeRef;
}
