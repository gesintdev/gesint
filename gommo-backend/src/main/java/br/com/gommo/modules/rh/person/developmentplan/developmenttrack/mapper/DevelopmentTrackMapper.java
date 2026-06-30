package br.com.gommo.modules.rh.person.developmentplan.developmenttrack.mapper;

import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

import br.com.gommo.modules.rh.person.developmentplan.developmenttrack.dto.DevelopmentTrackCompetencyItemDto;
import br.com.gommo.modules.rh.person.developmentplan.developmenttrack.dto.DevelopmentTrackRequestDto;
import br.com.gommo.modules.rh.person.developmentplan.developmenttrack.dto.DevelopmentTrackResponseDto;
import br.com.gommo.modules.rh.person.developmentplan.developmenttrack.entity.DevelopmentTrack;
import br.com.gommo.modules.rh.person.developmentplan.developmenttrack.entity.DevelopmentTrackCompetency;

@Component
public class DevelopmentTrackMapper {

    public DevelopmentTrack toEntity(DevelopmentTrackRequestDto dto) {
        DevelopmentTrack entity = DevelopmentTrack.builder()
                .name(dto.getName())
                .description(dto.getDescription())
                .build();
        reconcileCompetencies(entity, dto.getCompetencies());
        return entity;
    }

    public void updateEntity(DevelopmentTrack entity, DevelopmentTrackRequestDto dto) {
        entity.setName(dto.getName());
        entity.setDescription(dto.getDescription());
        reconcileCompetencies(entity, dto.getCompetencies());
    }

    public DevelopmentTrackResponseDto toResponse(DevelopmentTrack entity) {
        List<DevelopmentTrackCompetencyItemDto> items =
                entity.getCompetencies().stream().map(this::toItem).toList();
        return DevelopmentTrackResponseDto.builder()
                .id(entity.getId())
                .code(entity.getCode())
                .status(entity.getStatus())
                .name(entity.getName())
                .description(entity.getDescription())
                .competencies(items)
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    private DevelopmentTrackCompetencyItemDto toItem(DevelopmentTrackCompetency child) {
        return DevelopmentTrackCompetencyItemDto.builder()
                .id(child.getId())
                .competencyId(child.getCompetencyId())
                .competencyName(child.getCompetencyName())
                .expectedLevelId(child.getExpectedLevelId())
                .expectedLevelOrder(child.getExpectedLevelOrder())
                .required(child.getRequired())
                .weight(child.getWeight())
                .build();
    }

    /**
     * Reconciles the child collection by id (keeps ids stable across saves): updates existing,
     * creates new and lets orphanRemoval delete the missing ones.
     */
    private void reconcileCompetencies(DevelopmentTrack entity, List<DevelopmentTrackCompetencyItemDto> items) {
        List<DevelopmentTrackCompetency> current = entity.getCompetencies();
        Map<UUID, DevelopmentTrackCompetency> byId = current.stream()
                .filter(c -> c.getId() != null)
                .collect(Collectors.toMap(DevelopmentTrackCompetency::getId, Function.identity()));
        List<DevelopmentTrackCompetency> result = new ArrayList<>();
        if (items != null) {
            for (DevelopmentTrackCompetencyItemDto item : items) {
                DevelopmentTrackCompetency child = item.getId() != null ? byId.get(item.getId()) : null;
                if (child == null) {
                    child = new DevelopmentTrackCompetency();
                }
                child.setTrack(entity);
                child.setCompetencyId(item.getCompetencyId());
                child.setCompetencyName(item.getCompetencyName());
                child.setExpectedLevelId(item.getExpectedLevelId());
                child.setExpectedLevelOrder(item.getExpectedLevelOrder());
                child.setRequired(item.getRequired() != null && item.getRequired());
                child.setWeight(item.getWeight());
                result.add(child);
            }
        }
        current.clear();
        current.addAll(result);
    }
}
