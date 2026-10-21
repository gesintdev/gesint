package br.com.gesint.modules.dp.occupationalexam.esocial.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Repository;

import br.com.gesint.core.base.repository.IBaseRepository;
import br.com.gesint.core.entity.StatusEnum;
import br.com.gesint.modules.dp.occupationalexam.esocial.entity.EsocialHealthEvent;
import br.com.gesint.modules.dp.occupationalexam.esocial.entity.EsocialTransmissionStatusEnum;

@Repository
public interface EsocialHealthEventRepository extends IBaseRepository<EsocialHealthEvent> {

    Optional<EsocialHealthEvent> findFirstByOccupationalExamIdAndStatusNotOrderByCreatedAtDesc(
            UUID occupationalExamId, StatusEnum status);

    List<EsocialHealthEvent> findByTransmissionStatusAndStatusNot(
            EsocialTransmissionStatusEnum transmissionStatus, StatusEnum status);
}
