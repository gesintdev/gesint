package br.com.gommo.admin.modules.integration.entity;

import br.com.gommo.admin.core.entity.CodedEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(schema = "public", name = "permission")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PublicPermission implements CodedEntity {

    @Id
    private UUID id;

    @Column(nullable = false, updatable = false, unique = true)
    private Integer code;

    @Column(nullable = false, unique = true, length = 100)
    private String authority;
}
