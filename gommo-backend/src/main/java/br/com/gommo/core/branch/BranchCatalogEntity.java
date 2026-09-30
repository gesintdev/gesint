package br.com.gommo.core.branch;

import java.util.UUID;

import org.hibernate.annotations.FilterDef;
import org.hibernate.annotations.ParamDef;
import org.hibernate.envers.Audited;

import br.com.gommo.core.entity.AuditEntity;
import jakarta.persistence.Column;
import jakarta.persistence.MappedSuperclass;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

/**
 * Cadastros estruturais que podem valer em todas as filiais ({@code company_id} nulo) ou apenas na
 * filial em que foram criados. Ex.: departamento e cargo.
 *
 * Diferente de {@link BranchScopedEntity}, nao preenche {@code company_id} automaticamente: o
 * servico define o escopo a partir da escolha do usuario.
 */
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@MappedSuperclass
@Audited
@FilterDef(
        name = BranchCatalogEntity.FILTER_NAME,
        parameters = @ParamDef(name = BranchCatalogEntity.FILTER_PARAM, type = UUID.class))
public abstract class BranchCatalogEntity extends AuditEntity {

    public static final String FILTER_NAME = "branchCatalogScope";
    public static final String FILTER_PARAM = "branchId";
    public static final String FILTER_CONDITION = "(company_id IS NULL OR company_id = :branchId)";

    @Column(name = "company_id")
    private UUID companyId;
}
