package br.com.gesint.modules.cfg.dataimport.importer;

import java.util.UUID;

import org.springframework.stereotype.Component;

import br.com.gesint.core.entity.StatusEnum;
import br.com.gesint.modules.cfg.dataimport.exception.DataImportException;
import br.com.gesint.modules.dp.organization.company.repository.CompanyRepository;
import br.com.gesint.modules.dp.organization.department.repository.DepartmentRepository;
import br.com.gesint.modules.dp.organization.jobposition.repository.JobPositionRepository;
import br.com.gesint.modules.dp.organization.workschedule.repository.WorkScheduleRepository;
import br.com.gesint.modules.rh.person.collaborators.address.repository.CityRepository;
import br.com.gesint.modules.rh.person.collaborators.address.repository.StateRepository;

@Component
public class DataImportLookupHelper {

    private final CompanyRepository companyRepository;
    private final DepartmentRepository departmentRepository;
    private final JobPositionRepository jobPositionRepository;
    private final WorkScheduleRepository workScheduleRepository;
    private final CityRepository cityRepository;
    private final StateRepository stateRepository;

    public DataImportLookupHelper(
            CompanyRepository companyRepository,
            DepartmentRepository departmentRepository,
            JobPositionRepository jobPositionRepository,
            WorkScheduleRepository workScheduleRepository,
            CityRepository cityRepository,
            StateRepository stateRepository) {
        this.companyRepository = companyRepository;
        this.departmentRepository = departmentRepository;
        this.jobPositionRepository = jobPositionRepository;
        this.workScheduleRepository = workScheduleRepository;
        this.cityRepository = cityRepository;
        this.stateRepository = stateRepository;
    }

    public UUID companyIdByCode(Integer code) {
        if (code == null) {
            return null;
        }
        return companyRepository
                .findByCodeAndStatusNot(code, StatusEnum.DELETED)
                .orElseThrow(() -> DataImportException.rowError("Filial nao encontrada: codigo " + code))
                .getId();
    }

    public UUID departmentIdByCode(Integer code) {
        if (code == null) {
            return null;
        }
        return departmentRepository
                .findByCodeAndStatusNot(code, StatusEnum.DELETED)
                .orElseThrow(() -> DataImportException.rowError("Departamento nao encontrado: codigo " + code))
                .getId();
    }

    public UUID jobPositionIdByCode(Integer code) {
        if (code == null) {
            return null;
        }
        return jobPositionRepository
                .findByCodeAndStatusNot(code, StatusEnum.DELETED)
                .orElseThrow(() -> DataImportException.rowError("Cargo nao encontrado: codigo " + code))
                .getId();
    }

    public UUID workScheduleIdByCode(Integer code) {
        if (code == null) {
            return null;
        }
        return workScheduleRepository
                .findByCodeAndStatusNot(code, StatusEnum.DELETED)
                .orElseThrow(() -> DataImportException.rowError("Escala nao encontrada: codigo " + code))
                .getId();
    }

    public UUID cityIdByIbge(Integer ibgeCode) {
        if (ibgeCode == null) {
            return null;
        }
        return cityRepository
                .findByIbgeCode(ibgeCode)
                .orElseThrow(() -> DataImportException.rowError("Cidade IBGE nao encontrada: " + ibgeCode))
                .getId();
    }

    public UUID stateIdByUf(String uf) {
        if (uf == null || uf.isBlank()) {
            return null;
        }
        return stateRepository
                .findByAbbreviationIgnoreCase(uf.trim())
                .orElseThrow(() -> DataImportException.rowError("UF nao encontrada: " + uf))
                .getId();
    }
}
