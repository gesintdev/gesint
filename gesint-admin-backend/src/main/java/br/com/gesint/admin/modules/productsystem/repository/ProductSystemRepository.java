package br.com.gesint.admin.modules.productsystem.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Repository;

import br.com.gesint.admin.core.base.repository.IBaseRepository;
import br.com.gesint.admin.core.entity.StatusEnum;
import br.com.gesint.admin.modules.productsystem.entity.ProductSystem;

@Repository
public interface ProductSystemRepository extends IBaseRepository<ProductSystem> {

    Optional<ProductSystem> findByKeyIgnoreCaseAndStatusNot(String key, StatusEnum status);

    boolean existsByKeyIgnoreCaseAndStatusNotAndIdNot(String key, StatusEnum status, UUID id);

    boolean existsByKeyIgnoreCaseAndStatusNot(String key, StatusEnum status);

    List<ProductSystem> findAllByStatusNotOrderBySortOrderAscNameAsc(StatusEnum status);
}
