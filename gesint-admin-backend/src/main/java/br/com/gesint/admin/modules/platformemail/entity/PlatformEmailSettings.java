package br.com.gesint.admin.modules.platformemail.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.time.OffsetDateTime;

import br.com.gesint.admin.core.entity.AuditEntity;

@Entity
@Table(schema = "admin", name = "platform_email_settings")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class PlatformEmailSettings extends AuditEntity {

    @Column(nullable = false)
    private boolean enabled;

    @Column(length = 200)
    private String host;

    @Column
    private Integer port;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private PlatformEmailSecurityEnum security;

    @Column(length = 200)
    private String username;

    @Column(name = "password_encrypted")
    private byte[] passwordEncrypted;

    @Column(name = "from_address", length = 200)
    private String fromAddress;

    @Column(name = "from_name", length = 120)
    private String fromName;

    @Column(name = "reply_to", length = 200)
    private String replyTo;

    @Column(name = "last_test_at")
    private OffsetDateTime lastTestAt;

    @Column(name = "last_test_success")
    private Boolean lastTestSuccess;

    @Column(name = "last_test_message", length = 500)
    private String lastTestMessage;
}
