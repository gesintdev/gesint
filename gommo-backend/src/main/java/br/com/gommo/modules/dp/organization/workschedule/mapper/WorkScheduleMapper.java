package br.com.gommo.modules.dp.organization.workschedule.mapper;

import java.time.Duration;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import br.com.gommo.modules.dp.organization.workschedule.dto.WorkScheduleDayRequestDto;
import br.com.gommo.modules.dp.organization.workschedule.dto.WorkScheduleDayResponseDto;
import br.com.gommo.modules.dp.organization.workschedule.dto.WorkScheduleRequestDto;
import br.com.gommo.modules.dp.organization.workschedule.dto.WorkScheduleResponseDto;
import br.com.gommo.modules.dp.organization.workschedule.entity.WeekDayEnum;
import br.com.gommo.modules.dp.organization.workschedule.entity.WorkSchedule;
import br.com.gommo.modules.dp.organization.workschedule.entity.WorkScheduleDay;

@Component
public class WorkScheduleMapper {

    private static final DateTimeFormatter TIME_FMT = DateTimeFormatter.ofPattern("HH:mm");

    public WorkSchedule toEntity(WorkScheduleRequestDto dto) {
        WorkSchedule entity = WorkSchedule.builder()
                .name(dto.getName() != null ? dto.getName().trim() : null)
                .description(blankToNull(dto.getDescription()))
                .days(new ArrayList<>())
                .build();
        replaceDays(entity, dto.getDays());
        return entity;
    }

    public void updateEntity(WorkSchedule entity, WorkScheduleRequestDto dto) {
        entity.setName(dto.getName() != null ? dto.getName().trim() : entity.getName());
        entity.setDescription(blankToNull(dto.getDescription()));
        replaceDays(entity, dto.getDays());
    }

    public WorkScheduleResponseDto toResponse(WorkSchedule entity) {
        List<WorkScheduleDayResponseDto> days = entity.getDays() == null
                ? List.of()
                : entity.getDays().stream()
                        .sorted(Comparator.comparing(d -> d.getDayOfWeek().ordinal()))
                        .map(this::toDayResponse)
                        .toList();
        int weeklyMinutes = days.stream().mapToInt(d -> parseTotalMinutes(d.getTotalHours())).sum();
        return WorkScheduleResponseDto.builder()
                .id(entity.getId())
                .code(entity.getCode())
                .status(entity.getStatus())
                .name(entity.getName())
                .description(entity.getDescription())
                .days(days)
                .weeklyTotalHours(formatMinutes(weeklyMinutes))
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    private WorkScheduleDayResponseDto toDayResponse(WorkScheduleDay day) {
        int total = minutesBetween(day.getPeriod1Start(), day.getPeriod1End())
                + minutesBetween(day.getPeriod2Start(), day.getPeriod2End());
        String mainBreak = null;
        if (day.getPeriod1End() != null && day.getPeriod2Start() != null) {
            mainBreak = formatTime(day.getPeriod1End()) + " às " + formatTime(day.getPeriod2Start());
        }
        return WorkScheduleDayResponseDto.builder()
                .id(day.getId())
                .dayOfWeek(day.getDayOfWeek())
                .period1Start(formatTime(day.getPeriod1Start()))
                .period1End(formatTime(day.getPeriod1End()))
                .period2Start(formatTime(day.getPeriod2Start()))
                .period2End(formatTime(day.getPeriod2End()))
                .totalHours(formatMinutes(total))
                .mainBreak(mainBreak)
                .build();
    }

    /**
     * Reconciles days by weekday so updates reuse existing rows.
     * Avoids unique constraint violations on (work_schedule_id, day_of_week)
     * when Hibernate would otherwise INSERT before DELETE.
     */
    private void replaceDays(WorkSchedule entity, List<WorkScheduleDayRequestDto> dayDtos) {
        List<WorkScheduleDay> current = entity.getDays();
        if (current == null) {
            current = new ArrayList<>();
            entity.setDays(current);
        }

        Map<WeekDayEnum, WorkScheduleDay> byDay = new EnumMap<>(WeekDayEnum.class);
        for (WorkScheduleDay day : current) {
            if (day != null && day.getDayOfWeek() != null) {
                byDay.putIfAbsent(day.getDayOfWeek(), day);
            }
        }

        List<WorkScheduleDay> result = new ArrayList<>();
        if (dayDtos != null) {
            for (WorkScheduleDayRequestDto dayDto : dayDtos) {
                if (dayDto == null || dayDto.getDayOfWeek() == null) {
                    continue;
                }
                WorkScheduleDay day = byDay.get(dayDto.getDayOfWeek());
                if (day == null) {
                    day = WorkScheduleDay.builder()
                            .workSchedule(entity)
                            .dayOfWeek(dayDto.getDayOfWeek())
                            .build();
                }
                day.setWorkSchedule(entity);
                day.setDayOfWeek(dayDto.getDayOfWeek());
                day.setPeriod1Start(parseTime(dayDto.getPeriod1Start()));
                day.setPeriod1End(parseTime(dayDto.getPeriod1End()));
                day.setPeriod2Start(parseTime(dayDto.getPeriod2Start()));
                day.setPeriod2End(parseTime(dayDto.getPeriod2End()));
                result.add(day);
            }
        }

        current.clear();
        current.addAll(result);
    }

    private static LocalTime parseTime(String value) {
        if (!StringUtils.hasText(value)) {
            return null;
        }
        String normalized = value.trim().replace('.', ':');
        if (normalized.length() == 4 && normalized.charAt(1) == ':') {
            normalized = "0" + normalized;
        }
        return LocalTime.parse(normalized, TIME_FMT);
    }

    private static String formatTime(LocalTime time) {
        return time == null ? null : time.format(TIME_FMT);
    }

    private static int minutesBetween(LocalTime start, LocalTime end) {
        if (start == null || end == null || end.isBefore(start)) {
            return 0;
        }
        return (int) Duration.between(start, end).toMinutes();
    }

    private static String formatMinutes(int minutes) {
        int safe = Math.max(0, minutes);
        return String.format("%02d:%02d", safe / 60, safe % 60);
    }

    private static int parseTotalMinutes(String hhmm) {
        if (!StringUtils.hasText(hhmm) || !hhmm.contains(":")) {
            return 0;
        }
        String[] parts = hhmm.split(":");
        try {
            return Integer.parseInt(parts[0]) * 60 + Integer.parseInt(parts[1]);
        } catch (NumberFormatException ex) {
            return 0;
        }
    }

    private static String blankToNull(String value) {
        return StringUtils.hasText(value) ? value.trim() : null;
    }
}
