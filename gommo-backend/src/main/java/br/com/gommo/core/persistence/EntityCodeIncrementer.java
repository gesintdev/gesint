package br.com.gommo.core.persistence;

import jakarta.persistence.EntityManager;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.Root;

public final class EntityCodeIncrementer {

    private EntityCodeIncrementer() {}

    public static int nextCode(EntityManager entityManager, Class<?> entityClass) {
        CriteriaBuilder cb = entityManager.getCriteriaBuilder();
        var query = cb.createQuery(Integer.class);
        Root<?> root = query.from(entityClass);
        query.select(cb.coalesce(cb.max(root.get("code")), 0));
        Integer max = entityManager.createQuery(query).getSingleResult();
        return max + 1;
    }
}
