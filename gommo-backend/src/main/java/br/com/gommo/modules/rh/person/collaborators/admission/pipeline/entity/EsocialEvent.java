package br.com.gommo.modules.rh.person.collaborators.admission.pipeline.entity;

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

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.hibernate.annotations.Filter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import br.com.gommo.core.branch.BranchScopedEntity;

/**
 * Controle de status e prazo de evento do eSocial. Sem transmissao: a geracao do XML e o consumo do
 * certificado A1 ficam para uma fase posterior. Quando a transmissao for da contabilidade e nao do
 * sistema, o registro continua valendo como confirmacao de envio com numero de recibo.
 *
 * <p>{@code admissionId} e {@code collaboratorId} sao opcionais porque a tabela atende tambem a
 * eventos que nao nascem de uma admissao.
 */
@Entity
@Table(name = "esocial_event")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@Filter(name = BranchScopedEntity.FILTER_NAME, condition = BranchScopedEntity.FILTER_CONDITION)
public class EsocialEvent extends BranchScopedEntity {

    @Column(name = "admission_id")
    private UUID admissionId;

    @Column(name = "collaborator_id")
    private UUID collaboratorId;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "event_type", nullable = false, columnDefinition = "esocial_event_type_enum")
    private EsocialEventTypeEnum eventType;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "event_status", nullable = false, columnDefinition = "esocial_event_status_enum")
    private EsocialEventStatusEnum eventStatus;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Column(name = "transmitted_at")
    private OffsetDateTime transmittedAt;

    @Column(name = "receipt_number", length = 60)
    private String receiptNumber;

    /** Erros devolvidos pelo governo. Vem como codigo; a traducao e responsabilidade da tela. */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "errors", columnDefinition = "jsonb")
    private List<String> errors;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "payload", columnDefinition = "jsonb")
    private Map<String, Object> payload;
}
