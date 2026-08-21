package br.com.gommo.core.persistence;

import jakarta.persistence.EntityManager;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.Root;

public final class EntityCodeIncrementer {

    /**
     * Serializa a atribuicao de {@code code} por (schema, entidade). Sem o lock, dois inserts
     * concorrentes leem o mesmo MAX(code) e o segundo viola o unique index uk_*_code — o que
     * derrubava /auth/refresh com 500 e encerrava a sessao do usuario.
     */
    private static final String LOCK_SEQUENCE_SQL =
            "SELECT pg_advisory_xact_lock(hashtext(current_schema() || '.' || cast(:entity as text))::bigint) IS NULL";

    private EntityCodeIncrementer() {}

    public static int nextCode(EntityManager entityManager, Class<?> entityClass) {
        lockCodeSequence(entityManager, entityClass);
        CriteriaBuilder cb = entityManager.getCriteriaBuilder();
        var query = cb.createQuery(Integer.class);
        Root<?> root = query.from(entityClass);
        query.select(cb.coalesce(cb.max(root.get("code")), 0));
        Integer max = entityManager.createQuery(query).getSingleResult();
        return max + 1;
    }

    private static void lockCodeSequence(EntityManager entityManager, Class<?> entityClass) {
        entityManager
                .createNativeQuery(LOCK_SEQUENCE_SQL)
                .setParameter("entity", entityClass.getName())
                .getSingleResult();
    }
}
