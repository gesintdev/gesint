package br.com.gommo.admin.modules.clientuser.entity;

import br.com.gommo.admin.core.entity.AuditEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Entity
@Table(schema = "admin", name = "client_user")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class ClientUser extends AuditEntity {

    @Column(name = "client_id", nullable = false)
    private UUID clientId;

    @Column(name = "app_user_id", nullable = false)
    private UUID appUserId;

    @Column(name = "display_name", length = 200)
    private String displayName;
}
