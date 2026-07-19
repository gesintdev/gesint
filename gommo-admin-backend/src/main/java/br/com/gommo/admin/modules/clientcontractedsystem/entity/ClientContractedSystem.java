package br.com.gommo.admin.modules.clientcontractedsystem.entity;

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

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

import br.com.gommo.admin.core.entity.AuditEntity;

@Entity
@Table(schema = "admin", name = "client_contracted_system")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class ClientContractedSystem extends AuditEntity {

    @Column(name = "client_id", nullable = false)
    private UUID clientId;

    @Column(name = "product_system_id", nullable = false)
    private UUID productSystemId;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(name = "module_name", length = 150)
    private String moduleName;

    @Enumerated(EnumType.STRING)
    @Column(name = "operational_status", nullable = false, length = 32)
    private OperationalStatusEnum operationalStatus;

    @Column(name = "status_date")
    private LocalDate statusDate;

    @Column(name = "return_date")
    private LocalDate returnDate;

    @Column(name = "negotiated_amount", precision = 12, scale = 2)
    private BigDecimal negotiatedAmount;

    @Column(name = "discount_percent", precision = 5, scale = 2)
    private BigDecimal discountPercent;

    @Column(name = "agreed_amount", precision = 12, scale = 2)
    private BigDecimal agreedAmount;

    @Enumerated(EnumType.STRING)
    @Column(name = "contract_type", length = 32)
    private ContractTypeEnum contractType;

    @Column(name = "contract_date")
    private LocalDate contractDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "due_day", length = 2)
    private String dueDay;

    @Column(name = "late_tolerance", length = 50)
    private String lateTolerance;

    @Column(name = "with_ai", nullable = false)
    private boolean withAi;

    @Column(name = "effective_from")
    private OffsetDateTime effectiveFrom;

    @Column(name = "deactivate_at")
    private OffsetDateTime deactivateAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "session_policy", nullable = false, length = 32)
    private SessionPolicyEnum sessionPolicy;

    @Column(columnDefinition = "TEXT")
    private String notes;
}
