package br.com.gommo.modules.rh.person.admissionprocess.kanbancolumn.service;

import br.com.gommo.core.base.service.IBaseService;
import br.com.gommo.modules.rh.person.admissionprocess.kanbancolumn.dto.AdmissionProcessKanbanColumnRequestDto;
import br.com.gommo.modules.rh.person.admissionprocess.kanbancolumn.dto.AdmissionProcessKanbanColumnResponseDto;

public interface IAdmissionProcessKanbanColumnService
        extends IBaseService<AdmissionProcessKanbanColumnRequestDto, AdmissionProcessKanbanColumnResponseDto> {}
