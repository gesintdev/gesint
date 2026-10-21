package br.com.gesint.modules.dp.organization.jobpositionsalarytable.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.gesint.core.base.controller.BaseController;
import br.com.gesint.modules.dp.organization.jobpositionsalarytable.dto.JobPositionSalaryTableRequestDto;
import br.com.gesint.modules.dp.organization.jobpositionsalarytable.dto.JobPositionSalaryTableResponseDto;
import br.com.gesint.modules.dp.organization.jobpositionsalarytable.service.IJobPositionSalaryTableService;

@RestController
@RequestMapping("/api/v1/job-position-salary-tables")
public class JobPositionSalaryTableController
        extends BaseController<JobPositionSalaryTableRequestDto, JobPositionSalaryTableResponseDto> {

    private final IJobPositionSalaryTableService salaryTableService;

    public JobPositionSalaryTableController(IJobPositionSalaryTableService service) {
        super(service);
        this.salaryTableService = service;
    }

    @GetMapping("/by-job-position/{jobPositionId}")
    public List<JobPositionSalaryTableResponseDto> byJobPosition(@PathVariable UUID jobPositionId) {
        return salaryTableService.findByJobPositionId(jobPositionId);
    }

    /** Sem tabela vigente: 204 (mesmo padrao de Optional vazio no AuthController). */
    @GetMapping("/by-job-position/{jobPositionId}/current")
    public ResponseEntity<JobPositionSalaryTableResponseDto> currentByJobPosition(
            @PathVariable UUID jobPositionId) {
        return salaryTableService
                .findCurrentByJobPositionId(jobPositionId)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.noContent().build());
    }
}
