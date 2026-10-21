package br.com.gesint.modules.cfg.settings.documenttype.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import br.com.gesint.core.base.repository.IBaseRepository;
import br.com.gesint.core.entity.StatusEnum;
import br.com.gesint.modules.cfg.settings.documenttype.entity.DocumentType;

public interface DocumentTypeRepository extends IBaseRepository<DocumentType> {

    List<DocumentType> findAllByStatusNotOrderBySortOrderAscNameAsc(StatusEnum status);

    Optional<DocumentType> findByTypeCodeIgnoreCaseAndStatusNot(String typeCode, StatusEnum status);

    Optional<DocumentType> findByTypeCodeIgnoreCaseAndStatusNotAndIdNot(
            String typeCode, StatusEnum status, UUID id);
}
