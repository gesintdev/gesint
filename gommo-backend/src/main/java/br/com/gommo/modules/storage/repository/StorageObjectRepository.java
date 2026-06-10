package br.com.gommo.modules.storage.repository;

import org.springframework.stereotype.Repository;

import br.com.gommo.core.base.repository.IBaseRepository;
import br.com.gommo.modules.storage.entity.StorageObject;

@Repository
public interface StorageObjectRepository extends IBaseRepository<StorageObject> {}
