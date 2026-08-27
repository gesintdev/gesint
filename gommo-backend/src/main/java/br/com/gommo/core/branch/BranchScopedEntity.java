package br.com.gommo.core.branch;

import java.util.UUID;

import org.hibernate.annotations.FilterDef;
import org.hibernate.annotations.ParamDef;

import br.com.gommo.core.entity.AuditEntity;
import jakarta.persistence.Column;
import jakarta.persistence.MappedSuperclass;
import jakarta.persistence.PrePersist;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

/**
 * Entidade que pertence a uma filial (estabelecimento). A filial e a propria
 * {@code company}: no Brasil filial e estabelecimento com CNPJ proprio, e folha, ponto,
 * eSocial e FGTS sao todos apurados por estabelecimento.
 *
 * Cadastros estruturais compartilhados pelo cliente inteiro (cargos, escalas, catalogos,
 * perfis, usuarios, parametrizacoes) NAO estendem esta classe.
 *
 * O Hibernate ignora {@code @Filter} declarado em {@code @MappedSuperclass}, entao cada
 * entidade concreta precisa repetir a anotacao:
 *
 * <pre>
 * &#64;Filter(name = BranchScopedEntity.FILTER_NAME, condition = BranchScopedEntity.FILTER_CONDITION)
 * </pre>
 *
 * {@code BranchScopedEntityFilterTest} falha o build se alguma subclasse esquecer.
 */
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@MappedSuperclass
@FilterDef(
        name = BranchScopedEntity.FILTER_NAME,
        parameters = @ParamDef(name = BranchScopedEntity.FILTER_PARAM, type = UUID.class))
public abstract class BranchScopedEntity extends AuditEntity {

    public static final String FILTER_NAME = "branchScope";
    public static final String FILTER_PARAM = "branchId";
    public static final String FILTER_CONDITION = "company_id = :branchId";

    @Column(name = "company_id")
    private UUID companyId;

    /** Escrita sempre nasce na filial ativa, sem depender de o chamador lembrar de preencher. */
    @PrePersist
    void applyActiveBranch() {
        if (companyId == null) {
            BranchContextHolder.getOptional().ifPresent(branchId -> this.companyId = branchId);
        }
    }
}
