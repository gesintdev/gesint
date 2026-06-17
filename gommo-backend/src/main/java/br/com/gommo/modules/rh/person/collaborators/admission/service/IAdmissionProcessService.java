package br.com.gommo.modules.rh.person.collaborators.admission.service;

import br.com.gommo.core.base.service.IBaseService;
import br.com.gommo.modules.rh.person.collaborators.admission.dto.AdmissionProcessRequestDto;
import br.com.gommo.modules.rh.person.collaborators.admission.dto.AdmissionProcessResponseDto;

public interface IAdmissionProcessService
        extends IBaseService<AdmissionProcessRequestDto, AdmissionProcessResponseDto> {}
