package br.com.gommo.modules.dp.offboarding.mapper;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Component;

import br.com.gommo.modules.dp.offboarding.dto.OffboardingChecklistItemDto;
import br.com.gommo.modules.dp.offboarding.dto.OffboardingRequestDto;
import br.com.gommo.modules.dp.offboarding.dto.OffboardingResponseDto;
import br.com.gommo.modules.dp.offboarding.entity.AccountantPackageStatusEnum;
import br.com.gommo.modules.dp.offboarding.entity.DismissalTypeEnum;
import br.com.gommo.modules.dp.offboarding.entity.Offboarding;
import br.com.gommo.modules.dp.offboarding.entity.OffboardingProcessStatusEnum;

@Component
public class OffboardingMapper {
    public Offboarding toEntity(OffboardingRequestDto dto) {
        return Offboarding.builder()
                .collaboratorId(dto.getCollaboratorId())
                .dismissalDate(dto.getDismissalDate())
                .dismissalType(
                        dto.getDismissalType() != null ? dto.getDismissalType() : DismissalTypeEnum.WITHOUT_CAUSE)
                .dismissalNotes(dto.getDismissalNotes())
                .homologationNotes(dto.getHomologationNotes())
                .processStatus(OffboardingProcessStatusEnum.DRAFT)
                .esocialDismissalReasonCode(trimToNull(dto.getEsocialDismissalReasonCode()))
                .lastWorkDay(dto.getLastWorkDay() != null ? dto.getLastWorkDay() : dto.getDismissalDate())
                .noticeType(dto.getNoticeType())
                .noticeDays(dto.getNoticeDays())
                .noticeStartDate(dto.getNoticeStartDate())
                .noticeEndDate(dto.getNoticeEndDate())
                .workloadReductionApplicable(Boolean.TRUE.equals(dto.getWorkloadReductionApplicable()))
                .exitChecklist(copyChecklist(dto.getExitChecklist()))
                .exitInterviewId(dto.getExitInterviewId())
                .accountantPackageStatus(AccountantPackageStatusEnum.PENDING)
                .demissionalWaiverRegistered(Boolean.TRUE.equals(dto.getDemissionalWaiverRegistered()))
                .demissionalWaiverNotes(dto.getDemissionalWaiverNotes())
                .build();
    }

    public void updateEntity(Offboarding entity, OffboardingRequestDto dto) {
        entity.setCollaboratorId(dto.getCollaboratorId());
        entity.setDismissalDate(dto.getDismissalDate());
        if (dto.getDismissalType() != null) {
            entity.setDismissalType(dto.getDismissalType());
        }
        entity.setDismissalNotes(dto.getDismissalNotes());
        entity.setHomologationNotes(dto.getHomologationNotes());
        entity.setEsocialDismissalReasonCode(trimToNull(dto.getEsocialDismissalReasonCode()));
        entity.setLastWorkDay(dto.getLastWorkDay() != null ? dto.getLastWorkDay() : dto.getDismissalDate());
        entity.setNoticeType(dto.getNoticeType());
        entity.setNoticeDays(dto.getNoticeDays());
        entity.setNoticeStartDate(dto.getNoticeStartDate());
        entity.setNoticeEndDate(dto.getNoticeEndDate());
        if (dto.getWorkloadReductionApplicable() != null) {
            entity.setWorkloadReductionApplicable(dto.getWorkloadReductionApplicable());
        }
        if (dto.getExitChecklist() != null) {
            entity.setExitChecklist(copyChecklist(dto.getExitChecklist()));
        }
        entity.setExitInterviewId(dto.getExitInterviewId());
        if (dto.getDemissionalWaiverRegistered() != null) {
            entity.setDemissionalWaiverRegistered(dto.getDemissionalWaiverRegistered());
        }
        entity.setDemissionalWaiverNotes(dto.getDemissionalWaiverNotes());
    }

    public OffboardingResponseDto toResponse(Offboarding entity) {
        return toResponse(entity, null);
    }

    public OffboardingResponseDto toResponse(Offboarding entity, String collaboratorName) {
        return OffboardingResponseDto.builder()
                .id(entity.getId())
                .code(entity.getCode())
                .status(entity.getStatus())
                .collaboratorId(entity.getCollaboratorId())
                .collaboratorName(collaboratorName)
                .dismissalDate(entity.getDismissalDate())
                .dismissalType(entity.getDismissalType())
                .dismissalNotes(entity.getDismissalNotes())
                .homologationNotes(entity.getHomologationNotes())
                .processStatus(
                        entity.getProcessStatus() != null
                                ? entity.getProcessStatus()
                                : OffboardingProcessStatusEnum.DRAFT)
                .esocialDismissalReasonCode(entity.getEsocialDismissalReasonCode())
                .esocialDismissalReasonLabel(entity.getEsocialDismissalReasonLabel())
                .lastWorkDay(entity.getLastWorkDay())
                .noticeType(entity.getNoticeType())
                .noticeDays(entity.getNoticeDays())
                .noticeStartDate(entity.getNoticeStartDate())
                .noticeEndDate(entity.getNoticeEndDate())
                .workloadReductionApplicable(entity.isWorkloadReductionApplicable())
                .exitChecklist(copyChecklist(entity.getExitChecklist()))
                .exitInterviewId(entity.getExitInterviewId())
                .accountantPackageStatus(
                        entity.getAccountantPackageStatus() != null
                                ? entity.getAccountantPackageStatus()
                                : AccountantPackageStatusEnum.PENDING)
                .accountantPackageSentAt(entity.getAccountantPackageSentAt())
                .accountantPackageDetail(entity.getAccountantPackageDetail())
                .demissionalWaiverRegistered(entity.isDemissionalWaiverRegistered())
                .demissionalWaiverNotes(entity.getDemissionalWaiverNotes())
                .completedAt(entity.getCompletedAt())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    private static List<OffboardingChecklistItemDto> copyChecklist(List<OffboardingChecklistItemDto> source) {
        if (source == null || source.isEmpty()) {
            return new ArrayList<>();
        }
        List<OffboardingChecklistItemDto> copy = new ArrayList<>(source.size());
        for (OffboardingChecklistItemDto item : source) {
            if (item == null) {
                continue;
            }
            copy.add(OffboardingChecklistItemDto.builder()
                    .key(item.getKey())
                    .description(item.getDescription())
                    .category(item.getCategory())
                    .status(item.getStatus())
                    .returnedAt(item.getReturnedAt())
                    .notes(item.getNotes())
                    .build());
        }
        return copy;
    }

    private static String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
