package br.com.gommo.core.base.repository;

import jakarta.persistence.EntityManager;

import java.io.Serializable;

import org.springframework.data.jpa.repository.support.JpaEntityInformation;
import org.springframework.data.jpa.repository.support.SimpleJpaRepository;

import br.com.gommo.core.entity.CodedEntity;
import br.com.gommo.core.persistence.EntityCodeIncrementer;

public class BaseRepositoryImpl<T, ID extends Serializable> extends SimpleJpaRepository<T, ID> {

    private final JpaEntityInformation<T, ?> entityInfo;
    private final EntityManager entityManager;

    public BaseRepositoryImpl(JpaEntityInformation<T, ?> entityInformation, EntityManager entityManager) {
        super(entityInformation, entityManager);
        this.entityInfo = entityInformation;
        this.entityManager = entityManager;
    }

    @Override
    public <S extends T> S save(S entity) {
        assignCodeIfNew(entity);
        return super.save(entity);
    }

    @Override
    public <S extends T> S saveAndFlush(S entity) {
        assignCodeIfNew(entity);
        return super.saveAndFlush(entity);
    }

    @SuppressWarnings("unchecked")
    private void assignCodeIfNew(Object entity) {
        if (!(entity instanceof CodedEntity coded) || coded.getCode() != null) {
            return;
        }
        if (!entityInfo.isNew((T) entity)) {
            return;
        }
        coded.setCode(EntityCodeIncrementer.nextCode(entityManager, entity.getClass()));
    }
}
