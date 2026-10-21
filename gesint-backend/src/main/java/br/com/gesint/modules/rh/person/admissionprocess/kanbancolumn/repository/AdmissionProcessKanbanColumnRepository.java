package br.com.gesint.modules.rh.person.admissionprocess.kanbancolumn.repository;

import java.util.List;

import org.springframework.stereotype.Repository;

import br.com.gesint.core.base.repository.IBaseRepository;
import br.com.gesint.core.entity.StatusEnum;
import br.com.gesint.modules.rh.person.admissionprocess.kanbancolumn.entity.AdmissionProcessKanbanColumn;

@Repository
public interface AdmissionProcessKanbanColumnRepository extends IBaseRepository<AdmissionProcessKanbanColumn> {

    List<AdmissionProcessKanbanColumn> findAllByStatusNotOrderByDisplayOrderAscNameAsc(StatusEnum status);
}
