package br.com.gommo.modules.rh.person.collaborators.people.entity;

import org.hibernate.annotations.Filter;
import org.hibernate.envers.Audited;
import org.hibernate.envers.RelationTargetAuditMode;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.util.UUID;

import br.com.gommo.core.branch.BranchScopedEntity;
import br.com.gommo.modules.rh.person.collaborators.address.entity.City;
import br.com.gommo.modules.rh.person.collaborators.address.entity.State;

@Entity
@Audited
@Table(name = "collaborator_address")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@Filter(name = BranchScopedEntity.FILTER_NAME, condition = BranchScopedEntity.FILTER_CONDITION)
public class CollaboratorAddress extends BranchScopedEntity {

    @Column(name = "collaborator_id", nullable = false)
    private UUID collaboratorId;

    @Column(name = "zip_code", length = 10)
    private String zipCode;

    @Column(length = 200)
    private String street;

    @Column(length = 20)
    private String number;

    @Column(length = 100)
    private String complement;

    @Column(length = 100)
    private String district;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "city_id")
    @Audited(targetAuditMode = RelationTargetAuditMode.NOT_AUDITED)
    private City city;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "state_id")
    @Audited(targetAuditMode = RelationTargetAuditMode.NOT_AUDITED)
    private State state;

    @Column(name = "is_primary", nullable = false)
    private boolean primaryAddress = true;
}
