package br.com.gommo.modules.dp.organization.workschedule.entity;

import java.time.LocalTime;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "work_schedule_day")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkScheduleDay {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "work_schedule_id", nullable = false)
    private WorkSchedule workSchedule;

    @Enumerated(EnumType.STRING)
    @Column(name = "day_of_week", nullable = false, length = 16)
    private WeekDayEnum dayOfWeek;

    @Column(name = "period1_start")
    private LocalTime period1Start;

    @Column(name = "period1_end")
    private LocalTime period1End;

    @Column(name = "period2_start")
    private LocalTime period2Start;

    @Column(name = "period2_end")
    private LocalTime period2End;
}
