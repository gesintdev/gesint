package br.com.gesint.modules.rh.person.exitinterview.returnchecklist.repository;

import java.util.List;

import org.springframework.stereotype.Repository;

import br.com.gesint.core.base.repository.IBaseRepository;
import br.com.gesint.core.entity.StatusEnum;
import br.com.gesint.modules.rh.person.exitinterview.returnchecklist.entity.ExitInterviewReturnChecklistConfig;

@Repository
public interface ExitInterviewReturnChecklistConfigRepository
        extends IBaseRepository<ExitInterviewReturnChecklistConfig> {

    List<ExitInterviewReturnChecklistConfig> findAllByStatusNotOrderByDisplayOrderAscDescriptionAsc(StatusEnum status);
}
