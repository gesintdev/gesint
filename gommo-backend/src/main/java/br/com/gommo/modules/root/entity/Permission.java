package br.com.gommo.modules.root.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

import br.com.gommo.core.entity.CodedEntity;

@Entity
@Table(name = "permission")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Permission implements CodedEntity {

    @Id
    private UUID id;

    @Column(nullable = false, updatable = false, unique = true)
    private Integer code;

    @Column(nullable = false, unique = true, length = 100)
    private String authority;

    @Column(nullable = false, length = 50)
    private String module;

    private String description;
}
