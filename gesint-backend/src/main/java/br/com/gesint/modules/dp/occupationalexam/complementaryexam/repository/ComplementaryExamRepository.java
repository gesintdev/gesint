package br.com.gesint.modules.dp.occupationalexam.complementaryexam.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Repository;

import br.com.gesint.core.base.repository.IBaseRepository;
import br.com.gesint.core.entity.StatusEnum;
import br.com.gesint.modules.dp.occupationalexam.complementaryexam.entity.ComplementaryExam;

@Repository
public interface ComplementaryExamRepository extends IBaseRepository<ComplementaryExam> {

    List<ComplementaryExam> findByOccupationalExamIdAndStatusNotOrderByCreatedAtAsc(
            UUID occupationalExamId, StatusEnum status);

    List<ComplementaryExam> findByOccupationalExamIdInAndStatusNot(List<UUID> occupationalExamIds, StatusEnum status);
}
