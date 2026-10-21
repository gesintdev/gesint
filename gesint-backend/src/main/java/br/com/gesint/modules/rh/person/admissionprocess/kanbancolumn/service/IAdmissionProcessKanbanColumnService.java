package br.com.gesint.modules.rh.person.admissionprocess.kanbancolumn.service;

import br.com.gesint.core.base.service.IBaseService;
import br.com.gesint.modules.rh.person.admissionprocess.kanbancolumn.dto.AdmissionProcessKanbanColumnRequestDto;
import br.com.gesint.modules.rh.person.admissionprocess.kanbancolumn.dto.AdmissionProcessKanbanColumnResponseDto;

public interface IAdmissionProcessKanbanColumnService
        extends IBaseService<AdmissionProcessKanbanColumnRequestDto, AdmissionProcessKanbanColumnResponseDto> {}
