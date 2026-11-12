package br.com.gesint.modules.cfg.dataimport.importer;

import java.util.Map;

import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import br.com.gesint.core.entity.StatusEnum;
import br.com.gesint.modules.cfg.dataimport.entity.DataImportEntityType;
import br.com.gesint.modules.cfg.dataimport.entity.DataImportMode;
import br.com.gesint.modules.cfg.dataimport.excel.ExcelValueParser;
import br.com.gesint.modules.cfg.dataimport.exception.DataImportException;
import br.com.gesint.modules.rh.person.collaborators.admission.dto.AdmissionProcessRequestDto;
import br.com.gesint.modules.rh.person.collaborators.admission.dto.AdmissionProcessResponseDto;
import br.com.gesint.modules.rh.person.collaborators.admission.entity.AdmissionProcess;
import br.com.gesint.modules.rh.person.collaborators.admission.repository.AdmissionProcessRepository;
import br.com.gesint.modules.rh.person.collaborators.admission.service.IAdmissionProcessService;
import br.com.gesint.modules.rh.person.collaborators.people.entity.GenderEnum;
import br.com.gesint.modules.rh.person.collaborators.people.entity.MaritalStatusEnum;
import br.com.gesint.modules.rh.person.contract.entity.ContractTypeEnum;

@Component
public class AdmissionDataImporter implements DataImporter {

    private final IAdmissionProcessService admissionProcessService;
    private final AdmissionProcessRepository admissionProcessRepository;
    private final DataImportLookupHelper lookupHelper;

    public AdmissionDataImporter(
            IAdmissionProcessService admissionProcessService,
            AdmissionProcessRepository admissionProcessRepository,
            DataImportLookupHelper lookupHelper) {
        this.admissionProcessService = admissionProcessService;
        this.admissionProcessRepository = admissionProcessRepository;
        this.lookupHelper = lookupHelper;
    }

    @Override
    public DataImportEntityType entityType() {
        return DataImportEntityType.ADMISSION;
    }

    @Override
    public String importRow(DataImportMode mode, Map<String, String> row) {
        AdmissionProcessRequestDto request = toRequest(row, mode);
        if (mode == DataImportMode.INSERT) {
            AdmissionProcessResponseDto created = admissionProcessService.create(request);
            return matchKey(created.getCpf(), created.getProviderCnpj());
        }
        AdmissionProcess existingEntity = resolveForUpdate(row);
        AdmissionProcessResponseDto existing = admissionProcessService.findById(existingEntity.getId());
        mergeForUpdate(request, existing);
        admissionProcessService.update(existingEntity.getId(), request);
        return matchKey(existing.getCpf(), existing.getProviderCnpj());
    }

    private AdmissionProcess resolveForUpdate(Map<String, String> row) {
        String cpf = ExcelValueParser.digits(row, "cpf");
        String cnpj = ExcelValueParser.digits(row, "provider_cnpj");
        if (StringUtils.hasText(cpf)) {
            return admissionProcessRepository
                    .findByCpfAndStatusNot(cpf, StatusEnum.DELETED)
                    .orElseThrow(() -> DataImportException.rowError("Admissao nao encontrada para CPF: " + cpf));
        }
        if (StringUtils.hasText(cnpj)) {
            return admissionProcessRepository
                    .findByProviderCnpjAndStatusNot(cnpj, StatusEnum.DELETED)
                    .orElseThrow(() -> DataImportException.rowError("Admissao nao encontrada para CNPJ: " + cnpj));
        }
        throw DataImportException.rowError("Informe cpf e/ou provider_cnpj para correção.");
    }

