package br.com.gommo.modules.rh.person.occupationalexam.complementaryexam.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Repository;

import br.com.gommo.core.base.repository.IBaseRepository;
import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.rh.person.occupationalexam.complementaryexam.entity.ComplementaryExam;

@Repository
public interface ComplementaryExamRepository extends IBaseRepository<ComplementaryExam> {

    List<ComplementaryExam> findByOccupationalExamIdAndStatusNotOrderByCreatedAtAsc(
            UUID occupationalExamId, StatusEnum status);

    List<ComplementaryExam> findByOccupationalExamIdInAndStatusNot(List<UUID> occupationalExamIds, StatusEnum status);
}
