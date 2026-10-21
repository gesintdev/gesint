package br.com.gesint.admin.modules.clientcontact.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.util.UUID;

import br.com.gesint.admin.core.entity.AuditEntity;

@Entity
@Table(schema = "admin", name = "client_contact")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class ClientContact extends AuditEntity {

    @Column(name = "client_id", nullable = false)
    private UUID clientId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private ClientContactType type;

    @Column(nullable = false, length = 200)
    private String value;

    @Column(name = "sort_order", nullable = false)
    @Builder.Default
    private int sortOrder = 0;
}