    private AdmissionProcessRequestDto toRequest(Map<String, String> row, DataImportMode mode) {
        Integer companyCode = ExcelValueParser.integer(row, "codigo_filial");
        Integer departmentCode = ExcelValueParser.integer(row, "codigo_departamento");
        Integer jobPositionCode = ExcelValueParser.integer(row, "codigo_cargo");
        Integer scheduleCode = ExcelValueParser.integer(row, "codigo_escala");
        Integer cityIbge = ExcelValueParser.integer(row, "cidade_ibge");
        String uf = ExcelValueParser.text(row, "uf");

        String cpf = ExcelValueParser.digits(row, "cpf");
        if (mode == DataImportMode.INSERT && !StringUtils.hasText(cpf)) {
            throw DataImportException.rowError("Campo obrigatorio ausente: cpf");
        }

        return AdmissionProcessRequestDto.builder()
                .cpf(cpf)
                .providerCnpj(ExcelValueParser.digits(row, "provider_cnpj"))
                .fullName(
                        mode == DataImportMode.INSERT
                                ? ExcelValueParser.requiredText(row, "nome_completo")
                                : ExcelValueParser.text(row, "nome_completo"))
                .socialName(ExcelValueParser.text(row, "nome_social"))
                .rg(ExcelValueParser.text(row, "rg"))
                .rgIssuer(ExcelValueParser.text(row, "rg_emissor"))
                .rgStateCode(ExcelValueParser.text(row, "rg_uf"))
                .birthDate(ExcelValueParser.date(row, "data_nascimento"))
                .gender(ExcelValueParser.enumValue(row, "sexo", GenderEnum.class))
                .maritalStatus(ExcelValueParser.enumValue(row, "estado_civil", MaritalStatusEnum.class))
                .motherName(ExcelValueParser.text(row, "nome_mae"))
                .fatherName(ExcelValueParser.text(row, "nome_pai"))
                .nationality(ExcelValueParser.text(row, "nacionalidade"))
                .pisPasep(ExcelValueParser.text(row, "pis_pasep"))
                .email(ExcelValueParser.text(row, "email"))
                .phone(ExcelValueParser.text(row, "telefone"))
                .zipCode(ExcelValueParser.text(row, "cep"))
                .street(ExcelValueParser.text(row, "logradouro"))
                .number(ExcelValueParser.text(row, "numero"))
                .complement(ExcelValueParser.text(row, "complemento"))
                .district(ExcelValueParser.text(row, "bairro"))
                .cityId(lookupHelper.cityIdByIbge(cityIbge))
                .stateId(lookupHelper.stateIdByUf(uf))
                .expectedStartDate(
                        mode == DataImportMode.INSERT
                                ? ExcelValueParser.requiredDate(row, "data_prevista_inicio")
                                : ExcelValueParser.date(row, "data_prevista_inicio"))
                .companyId(lookupHelper.companyIdByCode(companyCode))
                .departmentId(lookupHelper.departmentIdByCode(departmentCode))
                .jobPositionId(lookupHelper.jobPositionIdByCode(jobPositionCode))
                .contractType(
                        mode == DataImportMode.INSERT
                                ? ExcelValueParser.requiredEnum(row, "tipo_contrato", ContractTypeEnum.class)
                                : ExcelValueParser.enumValue(row, "tipo_contrato", ContractTypeEnum.class))
                .workScheduleId(lookupHelper.workScheduleIdByCode(scheduleCode))
                .baseSalary(ExcelValueParser.decimal(row, "salario_base"))
                .workloadSchedule(ExcelValueParser.text(row, "jornada"))
                .contractStartDate(ExcelValueParser.date(row, "data_inicio_contrato"))
                .contractEndDate(ExcelValueParser.date(row, "data_fim_contrato"))
                .experiencePeriod(ExcelValueParser.text(row, "periodo_experiencia"))
                .providerLegalName(ExcelValueParser.text(row, "razao_social_prestador"))
                .providerTradeName(ExcelValueParser.text(row, "nome_fantasia_prestador"))
                .notes(ExcelValueParser.text(row, "observacoes"))
                .build();
    }

