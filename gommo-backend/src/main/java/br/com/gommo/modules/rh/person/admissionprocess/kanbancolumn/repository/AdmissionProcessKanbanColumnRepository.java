package br.com.gommo.modules.rh.person.admissionprocess.kanbancolumn.repository;

import java.util.List;

import org.springframework.stereotype.Repository;

import br.com.gommo.core.base.repository.IBaseRepository;
import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.rh.person.admissionprocess.kanbancolumn.entity.AdmissionProcessKanbanColumn;

@Repository
public interface AdmissionProcessKanbanColumnRepository extends IBaseRepository<AdmissionProcessKanbanColumn> {

    List<AdmissionProcessKanbanColumn> findAllByStatusNotOrderByDisplayOrderAscNameAsc(StatusEnum status);
}
