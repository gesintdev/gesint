package br.com.gesint.modules.cfg.dataimport.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Repository;

import br.com.gesint.core.base.repository.IBaseRepository;
import br.com.gesint.core.entity.StatusEnum;
import br.com.gesint.modules.cfg.dataimport.entity.DataImportEntityType;
import br.com.gesint.modules.cfg.dataimport.entity.DataImportJob;
import br.com.gesint.modules.cfg.dataimport.entity.DataImportJobStatus;

@Repository
public interface DataImportJobRepository extends IBaseRepository<DataImportJob> {

    Optional<DataImportJob> findByIdAndStatusNot(UUID id, StatusEnum status);

    boolean existsByEntityTypeAndJobStatusInAndStatusNot(
            DataImportEntityType entityType, List<DataImportJobStatus> statuses, StatusEnum status);

    List<DataImportJob> findAllByJobStatusInAndStatusNotOrderByCreatedAtDesc(
            List<DataImportJobStatus> statuses, StatusEnum status);

    List<DataImportJob> findAllByEntityTypeAndStatusNotOrderByCreatedAtDesc(
            DataImportEntityType entityType, StatusEnum status);
}
