package br.com.gommo.modules.rh.person.leave.mapper;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalDate;
import java.util.UUID;

import org.junit.jupiter.api.Test;

import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.rh.person.leave.dto.LeaveRequestRequestDto;

class LeaveRequestMapperTest {

    private final LeaveRequestMapper mapper = new LeaveRequestMapper();

    @Test
    void toEntitySetsActiveStatusForNewRequest() {
        LeaveRequestRequestDto request = LeaveRequestRequestDto.builder()
                .collaboratorId(UUID.randomUUID())
                .startDate(LocalDate.of(2026, 6, 22))
                .endDate(LocalDate.of(2026, 7, 21))
                .build();

        assertThat(mapper.toEntity(request).getStatus()).isEqualTo(StatusEnum.ACTIVE);
    }
}
