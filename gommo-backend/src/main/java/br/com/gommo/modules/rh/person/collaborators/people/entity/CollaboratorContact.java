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
@Table(name = "collaborator_contact")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class CollaboratorContact extends AuditEntity {

    @Column(name = "collaborator_id", nullable = false)
    private UUID collaboratorId;

    @Column(length = 200)
    private String email;

    @Column(length = 20)
    private String phone;

    @Column(name = "is_primary", nullable = false)
    private boolean primaryContact = true;
}
