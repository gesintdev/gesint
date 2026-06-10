package br.com.gommo.admin.modules.integration.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

import br.com.gommo.admin.core.entity.CodedEntity;

@Entity
@Table(schema = "public", name = "role")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PublicRole implements CodedEntity {

    @Id
    private UUID id;

    @Column(nullable = false, updatable = false, unique = true)
    private Integer code;

    @Column(nullable = false, unique = true, length = 50)
    private String name;
}
