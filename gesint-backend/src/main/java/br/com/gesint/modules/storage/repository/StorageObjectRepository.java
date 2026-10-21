package br.com.gesint.modules.storage.repository;

import org.springframework.stereotype.Repository;

import br.com.gesint.core.base.repository.IBaseRepository;
import br.com.gesint.modules.storage.entity.StorageObject;

@Repository
public interface StorageObjectRepository extends IBaseRepository<StorageObject> {}
