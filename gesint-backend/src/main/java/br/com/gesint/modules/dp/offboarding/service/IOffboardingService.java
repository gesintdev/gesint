package br.com.gesint.modules.dp.offboarding.service;

import java.util.List;
import java.util.UUID;

import br.com.gesint.core.base.service.IBaseService;
import br.com.gesint.modules.dp.offboarding.dto.EsocialDismissalReasonDto;
import br.com.gesint.modules.dp.offboarding.dto.OffboardingAccountantPackageDto;
import br.com.gesint.modules.dp.offboarding.dto.OffboardingDemissionalPreviewDto;
import br.com.gesint.modules.dp.offboarding.dto.OffboardingRequestDto;
import br.com.gesint.modules.dp.offboarding.dto.OffboardingResponseDto;

public interface IOffboardingService extends IBaseService<OffboardingRequestDto, OffboardingResponseDto> {

    List<EsocialDismissalReasonDto> listEsocialDismissalReasons();

    OffboardingDemissionalPreviewDto demissionalPreview(UUID id);

    OffboardingResponseDto registerDemissionalWaiver(UUID id, String notes);

    OffboardingResponseDto conclude(UUID id);

    OffboardingAccountantPackageDto accountantPackagePreview(UUID id);

    OffboardingAccountantPackageDto sendAccountantPackage(UUID id);

    /** DRAFT de desligamento disparado pela decisão de encerrar experiência (RN-41 → RN-21). */
    OffboardingResponseDto createDraftForExperienceEnd(OffboardingRequestDto request);
}
