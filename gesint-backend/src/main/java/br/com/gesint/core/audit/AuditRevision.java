package br.com.gesint.core.audit;

import java.time.Instant;
import java.util.UUID;

import org.hibernate.envers.RevisionEntity;
import org.hibernate.envers.RevisionNumber;
import org.hibernate.envers.RevisionTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Revisao do Hibernate Envers: uma linha por transacao que alterou entidade {@code @Audited}.
 * Cada tabela {@code <tabela>_aud} referencia {@code rev} e guarda o estado completo da linha
 * naquela revisao ({@code revtype}: 0 = insert, 1 = update, 2 = delete fisico).
 *
 * Fica no schema do tenant (resolvido pelo {@code search_path}); o id identity garante uma
 * sequence propria por schema quando a tabela e clonada com {@code LIKE ... INCLUDING ALL}.
 */
@Entity
@Table(name = "revinfo")
@RevisionEntity(AuditRevisionListener.class)
@Getter
@Setter
@NoArgsConstructor
public class AuditRevision {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @RevisionNumber
    @Column(name = "rev")
    private Long id;

    @RevisionTimestamp
    @Column(name = "changed_at", nullable = false)
    private Instant changedAt;

    @Column(name = "changed_by")
    private UUID changedBy;
}
