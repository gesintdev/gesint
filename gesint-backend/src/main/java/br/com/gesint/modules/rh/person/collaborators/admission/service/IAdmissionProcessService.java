package br.com.gesint.modules.rh.person.collaborators.admission.service;

import br.com.gesint.core.base.service.IBaseService;
import br.com.gesint.modules.rh.person.collaborators.admission.dto.AdmissionProcessRequestDto;
import br.com.gesint.modules.rh.person.collaborators.admission.dto.AdmissionProcessResponseDto;

public interface IAdmissionProcessService
        extends IBaseService<AdmissionProcessRequestDto, AdmissionProcessResponseDto> {}
