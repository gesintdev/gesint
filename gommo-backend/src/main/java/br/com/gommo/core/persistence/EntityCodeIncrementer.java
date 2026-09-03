package br.com.gommo.core.persistence;

import jakarta.persistence.EntityManager;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.Root;

import org.hibernate.Session;

import br.com.gommo.core.branch.BranchCatalogEntity;
import br.com.gommo.core.branch.BranchContextHolder;
import br.com.gommo.core.branch.BranchScopedEntity;

public final class EntityCodeIncrementer {

    /**
     * Serializa a atribuicao de {@code code} por (schema, entidade). Sem o lock, dois inserts
     * concorrentes leem o mesmo MAX(code) e o segundo viola o unique index uk_*_code — o que
     * derrubava /auth/refresh com 500 e encerrava a sessao do usuario.
     *
     * <p>{@code code} e unico na tabela inteira; o MAX precisa ignorar filtros Hibernate de filial,
     * senao linhas fora do escopo ativo somem do calculo e o insert duplica codigo (500).
     */
    private static final String LOCK_SEQUENCE_SQL =
            "SELECT pg_advisory_xact_lock(hashtext(current_schema() || '.' || cast(:entity as text))::bigint) IS NULL";

    private EntityCodeIncrementer() {}

    public static int nextCode(EntityManager entityManager, Class<?> entityClass) {
        lockCodeSequence(entityManager, entityClass);
        Session session = entityManager.unwrap(Session.class);
        FilterSnapshot filters = FilterSnapshot.capture(session);
        filters.disable(session);
        try {
            CriteriaBuilder cb = entityManager.getCriteriaBuilder();
            var query = cb.createQuery(Integer.class);
            Root<?> root = query.from(entityClass);
            query.select(cb.coalesce(cb.max(root.get("code")), 0));
            Integer max = entityManager.createQuery(query).getSingleResult();
            return max + 1;
        } finally {
            filters.restore(session);
        }
    }

    private record FilterSnapshot(java.util.UUID branchId, boolean branchScoped, boolean branchCatalog) {
        static FilterSnapshot capture(Session session) {
            java.util.UUID branchId = BranchContextHolder.getOptional().orElse(null);
            return new FilterSnapshot(
                    branchId,
                    session.getEnabledFilter(BranchScopedEntity.FILTER_NAME) != null,
                    session.getEnabledFilter(BranchCatalogEntity.FILTER_NAME) != null);
        }

        void disable(Session session) {
            if (branchScoped) {
                session.disableFilter(BranchScopedEntity.FILTER_NAME);
            }
            if (branchCatalog) {
                session.disableFilter(BranchCatalogEntity.FILTER_NAME);
            }
        }

        void restore(Session session) {
            if (branchId == null) {
                return;
            }
            if (branchScoped) {
                session.enableFilter(BranchScopedEntity.FILTER_NAME)
                        .setParameter(BranchScopedEntity.FILTER_PARAM, branchId);
            }
            if (branchCatalog) {
                session.enableFilter(BranchCatalogEntity.FILTER_NAME)
                        .setParameter(BranchCatalogEntity.FILTER_PARAM, branchId);
            }
        }
    }

    private static void lockCodeSequence(EntityManager entityManager, Class<?> entityClass) {
        entityManager
                .createNativeQuery(LOCK_SEQUENCE_SQL)
                .setParameter("entity", entityClass.getName())
                .getSingleResult();
    }
}
