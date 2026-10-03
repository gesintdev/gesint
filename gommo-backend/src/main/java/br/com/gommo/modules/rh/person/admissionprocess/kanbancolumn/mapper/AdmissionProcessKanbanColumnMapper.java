package br.com.gommo.modules.rh.person.admissionprocess.kanbancolumn.mapper;

import org.springframework.stereotype.Component;

import br.com.gommo.modules.rh.person.admissionprocess.kanbancolumn.dto.AdmissionProcessKanbanColumnRequestDto;
import br.com.gommo.modules.rh.person.admissionprocess.kanbancolumn.dto.AdmissionProcessKanbanColumnResponseDto;
import br.com.gommo.modules.rh.person.admissionprocess.kanbancolumn.entity.AdmissionProcessKanbanColumn;
import br.com.gommo.modules.rh.person.admissionprocess.kanbancolumn.entity.KanbanColumnActionEnum;

@Component
public class AdmissionProcessKanbanColumnMapper {

    public AdmissionProcessKanbanColumn toEntity(AdmissionProcessKanbanColumnRequestDto dto) {
        return AdmissionProcessKanbanColumn.builder()
                .columnKey(normalizeKey(dto.getColumnKey()))
                .name(trimToNull(dto.getName()))
                .color(normalizeColor(dto.getColor()))
                .displayOrder(dto.getDisplayOrder())
                .slaEnabled(resolveSlaEnabled(dto.getSlaEnabled(), true))
                .slaBusinessDays(resolveSlaBusinessDays(dto.getSlaBusinessDays(), 5))
                .interviewColumn(resolveFlag(dto.getInterviewColumn(), false))
                .columnAction(resolveAction(dto.getColumnAction(), KanbanColumnActionEnum.NONE))
                .build();
    }

    public void updateEntity(AdmissionProcessKanbanColumn entity, AdmissionProcessKanbanColumnRequestDto dto) {
        entity.setColumnKey(normalizeKey(dto.getColumnKey()));
        entity.setName(trimToNull(dto.getName()));
        entity.setColor(normalizeColor(dto.getColor()));
        entity.setDisplayOrder(dto.getDisplayOrder());
        if (!entity.isSystemColumn()) {
            entity.setSlaEnabled(resolveSlaEnabled(dto.getSlaEnabled(), entity.isSlaEnabled()));
            entity.setSlaBusinessDays(
                    resolveSlaBusinessDays(dto.getSlaBusinessDays(), entity.getSlaBusinessDays()));
            entity.setInterviewColumn(resolveFlag(dto.getInterviewColumn(), entity.isInterviewColumn()));
            entity.setColumnAction(resolveAction(dto.getColumnAction(), entity.getColumnAction()));
        } else {
            entity.setColumnAction(KanbanColumnActionEnum.NONE);
        }
    }

    public AdmissionProcessKanbanColumnResponseDto toResponse(AdmissionProcessKanbanColumn entity) {
        return AdmissionProcessKanbanColumnResponseDto.builder()
                .id(entity.getId())
                .code(entity.getCode())
                .status(entity.getStatus())
                .columnKey(entity.getColumnKey())
                .name(entity.getName())
                .color(entity.getColor())
                .displayOrder(entity.getDisplayOrder())
                .systemColumn(entity.isSystemColumn())
                .slaEnabled(entity.isSlaEnabled())
                .slaBusinessDays(entity.getSlaBusinessDays())
                .interviewColumn(entity.isInterviewColumn())
                .columnAction(
                        entity.getColumnAction() != null
                                ? entity.getColumnAction()
                                : KanbanColumnActionEnum.NONE)
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    private String normalizeKey(String value) {
        return value == null ? null : value.trim().toLowerCase();
    }

    private String normalizeColor(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        if (trimmed.isEmpty()) return null;
        return trimmed.toUpperCase();
    }

    private String trimToNull(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private static boolean resolveSlaEnabled(Boolean requested, boolean fallback) {
        return resolveFlag(requested, fallback);
    }

    private static boolean resolveFlag(Boolean requested, boolean fallback) {
        return requested != null ? requested : fallback;
    }

    private static KanbanColumnActionEnum resolveAction(
            KanbanColumnActionEnum requested, KanbanColumnActionEnum fallback) {
        return requested != null
                ? requested
                : (fallback != null ? fallback : KanbanColumnActionEnum.NONE);
    }

    private static int resolveSlaBusinessDays(Integer requested, Integer fallback) {
        int base = requested != null ? requested : (fallback != null ? fallback : 5);
        return Math.max(1, Math.min(90, base));
    }
}