    private void mergeForUpdate(AdmissionProcessRequestDto request, AdmissionProcessResponseDto existing) {
        if (!StringUtils.hasText(request.getCpf())) {
            request.setCpf(existing.getCpf());
        }
        if (!StringUtils.hasText(request.getFullName())) {
            request.setFullName(existing.getFullName());
        }
        if (request.getSocialName() == null) {
            request.setSocialName(existing.getSocialName());
        }
        if (request.getRg() == null) {
            request.setRg(existing.getRg());
        }
        if (request.getRgIssuer() == null) {
            request.setRgIssuer(existing.getRgIssuer());
        }
        if (request.getRgStateCode() == null) {
            request.setRgStateCode(existing.getRgStateCode());
        }
        if (request.getBirthDate() == null) {
            request.setBirthDate(existing.getBirthDate());
        }
        if (request.getGender() == null) {
            request.setGender(existing.getGender());
        }
        if (request.getMaritalStatus() == null) {
            request.setMaritalStatus(existing.getMaritalStatus());
        }
        if (request.getMotherName() == null) {
            request.setMotherName(existing.getMotherName());
        }
        if (request.getFatherName() == null) {
            request.setFatherName(existing.getFatherName());
        }
        if (request.getNationality() == null) {
            request.setNationality(existing.getNationality());
        }
        if (request.getPisPasep() == null) {
            request.setPisPasep(existing.getPisPasep());
        }
        if (request.getEmail() == null) {
            request.setEmail(existing.getEmail());
        }
        if (request.getPhone() == null) {
            request.setPhone(existing.getPhone());
        }
        if (request.getZipCode() == null) {
            request.setZipCode(existing.getZipCode());
        }
        if (request.getStreet() == null) {
            request.setStreet(existing.getStreet());
        }
        if (request.getNumber() == null) {
            request.setNumber(existing.getNumber());
        }
        if (request.getComplement() == null) {
            request.setComplement(existing.getComplement());
        }
        if (request.getDistrict() == null) {
            request.setDistrict(existing.getDistrict());
        }
        if (request.getCityId() == null) {
            request.setCityId(existing.getCityId());
        }
        if (request.getStateId() == null) {
            request.setStateId(existing.getStateId());
        }
        if (request.getExpectedStartDate() == null) {
            request.setExpectedStartDate(existing.getExpectedStartDate());
        }
        if (request.getCompanyId() == null) {
            request.setCompanyId(existing.getCompanyId());
        }
        if (request.getDepartmentId() == null) {
            request.setDepartmentId(existing.getDepartmentId());
        }
        if (request.getJobPositionId() == null) {
            request.setJobPositionId(existing.getJobPositionId());
        }
        if (request.getContractType() == null) {
            request.setContractType(existing.getContractType());
        }
        if (request.getBaseSalary() == null) {
            request.setBaseSalary(existing.getBaseSalary());
        }
        if (request.getWorkloadSchedule() == null) {
            request.setWorkloadSchedule(existing.getWorkloadSchedule());
        }
        if (request.getWorkScheduleId() == null) {
            request.setWorkScheduleId(existing.getWorkScheduleId());
        }
        if (request.getContractStartDate() == null) {
            request.setContractStartDate(existing.getContractStartDate());
        }
        if (request.getContractEndDate() == null) {
            request.setContractEndDate(existing.getContractEndDate());
        }
        if (request.getExperiencePeriod() == null) {
            request.setExperiencePeriod(existing.getExperiencePeriod());
        }
        if (request.getProviderCnpj() == null) {
            request.setProviderCnpj(existing.getProviderCnpj());
        }
        if (request.getProviderLegalName() == null) {
            request.setProviderLegalName(existing.getProviderLegalName());
        }
        if (request.getProviderTradeName() == null) {
            request.setProviderTradeName(existing.getProviderTradeName());
        }
        if (request.getNotes() == null) {
            request.setNotes(existing.getNotes());
        }
        if (request.getEmergencyContacts() == null) {
            request.setEmergencyContacts(existing.getEmergencyContacts());
        }
        request.setRecessEnabled(existing.isRecessEnabled());
        request.setRecessTotalDaysPerCycle(existing.getRecessTotalDaysPerCycle());
        request.setRecessCycleMonths(existing.getRecessCycleMonths());
        request.setRecessEligibilityAfterMonths(existing.getRecessEligibilityAfterMonths());
        request.setRecessFinancialMode(existing.getRecessFinancialMode());
        request.setRecessPaidPercentage(existing.getRecessPaidPercentage());
        request.setRecessAllowSplit(existing.isRecessAllowSplit());
        request.setRecessMaxSplitPeriods(existing.getRecessMaxSplitPeriods());
        request.setRecessMinimumSplitDays(existing.getRecessMinimumSplitDays());
        request.setRecessAdvanceNoticeDays(existing.getRecessAdvanceNoticeDays());
        request.setRecessNotes(existing.getRecessNotes());
        request.setAdmissionStatus(existing.getAdmissionStatus());
        request.setStartedAt(existing.getStartedAt());
        request.setPhotoObjectId(existing.getPhotoObjectId());
    }

    private static String matchKey(String cpf, String cnpj) {
        if (StringUtils.hasText(cpf) && StringUtils.hasText(cnpj)) {
            return "cpf=" + cpf + ";cnpj=" + cnpj;
        }
        if (StringUtils.hasText(cpf)) {
            return "cpf=" + cpf;
        }
        return "cnpj=" + (cnpj == null ? "" : cnpj);
    }
}
