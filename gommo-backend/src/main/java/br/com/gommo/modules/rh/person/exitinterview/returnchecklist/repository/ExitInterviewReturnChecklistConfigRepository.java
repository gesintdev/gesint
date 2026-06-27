package br.com.gommo.modules.rh.person.exitinterview.returnchecklist.repository;

import java.util.List;

import org.springframework.stereotype.Repository;

import br.com.gommo.core.base.repository.IBaseRepository;
import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.rh.person.exitinterview.returnchecklist.entity.ExitInterviewReturnChecklistConfig;

@Repository
public interface ExitInterviewReturnChecklistConfigRepository
        extends IBaseRepository<ExitInterviewReturnChecklistConfig> {

    List<ExitInterviewReturnChecklistConfig> findAllByStatusNotOrderByDisplayOrderAscDescriptionAsc(StatusEnum status);
}
