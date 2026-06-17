package br.com.gommo.modules.rh.person.collaborators.people.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.util.UUID;

import br.com.gommo.core.entity.AuditEntity;

@Entity
@Table(name = "collaborator_address")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class CollaboratorAddress extends AuditEntity {

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

    @Column(length = 100)
    private String city;

    @Column(name = "state_code", length = 2)
    private String stateCode;

    @Column(name = "is_primary", nullable = false)
    private boolean primaryAddress = true;
}
