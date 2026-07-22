package br.com.gommo.modules.rh.person.admissionprocess.kanbancolumn.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.gommo.core.base.controller.BaseController;
import br.com.gommo.modules.rh.person.admissionprocess.kanbancolumn.dto.AdmissionProcessKanbanColumnRequestDto;
import br.com.gommo.modules.rh.person.admissionprocess.kanbancolumn.dto.AdmissionProcessKanbanColumnResponseDto;
import br.com.gommo.modules.rh.person.admissionprocess.kanbancolumn.service.IAdmissionProcessKanbanColumnService;

@RestController
@RequestMapping("/api/v1/admission-process-kanban-columns")
public class AdmissionProcessKanbanColumnController
        extends BaseController<AdmissionProcessKanbanColumnRequestDto, AdmissionProcessKanbanColumnResponseDto> {

    public AdmissionProcessKanbanColumnController(IAdmissionProcessKanbanColumnService service) {
        super(service);
    }
}
