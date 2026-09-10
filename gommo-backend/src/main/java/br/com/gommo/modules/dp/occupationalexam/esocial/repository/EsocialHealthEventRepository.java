package br.com.gommo.modules.dp.occupationalexam.esocial.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Repository;

import br.com.gommo.core.base.repository.IBaseRepository;
import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.dp.occupationalexam.esocial.entity.EsocialHealthEvent;
import br.com.gommo.modules.dp.occupationalexam.esocial.entity.EsocialTransmissionStatusEnum;

@Repository
public interface EsocialHealthEventRepository extends IBaseRepository<EsocialHealthEvent> {

    Optional<EsocialHealthEvent> findFirstByOccupationalExamIdAndStatusNotOrderByCreatedAtDesc(
            UUID occupationalExamId, StatusEnum status);

    List<EsocialHealthEvent> findByTransmissionStatusAndStatusNot(
            EsocialTransmissionStatusEnum transmissionStatus, StatusEnum status);
}
